import { type ChangeEvent } from "react";
import {
  Button,
  Text,
  Input,
  InputGroup,
  Checkbox,
  Loader,
  useWizard,
} from "@cloudflare/kumo";
import type { NameStatus } from "./use-create-worker-demo";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";
import type { SelectedMethod } from "./use-create-worker-demo";
import {
  CREATION_METHODS,
  CreationMethodCard,
  DEMO_TEMPLATES,
  TemplateCard,
} from "./wizard-demo-helpers";
import { WizardDemoCodePreview } from "./wizard-code-preview";

function resolveMethod(title: string): {
  method: SelectedMethod;
} {
  if (title === "Select a template") return { method: "template" };
  if (title === "Upload your static files") return { method: "upload" };
  return { method: "hello-world" };
}

export function SelectMethodBody({
  onSelectMethod,
}: {
  onSelectMethod: (method: SelectedMethod) => void;
}) {
  const gitMethods = CREATION_METHODS.slice(0, 2);
  const otherMethods = CREATION_METHODS.slice(2);

  function handleClick(title: string) {
    const { method: selectedMethod } = resolveMethod(title);
    onSelectMethod(selectedMethod);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {gitMethods.map((method) => (
          <CreationMethodCard
            key={method.title}
            title={method.title}
            icon={method.icon}
            iconClassName={method.iconClassName}
            dashed={method.dashed}
            onClick={() => handleClick(method.title)}
          />
        ))}
      </div>
      {otherMethods.map((method) => (
        <CreationMethodCard
          key={method.title}
          title={method.title}
          icon={method.icon}
          iconClassName={method.iconClassName}
          dashed={method.dashed}
          onClick={() => handleClick(method.title)}
        />
      ))}
    </div>
  );
}

export function SelectTemplateBody({
  onSelectTemplate,
}: {
  onSelectTemplate: (name: string) => void;
}) {
  const { goToStep } = useWizard();

  const handleSelectTemplate = (name: string) => {
    onSelectTemplate(name);
    goToStep("setup");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {DEMO_TEMPLATES.map((template) => (
        <TemplateCard
          key={template.alias}
          template={template}
          onClick={() => handleSelectTemplate(template.name)}
        />
      ))}
    </div>
  );
}

export function SelectTemplateFooter() {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back}>
        Back
      </Button>
      <Button variant="ghost" onClick={() => {}}>
        Browse all templates <ArrowUpRightIcon weight="bold" size={12} />
      </Button>
    </>
  );
}

export function SetupBody({
  workerName,
  onWorkerNameChange,
  nameStatus,
  nameError,
}: {
  workerName: string;
  onWorkerNameChange: (name: string) => void;
  nameStatus: NameStatus;
  nameError: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <InputGroup
        label="Worker name"
        error={nameError ? { message: nameError, match: true } : undefined}
      >
        <InputGroup.Input
          placeholder="my-worker"
          value={workerName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onWorkerNameChange(e.target.value)
          }
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        {nameStatus === "checking" && (
          <InputGroup.Addon align="end">
            <Loader />
          </InputGroup.Addon>
        )}
        {nameStatus === "available" && (
          <InputGroup.Addon align="end">
            <CheckCircleIcon weight="duotone" className="text-kumo-success" />
          </InputGroup.Addon>
        )}
      </InputGroup>
      <Input
        defaultValue="npm run build"
        label="Build command"
        placeholder="npm run build"
      />
      <Input
        defaultValue="npx wrangler deploy"
        label="Deploy command"
        placeholder="npx wrangler deploy"
      />
      <Input
        defaultValue="npx wrangler versions upload"
        placeholder="npx wrangler versions upload"
        label="Preview command"
      />
      <Checkbox label="Enable preview builds" />
    </div>
  );
}

export function SetupFooter({
  isDeploying,
  onDeploy,
}: {
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

interface DeployStepBodyProps {
  workerName: string;
  onWorkerNameChange: (name: string) => void;
  nameStatus: NameStatus;
  nameError: string;
}

export function DeployStepBody({
  workerName,
  onWorkerNameChange,
  nameStatus,
  nameError,
}: DeployStepBodyProps) {
  return (
    <div className="flex flex-col gap-4">
      <InputGroup
        label="Worker name"
        error={nameError ? { message: nameError, match: true } : undefined}
      >
        <InputGroup.Input
          placeholder="my-worker"
          value={workerName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onWorkerNameChange(e.target.value)
          }
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        {nameStatus === "checking" && (
          <InputGroup.Addon align="end">
            <Loader />
          </InputGroup.Addon>
        )}
        {nameStatus === "available" && (
          <InputGroup.Addon align="end">
            <CheckCircleIcon weight="duotone" className="text-kumo-success" />
          </InputGroup.Addon>
        )}
      </InputGroup>
      <div className="min-w-0">
        <Text size="sm" bold as="p" DANGEROUS_className="mb-1.5">
          Worker preview
        </Text>
        <div className="overflow-hidden rounded-xl border border-kumo-line bg-kumo-recessed">
          <WizardDemoCodePreview />
        </div>
      </div>
    </div>
  );
}

export function DeployStepFooter({
  isDeploying,
  onDeploy,
}: {
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

export function UploadStepBody() {
  return (
    <div className="group relative flex min-h-[184px] cursor-default flex-col items-center justify-center rounded-lg bg-kumo-base px-6 py-10 text-center shadow-xs ring-1 ring-kumo-line transition-colors hover:bg-kumo-elevated after:pointer-events-none after:absolute after:inset-1 after:rounded-md after:border after:border-dashed after:border-kumo-hairline hover:after:border-kumo-line">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md ring-1 ring-kumo-line shadow-xs">
        <FolderOpenIcon
          size={16}
          weight="duotone"
          className="text-kumo-subtle"
        />
      </div>
      <Text DANGEROUS_className="mt-3.5 text-balance">
        Drag in or click to upload a file or folder.
      </Text>
      <Text
        size="sm"
        variant="secondary"
        DANGEROUS_className="mt-1 text-balance"
      >
        Contents you drag here will be uploaded to your account
      </Text>
    </div>
  );
}

export function UploadStepFooter({
  isDeploying,
  onDeploy,
}: {
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

export function DeployingOverlay({ projectName }: { projectName: string }) {
  return (
    <>
      <div className="absolute inset-0 z-10 rounded-xl bg-kumo-base/90 backdrop-blur-[1px]" />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center text-balance max-w-xs">
          <Loader size={32} />
          <Text bold>
            Setting up your "{projectName}" project. This may take a few
            seconds...
          </Text>
        </div>
      </div>
    </>
  );
}
