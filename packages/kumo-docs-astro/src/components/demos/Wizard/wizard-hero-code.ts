export const wizardHeroCode = `import { Button, Wizard, useWizardGrid } from "@cloudflare/kumo";
import { WizardDemoHeader } from "./wizard-demo-header";
import { useCreateWorkerDemo } from "./use-create-worker-demo";

export function WizardFullDemo() {
  const { gridProps, onActiveStepElementChange } = useWizardGrid();
  // Demo-only state plumbing, not part of the Wizard API.
  const demo = useCreateWorkerDemo();

  return (
    <>
      <Button onClick={demo.handleOpen}>Open Wizard</Button>
      <Wizard.Fullscreen
        open={demo.open}
        onClose={demo.handleClose}
        className="relative"
        header={<WizardDemoHeader />}
      >
        <Wizard.Grid {...gridProps} title="Create a Worker">
          <Wizard
            step={demo.stepKey}
            onStepChange={demo.handleStepChange}
            onActiveStepElementChange={onActiveStepElementChange}
            previousStepNavigation={demo.isDeploying ? "disabled" : "enabled"}
          >
            <Wizard.Sidebar />
            <Wizard.Steps>
              <Wizard.Step stepKey="method" label="Select a method">
                <Wizard.Page
                  title="Ship something new"
                  description="Choose how you want to start."
                >
                  {/* ... */}
                </Wizard.Page>
              </Wizard.Step>
              <Wizard.Step
                stepKey="configure"
                label="Configure"
                when={demo.isDeployPath || demo.isTemplatePath}
              >
                <Wizard.Page
                  title="Configure your Worker"
                  description="Set the project name, build command, and deploy command."
                >
                  {/* ... */}
                </Wizard.Page>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </Wizard.Grid>
      </Wizard.Fullscreen>
    </>
  );
}`;
