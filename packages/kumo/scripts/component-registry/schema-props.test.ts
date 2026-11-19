import { describe, expect, it } from "vite-plus/test";
import type { Definition } from "ts-json-schema-generator";
import { collectPropsFromParts } from "./schema-props.js";

// Shapes match ts-json-schema-generator output: `prop?: undefined` becomes
// `{ not: {} }` and an optional `never` prop is omitted.
const nativeMember: Definition = {
  type: "object",
  properties: {
    href: { not: {} },
    loading: { type: "boolean" },
    type: { type: "string" },
  },
};
const linkMember: Definition = {
  type: "object",
  properties: {
    href: { type: "string", description: "Renders a link." },
    target: { type: "string" },
  },
  required: ["href"],
};

describe("collectPropsFromParts", () => {
  it("merges every member of a union nested in an intersection", () => {
    const { properties, required } = collectPropsFromParts(
      [
        { anyOf: [nativeMember, linkMember] },
        { type: "object", properties: { size: { type: "string" } } },
      ],
      undefined,
    );

    expect(Object.keys(properties).sort()).toEqual([
      "href",
      "loading",
      "size",
      "target",
      "type",
    ]);
    // href is required in only one member.
    expect(required).toEqual([]);
  });

  it("ignores members that rule a prop out, regardless of member order", () => {
    for (const members of [
      [nativeMember, linkMember],
      [linkMember, nativeMember],
    ]) {
      const { properties } = collectPropsFromParts(
        [{ anyOf: members }],
        undefined,
      );
      expect(properties.href).toEqual({
        type: "string",
        description: "Renders a link.",
      });
    }
  });

  it("unions different definitions of a shared prop", () => {
    const { properties } = collectPropsFromParts(
      [
        {
          oneOf: [
            { properties: { value: { type: "string" } } },
            { properties: { value: { type: "number" } } },
            { properties: { value: { type: "string" } } },
          ],
        },
      ],
      undefined,
    );
    expect(properties.value).toEqual({
      anyOf: [{ type: "string" }, { type: "number" }],
    });
  });

  it("absorbs string literals into a plain string", () => {
    // Button: native `type` is "button" | "submit" | "reset"; an anchor's
    // `type` is any string.
    const { properties } = collectPropsFromParts(
      [
        {
          anyOf: [
            {
              properties: {
                type: { type: "string", enum: ["button", "submit", "reset"] },
              },
            },
            { properties: { type: { type: "string" } } },
          ],
        },
      ],
      undefined,
    );
    expect(properties.type).toEqual({ type: "string" });
  });

  it("requires a prop only when every union member requires it", () => {
    const { required } = collectPropsFromParts(
      [
        {
          anyOf: [
            { properties: { id: { type: "string" } }, required: ["id"] },
            { properties: { id: { type: "string" } }, required: ["id"] },
          ],
        },
      ],
      undefined,
    );
    expect(required).toEqual(["id"]);
  });

  it("follows $refs and nested intersections", () => {
    const definitions: Record<string, Definition> = {
      "Base<string>": {
        allOf: [{ properties: { a: { type: "string" } }, required: ["a"] }],
      },
    };
    const { properties, required } = collectPropsFromParts(
      [{ $ref: "#/definitions/Base%3Cstring%3E" }],
      definitions,
    );
    expect(properties.a).toEqual({ type: "string" });
    expect(required).toEqual(["a"]);
  });
});
