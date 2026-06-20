import { useCallback, useEffect, useRef, useState } from "react";
import type { WizardWidth } from "@cloudflare/kumo";

export type SelectedMethod = "hello-world" | "template" | "upload" | null;

export type NameStatus = "idle" | "checking" | "available" | "error";

interface PlaygroundState {
  width: WizardWidth;
  sidebar: boolean;
  wireframe: boolean;
  header: boolean;
  controlsOpen: boolean;
}

// Demo-only state plumbing for the Create Worker wizard example. Separated from WizardDemo.tsx so the docs code block stays focused on Wizard API usage.
export function useCreateWorkerDemo() {
  const [stepKey, setStepKey] = useState("method");
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<SelectedMethod>(null);
  const [selectedTemplate, setSelectedTemplateRaw] = useState("Astro");
  const [workerName, setWorkerNameRaw] = useState("hello-world");
  const [nameStatus, setNameStatus] = useState<NameStatus>("available");
  const [nameError, setNameError] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const deployTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const availabilityTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const methodNavigationFrameRef = useRef<number | null>(null);

  function scheduleStepChange(nextStep: string) {
    if (methodNavigationFrameRef.current !== null) {
      cancelAnimationFrame(methodNavigationFrameRef.current);
    }

    methodNavigationFrameRef.current = requestAnimationFrame(() => {
      setStepKey(nextStep);
      methodNavigationFrameRef.current = null;
    });
  }

  // Selecting a template also sets a derived worker name (e.g. "Astro" → "my-astro-app").
  // Sanitize to a valid slug: lowercase, non-alphanumeric → hyphen, collapse/trim hyphens.
  const setSelectedTemplate = useCallback((name: string) => {
    setSelectedTemplateRaw(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const derived = `my-${slug}-app`;
    setWorkerNameRaw(derived);
    // Derived names are always valid — skip straight to available
    setNameStatus("available");
    setNameError("");
  }, []);

  // Debounced worker-name change: validate → check availability (simulated)
  const setWorkerName = useCallback((next: string) => {
    setWorkerNameRaw(next);
    if (availabilityTimerRef.current)
      clearTimeout(availabilityTimerRef.current);

    if (!next.trim()) {
      setNameStatus("error");
      setNameError("Enter a worker name.");
      return;
    }

    setNameError("");
    setNameStatus("checking");
    availabilityTimerRef.current = setTimeout(() => {
      setNameStatus("available");
    }, 500);
  }, []);

  const handleSelectMethod = useCallback((method: SelectedMethod) => {
    setSelectedMethod(method);
    const nextStep =
      method === "template"
        ? "template"
        : method === "upload"
          ? "upload"
          : "deploy";
    scheduleStepChange(nextStep);
  }, []);

  const isTemplatePath = selectedMethod === "template";
  const isUploadPath = selectedMethod === "upload";
  const isDeployPath = selectedMethod === "hello-world";

  // The deploy overlay shows the worker name for all paths
  const deployProjectName = workerName || "Hello World";

  const resetDemo = useCallback(() => {
    setStepKey("method");
    setOpen(false);
    setSelectedMethod(null);
    setSelectedTemplateRaw("Astro");
    setWorkerNameRaw("hello-world");
    setNameStatus("available");
    setNameError("");
    setIsDeploying(false);

    if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
    if (availabilityTimerRef.current)
      clearTimeout(availabilityTimerRef.current);
    if (methodNavigationFrameRef.current !== null) {
      cancelAnimationFrame(methodNavigationFrameRef.current);
      methodNavigationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
      if (availabilityTimerRef.current)
        clearTimeout(availabilityTimerRef.current);
      if (methodNavigationFrameRef.current !== null) {
        cancelAnimationFrame(methodNavigationFrameRef.current);
      }
    };
  }, []);

  function handleOpen() {
    setStepKey("method");
    setOpen(true);
  }

  function handleClose() {
    resetDemo();
  }

  // Starts the deploy finale: loading overlay -> 3s auto-close -> reset
  function startDeployFinale() {
    setIsDeploying(true);
    deployTimerRef.current = setTimeout(resetDemo, 3000);
  }

  // Hello World deploy — validates worker name first
  function handleDeploy() {
    if (!workerName.trim()) {
      setNameStatus("error");
      setNameError("Enter a worker name.");
      return;
    }
    startDeployFinale();
  }

  // Template deploy — also validates worker name
  function handleTemplateDeploy() {
    if (!workerName.trim()) {
      setNameStatus("error");
      setNameError("Enter a worker name.");
      return;
    }
    startDeployFinale();
  }

  // Wizard onStepChange handler — only uses the key, ignores the index
  const handleStepChange = (_index: number, key: string) => setStepKey(key);

  // Playground controls
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    width: "narrow",
    sidebar: true,
    wireframe: true,
    header: true,
    controlsOpen: true,
  });

  const setPlaygroundWidth = useCallback((width: WizardWidth) => {
    setPlaygroundState((state) => ({ ...state, width }));
  }, []);

  const setPlaygroundSidebar = useCallback((sidebar: boolean) => {
    setPlaygroundState((state) => ({ ...state, sidebar }));
  }, []);

  const setPlaygroundWireframe = useCallback((wireframe: boolean) => {
    setPlaygroundState((state) => ({ ...state, wireframe }));
  }, []);

  const setPlaygroundHeader = useCallback((header: boolean) => {
    setPlaygroundState((state) => ({ ...state, header }));
  }, []);

  const setPlaygroundControlsOpen = useCallback((controlsOpen: boolean) => {
    setPlaygroundState((state) => ({ ...state, controlsOpen }));
  }, []);

  return {
    stepKey,
    setStepKey,
    handleStepChange,
    open,
    handleOpen,
    handleClose,
    selectedMethod,
    handleSelectMethod,
    isTemplatePath,
    isUploadPath,
    isDeployPath,
    deployProjectName,
    selectedTemplate,
    setSelectedTemplate,
    workerName,
    setWorkerName,
    nameStatus,
    nameError,
    isDeploying,
    handleDeploy,
    handleTemplateDeploy,
    resetDemo,
    playground: {
      width: playgroundState.width,
      setWidth: setPlaygroundWidth,
      sidebar: playgroundState.sidebar,
      setSidebar: setPlaygroundSidebar,
      wireframe: playgroundState.wireframe,
      setWireframe: setPlaygroundWireframe,
      header: playgroundState.header,
      setHeader: setPlaygroundHeader,
      controlsOpen: playgroundState.controlsOpen,
      setControlsOpen: setPlaygroundControlsOpen,
    },
  };
}
