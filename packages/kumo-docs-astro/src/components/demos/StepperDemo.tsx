import {
  Checkbox,
  Input,
  InputArea,
  Radio,
  Select,
  Stepper,
  Text,
} from "@cloudflare/kumo";
import {
  BuildingsIcon,
  CreditCardIcon,
  GearIcon,
  RocketLaunchIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

/**
 * Hero demo — a realistic "Create a project" wizard. Each step carries real
 * form fields so the layered, accordion-style layout reads the way it would in
 * production.
 */
export function StepperHeroDemo() {
  return (
    <div className="w-full max-w-2xl">
      <Stepper.Root>
        <Stepper.Step>
          <Stepper.Header icon={<BuildingsIcon />}>
            Project details
          </Stepper.Header>
          <Stepper.Panel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Project name" placeholder="acme-web" />
              <Select
                label="Environment"
                placeholder="Choose…"
                items={{
                  production: "Production",
                  staging: "Staging",
                  development: "Development",
                }}
              />
              <div className="sm:col-span-2">
                <InputArea
                  label="Description"
                  placeholder="What does this project do?"
                />
              </div>
            </div>
            <Stepper.Footer>
              <Stepper.Back hideOnFirst />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<UsersIcon />}>Team access</Stepper.Header>
          <Stepper.Panel>
            <div className="space-y-4">
              <Input
                label="Invite teammates"
                placeholder="name@company.com"
              />
              <Radio.Group legend="Default role" defaultValue="developer">
                <Radio.Item
                  value="admin"
                  label="Admin — full access to settings and billing"
                />
                <Radio.Item
                  value="developer"
                  label="Developer — deploy and manage resources"
                />
                <Radio.Item value="viewer" label="Viewer — read-only access" />
              </Radio.Group>
            </div>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<GearIcon />}>Configuration</Stepper.Header>
          <Stepper.Panel>
            <div className="space-y-3">
              <Checkbox label="Enable automatic deployments from main" />
              <Checkbox label="Require pull-request reviews" />
              <Checkbox label="Enable preview environments" />
            </div>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<RocketLaunchIcon />}>
            Review &amp; deploy
          </Stepper.Header>
          <Stepper.Panel>
            <div className="rounded-lg bg-kumo-tint p-4">
              <Text>
                You're all set. Creating your project will provision resources
                and run the first deployment.
              </Text>
            </div>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next finishLabel="Create project" />
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>
      </Stepper.Root>
    </div>
  );
}

/**
 * Horizontal demo — the same wizard state machine laid out as a top rail with
 * the active step's panel below. Just `orientation="horizontal"`.
 */
export function StepperHorizontalDemo() {
  return (
    <div className="w-full max-w-2xl">
      <Stepper.Root orientation="horizontal">
        <Stepper.Step>
          <Stepper.Header icon={<BuildingsIcon />}>Details</Stepper.Header>
          <Stepper.Panel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Project name" placeholder="acme-web" />
              <Select
                label="Environment"
                placeholder="Choose…"
                items={{ production: "Production", staging: "Staging" }}
              />
            </div>
            <Stepper.Footer>
              <Stepper.Back hideOnFirst />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<UsersIcon />}>Team</Stepper.Header>
          <Stepper.Panel>
            <Input label="Invite teammates" placeholder="name@company.com" />
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<RocketLaunchIcon />}>Deploy</Stepper.Header>
          <Stepper.Panel>
            <div className="rounded-lg bg-kumo-tint p-4">
              <Text>Review your settings and create the project.</Text>
            </div>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next finishLabel="Create project" />
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>
      </Stepper.Root>
    </div>
  );
}

/**
 * Async demo — `beforeNext` runs validation/save work before advancing. The
 * Next button shows a loading state while the promise is in flight, and the
 * stepper stays put if it rejects.
 */
export function StepperAsyncDemo() {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<string>("pro");
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async () => {
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      throw new Error("validation failed");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Stepper.Root onComplete={() => alert("Workspace created!")}>
        <Stepper.Step error={!!error}>
          <Stepper.Header icon={<BuildingsIcon />}>
            Name your workspace
          </Stepper.Header>
          <Stepper.Panel>
            <div className="space-y-2">
              <Input
                label="Workspace name"
                placeholder="acme"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error ? (
                <Text variant="error">{error}</Text>
              ) : (
                <Text variant="secondary">
                  We'll check availability before continuing.
                </Text>
              )}
            </div>
            <Stepper.Footer>
              <Stepper.Back hideOnFirst />
              <Stepper.Next beforeNext={checkAvailability}>
                Check &amp; continue
              </Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<CreditCardIcon />}>
            Choose a plan
          </Stepper.Header>
          <Stepper.Panel>
            <Select
              label="Plan"
              value={plan}
              onValueChange={(v) => setPlan(v ?? "pro")}
              items={{
                free: "Free — 1 project",
                pro: "Pro — unlimited projects",
                enterprise: "Enterprise — SSO & SLA",
              }}
            />
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>

        <Stepper.Step>
          <Stepper.Header icon={<RocketLaunchIcon />}>Confirm</Stepper.Header>
          <Stepper.Panel>
            <div className="rounded-lg bg-kumo-tint p-4">
              <Text>
                Creating <strong>{name || "your workspace"}</strong> on the{" "}
                <strong>{plan}</strong> plan.
              </Text>
            </div>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next finishLabel="Create workspace" />
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>
      </Stepper.Root>
    </div>
  );
}
