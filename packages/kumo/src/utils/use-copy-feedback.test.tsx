import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useCopyFeedback } from "./use-copy-feedback";

describe("useCopyFeedback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lets an operation avoid stale copy side effects", async () => {
    let resolveFirst!: () => void;
    const firstOperation = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    const { result } = renderHook(() => useCopyFeedback());
    const copiedValues: string[] = [];

    const firstCopy = result.current.runCopy(async (isCurrent) => {
      await firstOperation;
      if (isCurrent()) copiedValues.push("first");
    });
    const secondCopy = result.current.runCopy((isCurrent) => {
      if (isCurrent()) copiedValues.push("second");
    });

    await act(async () => {
      await secondCopy;
      resolveFirst();
      await firstCopy;
    });

    expect(copiedValues).toEqual(["second"]);
    expect(result.current.copied).toBe(true);
  });
});
