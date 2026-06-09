import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Autocomplete } from "./components/autocomplete";
import { Combobox } from "./components/combobox";

const countries = ["Argentina", "Brazil", "Canada"];
const fruits = ["Apple", "Banana", "Cherry"];

describe("React compatibility", () => {
  it("renders Autocomplete and Combobox context providers with React 18-compatible syntax", () => {
    render(
      <>
        <Autocomplete items={countries} label="Country" error="Required">
          <Autocomplete.InputGroup placeholder="Search countries..." />
          <Autocomplete.Content>
            <Autocomplete.List>
              {(item: string) => (
                <Autocomplete.Item key={item} value={item}>
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Content>
        </Autocomplete>
        <Combobox items={fruits} label="Fruit" error="Required">
          <Combobox.TriggerInput placeholder="Pick a fruit..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
      </>,
    );

    expect(screen.getByText("Country")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search countries...")).toBeTruthy();
    expect(screen.getByText("Fruit")).toBeTruthy();
    expect(screen.getByPlaceholderText("Pick a fruit...")).toBeTruthy();
  });
});
