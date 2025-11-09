/**
 * API Route for AI Code Generation
 * 
 * Handles requests to generate component code using OpenAI
 */

import type { ActionFunctionArgs } from "react-router";
import OpenAI from "openai";
import { generateAIContext, extractRequiredImports } from "~/lib/component-registry";

// Initialize OpenAI client
function getOpenAIClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  
  return new OpenAI({ apiKey });
}

interface GenerateRequest {
  prompt: string;
  context?: string;
}

interface GenerateResponse {
  success: boolean;
  code?: string;
  imports?: string[];
  error?: string;
}

/**
 * System prompt for the AI to generate Kumo component code
 */
const SYSTEM_PROMPT = `You are an expert React developer specializing in the Kumo component library.

Your task is to generate clean, functional React/JSX code using the Kumo components provided in the context.

CRITICAL RULES:
1. PREFER components from the Kumo library that are listed in the context
2. If a component you need is NOT in the list, create a simple inline version using basic HTML + Tailwind
3. Generate ONLY the JSX code - no imports, no function wrapper, no explanations, no markdown
4. Use proper TypeScript/JSX syntax
5. Include proper event handlers (use empty functions like () => {} for demos)
6. Use realistic placeholder data
7. Make the UI look good with proper spacing and layout
8. Use Tailwind CSS classes extensively (flex, grid, gap, padding, rounded-lg, shadow, etc.)
9. If icons are needed, use ones from @phosphor-icons/react (PlusIcon, XIcon, CheckIcon, InfoIcon, etc.)
10. For interactive components with state, use React hooks directly
11. Return ONLY the JSX body, nothing else

IMPORTANT: Your response should be ONLY the JSX code that goes INSIDE the component return statement.
Do NOT include: imports, function declarations, export statements, or markdown code blocks.

KUMO LAYOUTS & PATTERNS - USE THESE:

CRITICAL: 
- Use ResourceListPage layout for list pages (Workers, Zones, DNS records, etc.)
- Use LayerCard for resource list items (it has a header + content section with layered styling)
- Use Surface for simple cards and stats (NOT ring/ring-neutral classes)
- Use divide-y for rows inside LayerCard content

1. RESOURCE LIST PAGE LAYOUT:
<ResourceListPage
  title="Workers & Pages"
  description="Build & deploy serverless functions, sites, and full-stack applications."
  usage={
    <div className="grid grid-cols-2 gap-3">
      <Surface className="p-4">
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Requests</div>
        <div className="text-2xl font-semibold">22.1M</div>
      </Surface>
    </div>
  }
>
  {/* List content here */}
</ResourceListPage>

2. LIST ITEMS (use LayerCard for resource lists):
<div className="flex flex-col gap-4">
  <LayerCard title="worker-name" href="/worker">
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-neutral-500">Route</span>
        <span className="text-sm">*.example.com/*</span>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-neutral-500">Requests</span>
        <span className="text-sm">680k</span>
      </div>
    </div>
  </LayerCard>
</div>

Alternative: Simple list with Surface (for non-card layouts):
<div className="flex flex-col gap-3">
  <Surface className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
    <div className="flex items-center gap-3">
      <span className="text-blue-600 dark:text-blue-500">⚡</span>
      <div className="flex-1">
        <div className="font-medium">worker-name</div>
        <div className="text-sm text-neutral-500">*.example.com/*</div>
      </div>
      <span className="text-sm text-neutral-500">1h ago</span>
    </div>
  </Surface>
</div>

3. EMPTY STATE:
<Empty
  icon={<span className="text-4xl">📦</span>}
  title="No workers yet"
  description="Get started by creating your first worker"
  commandLine="npm create cloudflare@latest"
  contents={<Button variant="primary">Create Worker</Button>}
/>

4. STATS CARDS (in sidebar):
<div className="grid grid-cols-2 gap-3">
  <Surface className="p-4">
    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Metric Name</div>
    <div className="text-2xl font-semibold">22.1M</div>
  </Surface>
</div>

5. SEARCH + FILTERS:
<div className="flex gap-3">
  <Input placeholder="Search..." className="flex-1" />
  <Select className="w-32">
    <Select.Option value="all">Show all</Select.Option>
  </Select>
  <Button variant="secondary" shape="square">↻</Button>
</div>

6. DETAILS CARD (use Surface):
<Surface className="divide-y divide-neutral-200 dark:divide-neutral-800">
  <div className="flex justify-between items-center px-4 py-3">
    <span className="text-neutral-500">Account ID</span>
    <span className="font-mono text-sm">abc123</span>
  </div>
  <div className="flex justify-between items-center px-4 py-3">
    <span className="text-neutral-500">Status</span>
    <span>Active</span>
  </div>
</Surface>

Example simple response:
<div className="flex flex-col gap-4 max-w-md">
  <Button variant="primary">Add Item</Button>
  <Input placeholder="Enter name..." />
</div>

Example with state hooks:
<div className="flex flex-col gap-4 max-w-md">
  {(() => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    return (
      <>
        <Field label="Email">
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com" 
          />
        </Field>
        <Field label="Password">
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
          />
        </Field>
        <Button variant="primary">Sign In</Button>
      </>
    );
  })()}
</div>

Example with multiple elements:
<div className="space-y-6 max-w-2xl">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">Settings</h2>
    <Button variant="primary">Save</Button>
  </div>
  
  <Surface className="p-6">
    <Field label="Name">
      <Input placeholder="Your name" />
    </Field>
  </Surface>
  
  <div className="flex items-center gap-2">
    <Checkbox label="Enable notifications" />
  </div>
</div>

FULL EXAMPLE - Workers page using ResourceListPage + LayerCard:
<ResourceListPage
  title="Workers & Pages"
  description="Build & deploy serverless functions, sites, and full-stack applications."
  usage={
    <>
      <h2 className="font-semibold! text-xl mb-4">Usage</h2>
      <div className="grid grid-cols-2 gap-3">
        <Surface className="p-4">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Standard requests</div>
          <div className="text-2xl font-semibold">22.1M</div>
        </Surface>
        <Surface className="p-4">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">CPU time</div>
          <div className="text-2xl font-semibold">863,729,100 ms</div>
        </Surface>
      </div>
    </>
  }
>
  <div className="flex flex-col gap-4">
    {/* Search + Filters */}
    <div className="flex gap-3">
      <Input placeholder="Search workers" className="flex-1" />
      <Select className="w-32"><Select.Option value="all">Show all</Select.Option></Select>
      <Button variant="secondary" shape="square">↻</Button>
    </div>

    {/* List using LayerCard */}
    <div className="flex flex-col gap-4">
      <LayerCard title="workers-cloudflare-com-remix" href="/worker/1">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Route</span>
            <span className="text-sm">*.workers.dev/*</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Requests (24h)</span>
            <span className="text-sm">680k</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Last deployed</span>
            <span className="text-sm">1h ago</span>
          </div>
        </div>
      </LayerCard>
      
      <LayerCard title="api-gateway" href="/worker/2">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Route</span>
            <span className="text-sm">api.example.com/*</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Requests (24h)</span>
            <span className="text-sm">1.2M</span>
          </div>
        </div>
      </LayerCard>
    </div>
  </div>
</ResourceListPage>`;

