import { useState } from "react";
import { DeleteResource, Button } from "@cloudflare/kumo";

export function DeleteResourceBasicDemo() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Zone
      </Button>
      <DeleteResource
        open={open}
        onOpenChange={setOpen}
        resourceType="Zone"
        resourceName="example.com"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

export function DeleteResourceWorkerDemo() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Worker
      </Button>
      <DeleteResource
        open={open}
        onOpenChange={setOpen}
        resourceType="Worker"
        resourceName="api-gateway-worker"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

export function DeleteResourceErrorDemo() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleDelete = async () => {
    setErrorMsg("");
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setErrorMsg("Something went wrong");
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Zone
      </Button>
      <DeleteResource
        open={open}
        onOpenChange={setOpen}
        resourceType="Zone"
        resourceName="example.com"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        errorMessage={errorMsg}
      />
    </>
  );
}
