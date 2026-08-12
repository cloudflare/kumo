import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { Table } from "./table";

describe("Table styling", () => {
  it("uses alternating row backgrounds without body row borders", () => {
    const { container } = render(
      <Table>
        <Table.Body>
          <Table.Row data-testid="default-row">
            <Table.Cell>Default</Table.Cell>
          </Table.Row>
          <Table.Row data-testid="selected-row" variant="selected">
            <Table.Cell>Selected</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    expect(screen.getByTestId("default-row").className).toContain(
      "even:bg-kumo-tint",
    );
    expect(screen.getByTestId("selected-row").className).not.toContain(
      "even:bg-kumo-tint",
    );
    expect(container.querySelector("table")?.className).not.toContain(
      "[&_td]:border",
    );
  });
});

describe("Table.CheckCell / Table.CheckHead", () => {
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
