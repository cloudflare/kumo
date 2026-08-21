import { describeEval } from "vitest-evals";
import { expect } from "vite-plus/test";
import { assertSelectOutput } from "./assertions/select.js";
import { buildSelectContext } from "./context/select.js";
import { componentGenerationHarness } from "./harness/cloudflare-ai.js";

const context = buildSelectContext();

interface SelectEvalCase {
  name: string;
  task: string;
  expectedValues: string[];
  expectedLabels: string[];
}

const cases: SelectEvalCase[] = [
  {
    name: "labeled-values sort field",
    task: "Create a controlled select for choosing a sort field. The selected values should be name, location, and createdAt, while users should see Name, Location, and Created At. Include an empty-state placeholder.",
    expectedValues: ["name", "location", "createdAt"],
    expectedLabels: ["Name", "Location", "Created At"],
  },
  {
    name: "labeled-values issue type",
    task: "Create a controlled Select for choosing an issue type. Store bug, feature_request, or docs in state, but display Bug, Feature Request, and Documentation to users. Include a visible label and placeholder.",
    expectedValues: ["bug", "feature_request", "docs"],
    expectedLabels: ["Bug", "Feature Request", "Documentation"],
  },
  {
    name: "placeholder-empty-state deployment region",
    task: "Create a controlled Select for choosing a deployment region. Store iad, sfo, ams, and sin, but display US East (IAD), US West (SFO), Europe (AMS), and Asia Pacific (SIN). Do not preselect a region; show a placeholder instead.",
    expectedValues: ["iad", "sfo", "ams", "sin"],
    expectedLabels: [
      "US East (IAD)",
      "US West (SFO)",
      "Europe (AMS)",
      "Asia Pacific (SIN)",
    ],
  },
  {
    name: "uppercase-values dns record types",
    task: "Create a controlled Select for filtering DNS record types. Store A, AAAA, CNAME, and TXT exactly as the selected values, display A, AAAA, CNAME, and TXT as the labels, and include a placeholder for the unfiltered state.",
    expectedValues: ["A", "AAAA", "CNAME", "TXT"],
    expectedLabels: ["A", "AAAA", "CNAME", "TXT"],
  },
  {
    name: "wrong-api-trap api token scope",
    task: "Create a controlled Select for choosing an API token scope. Store read_only, write_only, and admin, while displaying Read only, Write only, and Administrator. Include a label and placeholder, and do not use child option elements.",
    expectedValues: ["read_only", "write_only", "admin"],
    expectedLabels: ["Read only", "Write only", "Administrator"],
  },
  {
    name: "wrong-api-trap retention period",
    task: "Create a controlled Select for choosing a retention period. Store 7d, 30d, 90d, and 1y, while displaying 7 days, 30 days, 90 days, and 1 year. Include an empty-state placeholder and avoid Radix or shadcn Select subcomponents.",
    expectedValues: ["7d", "30d", "90d", "1y"],
    expectedLabels: ["7 days", "30 days", "90 days", "1 year"],
  },
  {
    name: "placeholder-empty-state billing cycle",
    task: "Create a controlled Select for choosing a billing cycle. Store monthly, annual, and enterprise_contract, while displaying Monthly, Annual, and Enterprise Contract. The initial state should be empty so the placeholder is visible.",
    expectedValues: ["monthly", "annual", "enterprise_contract"],
    expectedLabels: ["Monthly", "Annual", "Enterprise Contract"],
  },
  {
    name: "wrong-api-trap log destination",
    task: "Create a controlled Select for choosing a log destination. Store r2, http, s3, and azure_blob, while displaying R2 bucket, HTTP endpoint, Amazon S3, and Azure Blob Storage. Use the Kumo items API rather than compound children. Initialize the controlled state empty so the placeholder is visible.",
    expectedValues: ["r2", "http", "s3", "azure_blob"],
    expectedLabels: [
      "R2 bucket",
      "HTTP endpoint",
      "Amazon S3",
      "Azure Blob Storage",
    ],
  },
];

describeEval(
  "Kumo Select usage evals",
  {
    harness: componentGenerationHarness,
  },
  (itEval) => {
    itEval.for(cases)(
      "$name",
      async ({ task, expectedValues, expectedLabels }, { run }) => {
        const result = await run({
          task,
          context,
          expectedValues,
          expectedLabels,
        });

        const generated = result.output;
        expect(generated).toBeTruthy();

        const assertion = assertSelectOutput(
          generated,
          expectedValues,
          expectedLabels,
        );

        expect(assertion.pass, assertion.reason).toBe(true);
      },
    );
  },
);
