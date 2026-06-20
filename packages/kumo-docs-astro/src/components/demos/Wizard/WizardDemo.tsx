import { Wizard, Button, useWizardGrid } from "@cloudflare/kumo";

// Demo-only state plumbing, not part of the Wizard API.
import { useCreateWorkerDemo } from "./use-create-worker-demo";
import {
  SelectMethodBody,
  SelectTemplateBody,
  SelectTemplateFooter,
  SetupBody,
  SetupFooter,
  DeployStepBody,
  DeployStepFooter,
  DeployingOverlay,
  UploadStepBody,
  UploadStepFooter,
} from "./wizard-demo-steps";
import { WizardDemoPlayground } from "./wizard-playground";
import { WizardDemoHeader } from "./wizard-demo-header";

function WizardDemoFlow({
  demo,
  onActiveStepElementChange,
  sidebar,
}: {
  demo: ReturnType<typeof useCreateWorkerDemo>;
  onActiveStepElementChange: (element: HTMLDivElement | null) => void;
  sidebar: boolean;
}) {
  return (
    <Wizard
      step={demo.stepKey}
      onStepChange={demo.handleStepChange}
      onActiveStepElementChange={onActiveStepElementChange}
      previousStepNavigation={demo.isDeploying ? "disabled" : "enabled"}
    >
      {sidebar && <Wizard.Sidebar />}
      <Wizard.Steps>
        <Wizard.Step stepKey="method" label="Select a method">
          <Wizard.Page
            title="Ship something new"
            description="Select from a Git repo, drag and drop your code or select a template."
          >
            <SelectMethodBody onSelectMethod={demo.handleSelectMethod} />
          </Wizard.Page>
        </Wizard.Step>
        <Wizard.Step
          stepKey="template"
          label="Select a template"
          when={demo.isTemplatePath}
        >
          <Wizard.Page
            title="Select a template"
            description="Get up and running with one of our full-stack application examples."
            footer={<SelectTemplateFooter />}
          >
            <SelectTemplateBody onSelectTemplate={demo.setSelectedTemplate} />
          </Wizard.Page>
        </Wizard.Step>
        <Wizard.Step stepKey="setup" label="Deploy" when={demo.isTemplatePath}>
          <div className="relative">
            <Wizard.Page
              title="Set up your application"
              description="Configure your Worker project and deploy it to Cloudflare."
              footer={
                <SetupFooter
                  isDeploying={demo.isDeploying}
                  onDeploy={demo.handleTemplateDeploy}
                />
              }
            >
              <SetupBody
                workerName={demo.workerName}
                onWorkerNameChange={demo.setWorkerName}
                nameStatus={demo.nameStatus}
                nameError={demo.nameError}
              />
            </Wizard.Page>
            {demo.isDeploying && (
              <DeployingOverlay projectName={demo.deployProjectName} />
            )}
          </div>
        </Wizard.Step>
        <Wizard.Step
          stepKey="deploy"
          label="Deploy Worker"
          when={demo.isDeployPath}
        >
          <div className="relative">
            <Wizard.Page
              title="Deploy Hello World"
              description="A simple Worker that returns 'Hello World!'. Perfect for getting started."
              footer={
                <DeployStepFooter
                  isDeploying={demo.isDeploying}
                  onDeploy={demo.handleDeploy}
                />
              }
            >
              <DeployStepBody
                workerName={demo.workerName}
                onWorkerNameChange={demo.setWorkerName}
                nameStatus={demo.nameStatus}
                nameError={demo.nameError}
              />
            </Wizard.Page>
            {demo.isDeploying && (
              <DeployingOverlay projectName={demo.deployProjectName} />
            )}
          </div>
        </Wizard.Step>
        <Wizard.Step
          stepKey="upload"
          label="Upload and deploy"
          when={demo.isUploadPath}
        >
          <div className="relative">
            <Wizard.Page
              title="Upload and deploy"
              description="Drag and drop your static files and configure deployment settings."
              footer={
                <UploadStepFooter
                  isDeploying={demo.isDeploying}
                  onDeploy={demo.handleTemplateDeploy}
                />
              }
            >
              <UploadStepBody />
            </Wizard.Page>
            {demo.isDeploying && (
              <DeployingOverlay projectName={demo.deployProjectName} />
            )}
          </div>
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
}

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
                  <>{/* ... */}</>
                </Wizard.Page>
              </Wizard.Step>
              <Wizard.Step stepKey="configure" label="Configure">
                <Wizard.Page
                  title="Configure your Worker"
                  description="Set the project name, build command, and deploy command."
                >
                  <>{/* ... */}</>
                </Wizard.Page>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </Wizard.Grid>
      </Wizard.Fullscreen>
    </>
  );
}

export function WizardInteractivePreview() {
  const { gridProps, onActiveStepElementChange } = useWizardGrid();

  // Demo-only state plumbing, not part of the Wizard API.
  const demo = useCreateWorkerDemo();

  const renderWizardTree = (
    <WizardDemoFlow
      demo={demo}
      onActiveStepElementChange={onActiveStepElementChange}
      sidebar={demo.playground.sidebar}
    />
  );

  return (
    <>
      <Button onClick={demo.handleOpen}>Open Wizard</Button>
      <Wizard.Fullscreen
        open={demo.open}
        onClose={demo.handleClose}
        className="relative"
        header={demo.playground.header ? <WizardDemoHeader /> : undefined}
        width={demo.playground.width}
      >
        {demo.playground.wireframe ? (
          <Wizard.Grid {...gridProps} title="Create a Worker">
            {renderWizardTree}
          </Wizard.Grid>
        ) : (
          renderWizardTree
        )}
        <WizardDemoPlayground
          width={demo.playground.width}
          onWidthChange={demo.playground.setWidth}
          sidebar={demo.playground.sidebar}
          onSidebarChange={demo.playground.setSidebar}
          wireframe={demo.playground.wireframe}
          onWireframeChange={demo.playground.setWireframe}
          header={demo.playground.header}
          onHeaderChange={demo.playground.setHeader}
          controlsOpen={demo.playground.controlsOpen}
          onControlsOpenChange={demo.playground.setControlsOpen}
        />
      </Wizard.Fullscreen>
    </>
  );
}
