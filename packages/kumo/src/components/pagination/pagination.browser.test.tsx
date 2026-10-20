import { useState } from "react";
import { describe, expect, test, vi } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Pagination } from "./pagination";

function ControlledPagination({
  initialPage = 1,
  totalCount,
  onSetPage,
}: {
  initialPage?: number;
  totalCount: number;
  onSetPage: (page: number) => void;
}) {
  const [page, setPage] = useState(initialPage);
  return (
    <Pagination
      page={page}
      perPage={10}
      totalCount={totalCount}
      setPage={(next) => {
        onSetPage(next);
        setPage(next);
      }}
    >
      <Pagination.Controls />
    </Pagination>
  );
}

async function copyToClipboard(text: string) {
  const source = document.createElement("textarea");
  source.value = text;
  document.body.append(source);
  source.select();
  await userEvent.copy();
  source.remove();
}

describe("Pagination in a real browser", () => {
  test.each([
    ["Enter", "{Enter}"],
    ["blur", "{Tab}"],
  ])("non-numeric page text is rejected on %s", async (_, commitKey) => {
    const onSetPage = vi.fn();
    const screen = await render(
      <ControlledPagination
        initialPage={3}
        totalCount={100}
        onSetPage={onSetPage}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Page number" });

    await userEvent.tripleClick(input);
    await userEvent.keyboard(`abc${commitKey}`);

    expect(onSetPage).not.toHaveBeenCalled();
    expect((input.element() as HTMLInputElement).value).toBe("3");
  });

  test("a pasted fractional page is rejected", async () => {
    const onSetPage = vi.fn();
    const screen = await render(
      <ControlledPagination
        initialPage={3}
        totalCount={100}
        onSetPage={onSetPage}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Page number" });

    await copyToClipboard("2.5");
    await userEvent.tripleClick(input);
    await userEvent.paste();
    await userEvent.keyboard("{Enter}");

    expect(onSetPage).not.toHaveBeenCalled();
    expect((input.element() as HTMLInputElement).value).toBe("3");
  });

  test.each(["0x10", "1e1", "-2", "+3"])(
    "non-digit page text %j is rejected",
    async (text) => {
      const onSetPage = vi.fn();
      const screen = await render(
        <ControlledPagination
          initialPage={3}
          totalCount={200}
          onSetPage={onSetPage}
        />,
      );
      const input = screen.getByRole("textbox", { name: "Page number" });

      await userEvent.tripleClick(input);
      await userEvent.keyboard(`${text}{Enter}`);

      expect(onSetPage).not.toHaveBeenCalled();
      expect((input.element() as HTMLInputElement).value).toBe("3");
    },
  );

  test("surrounding whitespace is ignored", async () => {
    const onSetPage = vi.fn();
    const screen = await render(
      <ControlledPagination totalCount={100} onSetPage={onSetPage} />,
    );
    const input = screen.getByRole("textbox", { name: "Page number" });

    await userEvent.tripleClick(input);
    await userEvent.keyboard(" 4 {Enter}");

    expect(onSetPage).toHaveBeenLastCalledWith(4);
  });

  test("Next and Last are disabled when page is past the last page", async () => {
    const screen = await render(
      <Pagination page={7} perPage={10} totalCount={30} setPage={vi.fn()}>
        <Pagination.Controls />
      </Pagination>,
    );

    for (const name of ["Next page", "Last page"]) {
      const button = screen.getByRole("button", { name }).element();
      expect((button as HTMLButtonElement).disabled, name).toBe(true);
    }
  });

  test("a valid page is applied and out-of-range pages are clamped", async () => {
    const onSetPage = vi.fn();
    const screen = await render(
      <ControlledPagination totalCount={100} onSetPage={onSetPage} />,
    );
    const input = screen.getByRole("textbox", { name: "Page number" });

    await userEvent.tripleClick(input);
    await userEvent.keyboard("7{Enter}");
    expect(onSetPage).toHaveBeenLastCalledWith(7);

    await userEvent.tripleClick(input);
    await userEvent.keyboard("999{Enter}");
    expect(onSetPage).toHaveBeenLastCalledWith(10);
    expect((input.element() as HTMLInputElement).value).toBe("10");
  });

  test("an empty result set never navigates to page 0", async () => {
    const onSetPage = vi.fn();
    const screen = await render(
      <ControlledPagination totalCount={0} onSetPage={onSetPage} />,
    );

    for (const name of [
      "First page",
      "Previous page",
      "Next page",
      "Last page",
    ]) {
      const button = screen.getByRole("button", { name }).element();
      expect((button as HTMLButtonElement).disabled, name).toBe(true);
    }

    const input = screen.getByRole("textbox", { name: "Page number" });
    await userEvent.tripleClick(input);
    await userEvent.keyboard("0{Enter}");

    expect(onSetPage).not.toHaveBeenCalledWith(0);
    expect((input.element() as HTMLInputElement).value).toBe("1");
  });
});
