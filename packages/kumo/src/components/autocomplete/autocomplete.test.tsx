import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Autocomplete,
  KUMO_AUTOCOMPLETE_VARIANTS,
  KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS,
} from "./autocomplete";

const countries = ["Argentina", "Brazil", "Canada"];

/** Helper that renders a minimal Autocomplete. */
function renderAutocomplete(
  props: Partial<React.ComponentProps<typeof Autocomplete>> = {},
) {
  return render(
    <Autocomplete items={countries} label="Country" {...props}>
      <Autocomplete.InputGroup placeholder="Search countries…" />
      <Autocomplete.Content>
        <Autocomplete.List>
          {(item: string) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>,
  );
}

describe("Autocomplete", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Rendering

  it("renders without crashing", () => {
    renderAutocomplete();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("renders input with placeholder text", () => {
    renderAutocomplete();
    expect(screen.getByPlaceholderText("Search countries…")).toBeTruthy();
  });

  // Variants export

  it("exports KUMO_AUTOCOMPLETE_VARIANTS with size axis", () => {
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.xs).toBeDefined();
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.sm).toBeDefined();
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.base).toBeDefined();
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.lg).toBeDefined();
  });

  it("exports KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS with correct defaults", () => {
    expect(KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS.size).toBe("base");
  });

  // displayName

  it("sets displayName on sub-components", () => {
    expect(Autocomplete.displayName).toBe("Autocomplete.Root");
    expect(Autocomplete.InputGroup.displayName).toBe("Autocomplete.InputGroup");
    expect(Autocomplete.Content.displayName).toBe("Autocomplete.Content");
    expect(Autocomplete.Item.displayName).toBe("Autocomplete.Item");
    expect(Autocomplete.GroupLabel.displayName).toBe("Autocomplete.GroupLabel");
    expect(Autocomplete.Group.displayName).toBe("Autocomplete.Group");
    expect(Autocomplete.Separator.displayName).toBe("Autocomplete.Separator");
  });

  // Field wrapper integration

  describe("label and Field wrapper", () => {
    it("renders with Field wrapper when label is provided", () => {
      renderAutocomplete({ label: "Country" });
      expect(screen.getByText("Country")).toBeTruthy();
    });

    it("renders description text when description prop is set", () => {
      renderAutocomplete({
        label: "Country",
        description: "Select your country of residence",
      });
      expect(screen.getByText("Select your country of residence")).toBeTruthy();
    });
  });

  // Error states

  describe("error styling", () => {
    it("applies error border to InputGroup when error prop is truthy", () => {
      renderAutocomplete({ error: "Country is required" });

      const input = screen.getByRole("combobox");
      expect(input.className).toContain("ring-kumo-danger");
    });

    it("renders error message string with label", () => {
      renderAutocomplete({
        label: "Country",
        error: "Please select a country",
      });
      expect(screen.getByText("Please select a country")).toBeTruthy();
    });

    it("renders error object with label", () => {
      renderAutocomplete({
        label: "Country",
        error: { message: "Country is required", match: true },
      });
      expect(screen.getByText("Country is required")).toBeTruthy();
    });

    it("associates error with an aria-label-only input", () => {
      const { container } = render(
        <Autocomplete items={countries} error="Please select a country">
          <Autocomplete.InputGroup
            aria-label="Search countries"
            placeholder="Search countries…"
          />
        </Autocomplete>,
      );

      const input = screen.getByRole("combobox", { name: "Search countries" });
      const error = screen.getByText("Please select a country");

      expect(error.id).toBeTruthy();
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toBe(error.id);
      expect(container.querySelector("label")).toBeNull();
    });
  });

  // Input structure

  describe("input", () => {
    it("has aria-haspopup listbox on the combobox input", () => {
      renderAutocomplete();

      const input = screen.getByRole("combobox");
      expect(input.getAttribute("aria-haspopup")).toBe("listbox");
    });

    it("has aria-autocomplete list attribute", () => {
      renderAutocomplete();

      const input = screen.getByRole("combobox");
      expect(input.getAttribute("aria-autocomplete")).toBe("list");
    });

    it("passes aria-label through to the input", () => {
      render(
        <Autocomplete items={countries}>
          <Autocomplete.InputGroup
            aria-label="Search countries"
            placeholder="Search countries…"
          />
        </Autocomplete>,
      );

      const input = screen.getByRole("combobox", { name: "Search countries" });
      expect(input.getAttribute("aria-label")).toBe("Search countries");
    });

    it("associates description with an aria-label-only input", () => {
      const { container } = render(
        <Autocomplete
          items={countries}
          description="Start typing to filter countries"
        >
          <Autocomplete.InputGroup
            aria-label="Search countries"
            placeholder="Search countries…"
          />
        </Autocomplete>,
      );

      const input = screen.getByRole("combobox", { name: "Search countries" });
      const description = screen.getByText("Start typing to filter countries");

      expect(description.id).toBeTruthy();
      expect(input.getAttribute("aria-describedby")).toBe(description.id);
      expect(container.querySelector("label")).toBeNull();
    });

    it("passes aria-labelledby through to the input", () => {
      render(
        <>
          <span id="country-search-label">Country search</span>
          <Autocomplete items={countries}>
            <Autocomplete.InputGroup
              aria-labelledby="country-search-label"
              placeholder="Search countries…"
            />
          </Autocomplete>
        </>,
      );

      const input = screen.getByRole("combobox", { name: "Country search" });
      expect(input.getAttribute("aria-labelledby")).toBe(
        "country-search-label",
      );
    });
  });

  describe("accessible name warnings", () => {
    it("warns when InputGroup only has a placeholder", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Autocomplete items={countries}>
          <Autocomplete.InputGroup placeholder="Search countries…" />
        </Autocomplete>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        "[Kumo Autocomplete]: Autocomplete.InputGroup must have an accessible name. Provide either:\n" +
          "  - label prop: <Autocomplete label='Country' ... />\n" +
          "  - aria-label: <Autocomplete.InputGroup aria-label='Search countries' />\n" +
          "  - aria-labelledby for custom label association",
      );
    });

    it("does not warn when the root label provides the accessible name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      renderAutocomplete();

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("does not warn when aria-label provides the accessible name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Autocomplete items={countries}>
          <Autocomplete.InputGroup
            aria-label="Search countries"
            placeholder="Search countries…"
          />
        </Autocomplete>,
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
