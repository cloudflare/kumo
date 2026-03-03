import { Button, Toasty, useKumoToastManager, Link } from "@cloudflare/kumo";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";

function ToastTriggerButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Toast created",
          description: "This is a toast notification.",
        })
      }
    >
      Show toast
    </Button>
  );
}

export function ToastBasicDemo() {
  return (
    <Toasty>
      <ToastTriggerButton />
    </Toasty>
  );
}

function ToastTitleOnlyButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Settings saved",
        })
      }
    >
      Title only
    </Button>
  );
}

export function ToastTitleOnlyDemo() {
  return (
    <Toasty>
      <ToastTitleOnlyButton />
    </Toasty>
  );
}

function ToastDescriptionOnlyButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          description: "Your changes have been saved successfully.",
        })
      }
    >
      Description only
    </Button>
  );
}

export function ToastDescriptionOnlyDemo() {
  return (
    <Toasty>
      <ToastDescriptionOnlyButton />
    </Toasty>
  );
}

function ToastSuccessButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      variant="primary"
      onClick={() =>
        toastManager.add({
          title: "Success!",
          description: "Your Worker has been deployed.",
        })
      }
    >
      Deploy Worker
    </Button>
  );
}

export function ToastSuccessDemo() {
  return (
    <Toasty>
      <ToastSuccessButton />
    </Toasty>
  );
}

function ToastMultipleButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() => {
        toastManager.add({
          title: "First toast",
          description: "This is the first notification.",
        });
        setTimeout(() => {
          toastManager.add({
            title: "Second toast",
            description: "This is the second notification.",
          });
        }, 500);
        setTimeout(() => {
          toastManager.add({
            title: "Third toast",
            description: "This is the third notification.",
          });
        }, 1000);
      }}
    >
      Show multiple toasts
    </Button>
  );
}

export function ToastMultipleDemo() {
  return (
    <Toasty>
      <ToastMultipleButton />
    </Toasty>
  );
}

function ToastErrorButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Deployment failed",
          description: "Unable to connect to the server.",
          variant: "error",
        })
      }
    >
      Show error toast
    </Button>
  );
}

export function ToastErrorDemo() {
  return (
    <Toasty>
      <ToastErrorButton />
    </Toasty>
  );
}

function ToastWarningButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Rate limit warning",
          description: "You're approaching your API quota.",
          variant: "warning",
        })
      }
    >
      Show warning toast
    </Button>
  );
}

export function ToastWarningDemo() {
  return (
    <Toasty>
      <ToastWarningButton />
    </Toasty>
  );
}

function ToastCustomContentButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          content: (
            <div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                <Link href="/">my-first-worker</Link> created!
              </div>
            </div>
          ),
        })
      }
    >
      Show custom content
    </Button>
  );
}

export function ToastCustomContentDemo() {
  return (
    <Toasty>
      <ToastCustomContentButton />
    </Toasty>
  );
}

function ToastActionsButton() {
  const toastManager = useKumoToastManager();

  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Need help?",
          description: "Get assistance with your deployment.",
          actions: [
            {
              children: "Support",
              variant: "secondary",
              onClick: () => console.log("Support clicked"),
            },
            {
              children: "Ask AI",
              variant: "primary",
              onClick: () => console.log("Ask AI clicked"),
            },
          ],
        })
      }
    >
      Show with actions
    </Button>
  );
}

export function ToastActionsDemo() {
  return (
    <Toasty>
      <ToastActionsButton />
    </Toasty>
  );
}

function ToastPromiseButton() {
  const toastManager = useKumoToastManager();

  const simulateDeployment = () => {
    return new Promise<{ name: string }>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({ name: "my-worker" });
        } else {
          reject(new Error("Network error"));
        }
      }, 2000);
    });
  };

  return (
    <Button
      onClick={() =>
        toastManager.promise(simulateDeployment(), {
          loading: {
            title: "Deploying...",
            description: "Please wait while we deploy your Worker.",
          },
          success: (data) => ({
            title: "Deployed!",
            description: `Worker "${data.name}" is now live.`,
          }),
          error: (err) => ({
            title: "Deployment failed",
            description: err.message,
            variant: "error",
          }),
        })
      }
    >
      Deploy with promise
    </Button>
  );
}

export function ToastPromiseDemo() {
  return (
    <Toasty>
      <ToastPromiseButton />
    </Toasty>
  );
}