/**
 * Cleans up AI response to extract just the code
 */
function cleanAIResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```(?:tsx?|jsx?|typescript|javascript)?\n?/gm, "");
  cleaned = cleaned.replace(/\n?```$/gm, "");
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Remove import statements (we'll add them back)
  cleaned = cleaned.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
  
  return cleaned;
}

/**
 * Validates the generated code
 */
function validateGeneratedCode(code: string): { valid: boolean; error?: string } {
  // Check if code is empty
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Generated code is empty" };
  }
  
  // Check for basic JSX structure
  if (!code.includes("<") || !code.includes(">")) {
    return { valid: false, error: "Generated code does not contain JSX" };
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /eval\(/,
    /Function\(/,
    /document\./,
    /window\./,
    /localStorage/,
    /sessionStorage/,
    /fetch\(/,
    /XMLHttpRequest/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return { 
        valid: false, 
        error: `Generated code contains potentially unsafe pattern: ${pattern.source}` 
      };
    }
  }
  
  return { valid: true };
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    // Get API key from Cloudflare environment
    const apiKey = context.cloudflare.env.OPENAI_API_KEY;
    
    // Parse request body
    const body = await request.json() as GenerateRequest;
    const { prompt } = body;
    
    if (!prompt || prompt.trim().length === 0) {
      return Response.json({
        success: false,
        error: "Prompt is required",
      } as GenerateResponse, { status: 400 });
    }
    
    // Get component context
    const componentContext = generateAIContext();
    
    // Initialize OpenAI
    const openai = getOpenAIClient(apiKey);
    
    // Generate code
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "system",
          content: `Here are the available components:\n\n${componentContext}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const generatedCode = completion.choices[0]?.message?.content;
    
    if (!generatedCode) {
      return Response.json({
        success: false,
        error: "AI did not generate any code",
      } as GenerateResponse, { status: 500 });
    }
    
    // Clean up the response
    const cleanedCode = cleanAIResponse(generatedCode);
    
    // Validate the code
    const validation = validateGeneratedCode(cleanedCode);
    if (!validation.valid) {
      return Response.json({
        success: false,
        error: validation.error,
      } as GenerateResponse, { status: 400 });
    }
    
    // Extract required imports
    const imports = extractRequiredImports(cleanedCode);
    
    return Response.json({
      success: true,
      code: cleanedCode,
      imports,
    } as GenerateResponse);
    
  } catch (error) {
    console.error("Error generating code:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return Response.json({
      success: false,
      error: errorMessage,
    } as GenerateResponse, { status: 500 });
  }
}

// Prevent GET requests
export async function loader() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
