import { describe, expect, test, vi } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { TagInput } from "./tag-input";

async function copyToClipboard(text: string) {
  const source = document.createElement("textarea");
  source.value = text;
  document.body.append(source);
  source.select();
  await userEvent.copy();
  source.remove();
}

describe("TagInput in a real browser", () => {
  test("pasting separated text merges it with the draft at the caret", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <TagInput aria-label="People" onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("textbox", { name: "People" });

    await copyToClipboard(", bob");
    await userEvent.click(input);
    await userEvent.keyboard("alice");
    await userEvent.paste();

    expect(onValueChange).toHaveBeenLastCalledWith(["alice", "bob"]);
    expect((input.element() as HTMLInputElement).value).toBe("");
  });

  test("pasting text without a separator stays in the draft", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <TagInput aria-label="People" onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("textbox", { name: "People" });

    await copyToClipboard("bob");
    await userEvent.click(input);
    await userEvent.keyboard("alice ");
    await userEvent.paste();

    expect(onValueChange).not.toHaveBeenCalled();
    expect((input.element() as HTMLInputElement).value).toBe("alice bob");
  });

  test("readOnly blocks removing and adding tags but keeps focus", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <TagInput
        aria-label="People"
        readOnly
        defaultValue={["one"]}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "People" });
    const remove = screen.getByRole("button", { name: /remove one/i });

    expect((remove.element() as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(input);
    expect(document.activeElement).toBe(input.element());
    await userEvent.keyboard("{Backspace}two{Enter}");
    await copyToClipboard("three, four");
    await userEvent.click(input);
    await userEvent.paste();
    await userEvent.tab();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText("one").element()).toBeTruthy();
    expect((input.element() as HTMLInputElement).value).toBe("");
  });

  test("native forms submit the tags and validate required against them", async () => {
    const screen = await render(
      <form data-testid="form">
        <TagInput aria-label="Tags" name="tags" required defaultValue={[]} />
      </form>,
    );
    const form = screen.getByTestId("form").element() as HTMLFormElement;
    const input = screen.getByRole("textbox", { name: "Tags" });

    expect(form.checkValidity()).toBe(false);

    await userEvent.click(input);
    await userEvent.keyboard("one{Enter}two{Enter}draft");

    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("tags")).toEqual(["one", "two"]);
  });

  test("required + readOnly with no tags is skipped by native validation", async () => {
    const screen = await render(
      <form data-testid="form">
        <TagInput aria-label="Tags" name="tags" required readOnly />
      </form>,
    );
    const form = screen.getByTestId("form").element() as HTMLFormElement;
    const input = screen
      .getByRole("textbox", {
        name: "Tags",
      })
      .element() as HTMLInputElement;

    expect(input.required).toBe(true);
    expect(input.willValidate).toBe(false);
    expect(form.checkValidity()).toBe(true);
  });
});
