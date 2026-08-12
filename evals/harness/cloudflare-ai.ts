import { createHarness, createJudgeHarness } from "vitest-evals";

interface WorkersAiMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

interface WorkersAiResponse {
	result?: {
		response?: string;
		choices?: Array<{
			finish_reason?: string;
			message?: {
				content?: string;
				reasoning_content?: string;
				role?: string;
			};
		}>;
	};
	errors?: Array<{ message: string }>;
}

export interface ComponentGenerationInput {
	task: string;
	context: string;
	expectedValues: string[];
	expectedLabels: string[];
}

// Prefer Cloudflare AI Gateway with the same org-level secrets that Bonk uses.
// This keeps eval credentials separate from personal API keys and gives us
// observability, caching, and rate limiting through the gateway.
// For local convenience, fall back to direct Workers AI credentials.
const gatewayAccountId = process.env.CF_AI_GATEWAY_ACCOUNT_ID;
const gatewayId = process.env.CF_AI_GATEWAY_NAME;
const gatewayToken = process.env.CF_AI_GATEWAY_TOKEN;

const directAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const directApiKey = process.env.CLOUDFLARE_API_KEY;

const model =
	process.env.KUMO_EVAL_MODEL ?? "@cf/moonshotai/kimi-k2.7-code";

function hasGatewayCredentials(): boolean {
	return Boolean(gatewayAccountId && gatewayId && gatewayToken);
}

function hasDirectCredentials(): boolean {
	return Boolean(directAccountId && directApiKey);
}

async function callWorkersAi(
	messages: WorkersAiMessage[],
	signal?: AbortSignal,
): Promise<string> {
	let url: string;
	let authorization: string;

	if (hasGatewayCredentials()) {
		url = `https://gateway.ai.cloudflare.com/v1/${gatewayAccountId}/${gatewayId}/workers-ai/${model}`;
		authorization = `Bearer ${gatewayToken}`;
	} else if (hasDirectCredentials()) {
		url = `https://api.cloudflare.com/client/v4/accounts/${directAccountId}/ai/run/${model}`;
		authorization = `Bearer ${directApiKey}`;
	} else {
		throw new Error(
			"Evals require either CF_AI_GATEWAY_ACCOUNT_ID/CF_AI_GATEWAY_NAME/CF_AI_GATEWAY_TOKEN (preferred) or CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_KEY.",
		);
	}

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization,
		},
		body: JSON.stringify({ messages, temperature: 0.1, max_tokens: 900 }),
		signal,
	});

	const body = (await response.json()) as WorkersAiResponse;

	if (!response.ok || body.errors?.length) {
		throw new Error(
			`Workers AI request failed: ${response.status} ${JSON.stringify(body.errors)}`,
		);
	}

	const text =
		body.result?.response ??
		body.result?.choices?.[0]?.message?.content ??
		"";
	if (!text) {
		throw new Error("Workers AI returned an empty response");
	}
	return text;
}

const systemPrompt = `You are a React expert writing components with @cloudflare/kumo.

Rules:
- Import Select with \`import { Select } from "@cloudflare/kumo";\`.
- Prefer the \`items\` prop for value/label options.
- Use \`label\` for a visible label or \`aria-label\` when there is no visible label.
- Use \`placeholder\` for the empty state.
- Use \`value\` and \`onValueChange\` for controlled state.
- Do not use \`SelectTrigger\`, \`SelectValue\`, \`SelectContent\`, or \`SelectItem\`; those are not Kumo's Select API.
- Do not use \`Select.Option\` children when labels differ from values unless you also pass \`renderValue\`.
- When a task asks for a placeholder or empty/unfiltered state, initialize controlled Select state to \`null\` or \`""\`; do not initialize it to one of the option values.
- Return only TSX code, with no explanation or thinking text.`;

export const componentGenerationHarness = createHarness<
	ComponentGenerationInput,
	string
>({
	name: "kumo-component-generation",
	run: async ({ input, signal, setArtifact }) => {
		const response = await callWorkersAi(
			[
				{ role: "system", content: systemPrompt },
				{ role: "user", content: input.context },
				{
					role: "user",
					content: `Write a complete, self-contained React component using @cloudflare/kumo Select for this task:\n\n${input.task}`,
				},
			],
			signal,
		);

		setArtifact("task", input.task);
		setArtifact("expectedValues", input.expectedValues);
		setArtifact("expectedLabels", input.expectedLabels);

		return {
			output: response,
			events: [
				{ type: "message", role: "user", content: input.task },
				{ type: "message", role: "assistant", content: response },
			],
			usage: { provider: "cloudflare", model },
		};
	},
});

export const judgeHarness = createJudgeHarness({
	name: "kumo-judge-model",
	run: async ({ prompt }, { signal }) => {
		const response = await callWorkersAi(
			[{ role: "user", content: prompt }],
			signal,
		);
		return response;
	},
});
