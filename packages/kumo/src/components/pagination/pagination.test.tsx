import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

function renderPagination({
  page = 1,
  perPage = 10,
  totalCount = 100,
  setPage = vi.fn(),
  controls = "full" as const,
  pageSelector,
}: {
  page?: number;
  perPage?: number;
  totalCount?: number;
  setPage?: (page: number) => void;
  controls?: "full" | "simple";
  pageSelector?: "input" | "dropdown";
} = {}) {
  return render(
    <Pagination
      page={page}
      setPage={setPage}
      perPage={perPage}
      totalCount={totalCount}
    >
      <Pagination.Info />
      <Pagination.Controls controls={controls} pageSelector={pageSelector} />
    </Pagination>,
  );
}

describe("Pagination", () => {
  describe("Controls", () => {
    it("renders navigation buttons", () => {
      renderPagination();

      expect(screen.getByLabelText("First page")).toBeTruthy();
      expect(screen.getByLabelText("Previous page")).toBeTruthy();
      expect(screen.getByLabelText("Next page")).toBeTruthy();
      expect(screen.getByLabelText("Last page")).toBeTruthy();
    });

    it("renders page number input by default", () => {
      renderPagination();

      expect(screen.getByLabelText("Page number")).toBeTruthy();
      expect(screen.getByLabelText("Page number").tagName.toLowerCase()).toBe(
        "input",
      );
    });

    it("disables first/previous buttons on first page", () => {
      renderPagination({ page: 1 });

      expect(screen.getByLabelText("First page").hasAttribute("disabled")).toBe(
        true,
      );
      expect(
        screen.getByLabelText("Previous page").hasAttribute("disabled"),
      ).toBe(true);
    });

    it("disables next/last buttons on last page", () => {
      renderPagination({ page: 10, perPage: 10, totalCount: 100 });

      expect(screen.getByLabelText("Next page").hasAttribute("disabled")).toBe(
        true,
      );
      expect(screen.getByLabelText("Last page").hasAttribute("disabled")).toBe(
        true,
      );
    });

    it("calls setPage when clicking next", () => {
      const setPage = vi.fn();
      renderPagination({ page: 1, setPage });

      fireEvent.click(screen.getByLabelText("Next page"));
      expect(setPage).toHaveBeenCalledWith(2);
    });

    it("calls setPage when clicking previous", () => {
      const setPage = vi.fn();
      renderPagination({ page: 3, setPage });

      fireEvent.click(screen.getByLabelText("Previous page"));
      expect(setPage).toHaveBeenCalledWith(2);
    });

    it("calls setPage when clicking first page", () => {
      const setPage = vi.fn();
      renderPagination({ page: 5, setPage });

      fireEvent.click(screen.getByLabelText("First page"));
      expect(setPage).toHaveBeenCalledWith(1);
    });

    it("calls setPage when clicking last page", () => {
      const setPage = vi.fn();
      renderPagination({ page: 5, perPage: 10, totalCount: 100, setPage });

      fireEvent.click(screen.getByLabelText("Last page"));
      expect(setPage).toHaveBeenCalledWith(10);
    });
  });

  describe("Enter key navigation (input mode)", () => {
    it("navigates to the typed page on Enter", async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      renderPagination({ page: 1, setPage });

      const input = screen.getByLabelText("Page number");
      await user.clear(input);
      await user.type(input, "5");
      await user.keyboard("{Enter}");

      expect(setPage).toHaveBeenCalledWith(5);
    });

    it("clamps value to maxPage on Enter when input exceeds max", async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      renderPagination({ page: 1, perPage: 10, totalCount: 100, setPage });

      const input = screen.getByLabelText("Page number");
      await user.clear(input);
      await user.type(input, "999");
      await user.keyboard("{Enter}");

      // maxPage is 10, so it should clamp to 10
      expect(setPage).toHaveBeenCalledWith(10);
    });

    it("clamps value to 1 on Enter when input is 0 or negative", async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      renderPagination({ page: 5, setPage });

      const input = screen.getByLabelText("Page number");
      await user.clear(input);
      await user.type(input, "0");
      await user.keyboard("{Enter}");

      expect(setPage).toHaveBeenCalledWith(1);
    });

    it("still navigates on blur (existing behavior preserved)", async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      renderPagination({ page: 1, setPage });

      const input = screen.getByLabelText("Page number");
      await user.clear(input);
      await user.type(input, "3");
      await user.tab(); // triggers blur

      expect(setPage).toHaveBeenCalledWith(3);
    });
  });

  describe("simple controls mode", () => {
    it("does not render page number input in simple mode", () => {
      renderPagination({ controls: "simple" });

      expect(screen.queryByLabelText("Page number")).toBeNull();
    });

    it("does not render first/last page buttons in simple mode", () => {
      renderPagination({ controls: "simple" });

      expect(screen.queryByLabelText("First page")).toBeNull();
      expect(screen.queryByLabelText("Last page")).toBeNull();
    });

    it("still renders previous/next buttons in simple mode", () => {
      renderPagination({ controls: "simple" });

      expect(screen.getByLabelText("Previous page")).toBeTruthy();
      expect(screen.getByLabelText("Next page")).toBeTruthy();
    });
  });

  describe("dropdown mode", () => {
    it("renders a select dropdown instead of an input when pageSelector='dropdown'", () => {
      renderPagination({ pageSelector: "dropdown" });

      // Should have a combobox (Select renders as combobox role)
      const combobox = screen.getByRole("combobox", { name: "Page number" });
      expect(combobox).toBeTruthy();

      // Should NOT have a text input for page number
      expect(screen.queryByRole("textbox", { name: "Page number" })).toBeNull();
    });

    it("calls setPage when selecting a page from dropdown", async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      renderPagination({
        page: 1,
        perPage: 10,
        totalCount: 100,
        pageSelector: "dropdown",
        setPage,
      });

      const combobox = screen.getByRole("combobox", { name: "Page number" });
      await user.click(combobox);

      // Base UI Select renders options in a portal; query from document
      const option = await screen.findByRole("option", { name: "5" });
      await user.click(option);

      expect(setPage).toHaveBeenCalledWith(5);
    });

    it("does not render dropdown in simple controls mode even if pageSelector is dropdown", () => {
      renderPagination({ controls: "simple", pageSelector: "dropdown" });

      expect(
        screen.queryByRole("combobox", { name: "Page number" }),
      ).toBeNull();
    });
  });

  describe("Info", () => {
    it("shows page range info", () => {
      renderPagination({ page: 2, perPage: 10, totalCount: 100 });

      expect(screen.getByText("11-20")).toBeTruthy();
      expect(screen.getByText("100")).toBeTruthy();
    });
  });

  describe("backward compatibility", () => {
    it("defaults to input mode when pageSelector is not specified", () => {
      renderPagination();

      const input = screen.getByLabelText("Page number");
      expect(input.tagName.toLowerCase()).toBe("input");
    });

    it("defaults to full controls when controls is not specified", () => {
      render(
        <Pagination page={1} setPage={vi.fn()} perPage={10} totalCount={100}>
          <Pagination.Controls />
        </Pagination>,
      );

      expect(screen.getByLabelText("First page")).toBeTruthy();
      expect(screen.getByLabelText("Page number")).toBeTruthy();
      expect(screen.getByLabelText("Last page")).toBeTruthy();
    });
  });
});
