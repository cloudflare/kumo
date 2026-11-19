import type { Definition } from "ts-json-schema-generator";

export interface CollectedProps {
  properties: Record<string, Definition>;
  required: string[];
}

// `prop?: undefined` in a union member is emitted as `{ not: {} }`. It rules
// the prop out for that member rather than giving it a type.
function isExcluded(def: Definition): boolean {
  return (
    typeof def.not === "object" &&
    def.not !== null &&
    Object.keys(def.not).length === 0 &&
    Object.keys(def).length === 1
  );
}

function resolvePart(
  part: Definition,
  definitions: Record<string, Definition> | undefined,
): Definition | undefined {
  if (!part.$ref) return part;
  const refName = decodeURIComponent(part.$ref.split("/").pop()!);
  return definitions?.[refName];
}

function isPlainString(def: Definition): boolean {
  return def.type === "string" && Object.keys(def).length === 1;
}

function isStringLiteralEnum(def: Definition): boolean {
  return (
    Array.isArray(def.enum) &&
    def.enum.every((value) => typeof value === "string")
  );
}

/**
 * Merges the definitions a prop has across union members, independent of
 * member order: exclusions are dropped, identical definitions collapse,
 * string literals are absorbed by a plain `string`, and the remaining
 * different definitions become an `anyOf`. The first description is kept.
 */
function mergeUnionProp(defs: Definition[]): Definition {
  const typed = defs.filter((def) => !isExcluded(def));
  if (typed.length === 0) return defs[0];

  const unique: Definition[] = [];
  const seen = new Set<string>();
  for (const def of typed) {
    const { description: _description, ...shape } = def;
    const key = JSON.stringify(shape);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(shape);
  }

  const shapes = unique.some(isPlainString)
    ? unique.filter((def) => !isStringLiteralEnum(def))
    : unique;

  const description = typed.find((def) => def.description)?.description;
  const merged: Definition =
    shapes.length === 1 ? shapes[0] : { anyOf: shapes };
  return description ? { ...merged, description } : merged;
}

/**
 * Collects props and required names from the parts of an intersection.
 * Parts can be `$ref`s, nested intersections (`allOf`), or nested unions
 * (`anyOf`/`oneOf`). A union contributes every member's props; a prop is
 * required only if every member requires it.
 */
export function collectPropsFromParts(
  parts: Definition[],
  definitions: Record<string, Definition> | undefined,
): CollectedProps {
  let properties: Record<string, Definition> = {};
  let required: string[] = [];

  for (const rawPart of parts) {
    const part = resolvePart(rawPart, definitions);
    if (!part) continue;

    if (part.properties) {
      properties = {
        ...properties,
        ...(part.properties as Record<string, Definition>),
      };
    }
    if (part.required) {
      required = [...required, ...part.required];
    }
    if (part.allOf) {
      const nested = collectPropsFromParts(
        part.allOf as Definition[],
        definitions,
      );
      properties = { ...properties, ...nested.properties };
      required = [...required, ...nested.required];
    }
    const unionMembers = (part.anyOf ?? part.oneOf) as Definition[] | undefined;
    if (unionMembers) {
      const members = unionMembers.map((member) =>
        collectPropsFromParts([member], definitions),
      );
      const defsByProp = new Map<string, Definition[]>();
      for (const member of members) {
        for (const [name, def] of Object.entries(member.properties)) {
          defsByProp.set(name, [...(defsByProp.get(name) ?? []), def]);
        }
      }
      for (const [name, defs] of defsByProp) {
        properties[name] = mergeUnionProp(defs);
      }
      required = [
        ...required,
        ...[...defsByProp.keys()].filter((name) =>
          members.every((member) => member.required.includes(name)),
        ),
      ];
    }
  }

  return { properties, required: [...new Set(required)] };
}
