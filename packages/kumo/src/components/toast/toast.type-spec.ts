import { expectTypeOf } from "vite-plus/test";
import { createKumoToastManager, useKumoToastManager } from "./toast";

const sourcePromise = Promise.resolve({ status: "complete" as const });

function assertManagerReturnTypes(
  manager:
    | ReturnType<typeof createKumoToastManager>
    | ReturnType<typeof useKumoToastManager>,
) {
  expectTypeOf(manager.add({ title: "Created" })).toEqualTypeOf<string>();
  expectTypeOf(
    manager.update("toast-id", { title: "Updated" }),
  ).toEqualTypeOf<void>();

  const returnedPromise = manager.promise(sourcePromise, {
    loading: { title: "Loading" },
    success: (result) => {
      expectTypeOf(result).toEqualTypeOf<{ status: "complete" }>();
      return { title: result.status };
    },
    error: { title: "Failed" },
  });

  expectTypeOf(returnedPromise).toEqualTypeOf<
    Promise<{ status: "complete" }>
  >();
}

export function assertCreatedToastManagerReturnTypes() {
  assertManagerReturnTypes(createKumoToastManager());
}

export function useAssertHookToastManagerReturnTypes() {
  assertManagerReturnTypes(useKumoToastManager());
}
