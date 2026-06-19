import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./table";

describe("Table.CheckCell / Table.CheckHead", () => {
  it("uses localized aria-label props for selection checkboxes", () => {
    render(
      <table>
        <thead>
          <tr>
            <Table.CheckHead
              aria-label="Seleccionar todas las filas"
              label="Select all rows"
            />
          </tr>
        </thead>
        <tbody>
          <tr>
            <Table.CheckCell
              aria-label="Seleccionar Kumo v1.0.0"
              label="Select row"
            />
          </tr>
        </tbody>
      </table>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Seleccionar todas las filas",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: "Seleccionar Kumo v1.0.0" }),
    ).toBeDefined();
  });

  it("falls back to the legacy label prop for selection checkbox names", () => {
    render(
      <table>
        <thead>
          <tr>
            <Table.CheckHead label="Sélectionner toutes les lignes" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <Table.CheckCell label="Sélectionner cette ligne" />
          </tr>
        </tbody>
      </table>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Sélectionner toutes les lignes",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: "Sélectionner cette ligne" }),
    ).toBeDefined();
  });

  it("calls onCheckedChange with the new checked state", async () => {
    const onCheckedChange = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <Table.CheckCell
              checked={false}
              onCheckedChange={onCheckedChange}
            />
          </tr>
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole("checkbox");
    checkbox.click();

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
    // second arg is optional event details object
    expect(onCheckedChange.mock.calls[0][1]).toBeDefined();
  });

  it("still calls the deprecated onValueChange for backward compatibility", () => {
    const onValueChange = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <Table.CheckCell checked={false} onValueChange={onValueChange} />
          </tr>
        </tbody>
      </table>,
    );

    screen.getByRole("checkbox").click();

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("calls both onCheckedChange and onValueChange when both are provided", () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <Table.CheckHead
              checked={false}
              onCheckedChange={onCheckedChange}
              onValueChange={onValueChange}
            />
          </tr>
        </thead>
      </table>,
    );

    screen.getByRole("checkbox").click();

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});

describe("Table.ResizeHandle", () => {
  it("uses the default English aria-label", () => {
    render(<Table.ResizeHandle />);

    expect(
      screen.getByRole("button", { name: "Resize column" }),
    ).toBeDefined();
  });

  it("allows the resize control aria-label to be localized", () => {
    render(<Table.ResizeHandle aria-label="Redimensionar columna" />);

    expect(
      screen.getByRole("button", { name: "Redimensionar columna" }),
    ).toBeDefined();
  });

  it("uses a 24px non-layout hit area centered on the column edge", () => {
    render(<Table.ResizeHandle />);

    const handle = screen.getByRole("button", { name: "Resize column" });
    expect(handle.className).toContain("w-6");
    expect(handle.className).toContain("-right-3");
  });
});
