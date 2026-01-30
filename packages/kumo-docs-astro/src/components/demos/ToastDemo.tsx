import { Button, Toasty, Toast } from "@cloudflare/kumo";

function ToastTriggerButton() {
  const toastManager = Toast.useToastManager();

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
  const toastManager = Toast.useToastManager();

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
  const toastManager = Toast.useToastManager();

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
  const toastManager = Toast.useToastManager();

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
  const toastManager = Toast.useToastManager();

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
