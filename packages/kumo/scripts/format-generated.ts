import { writeFileSync } from "node:fs";
import { format } from "vite-plus/fmt";

export async function writeFormattedFile(filePath: string, content: string) {
  const result = await format(filePath, content, { printWidth: 80 });

  if (result.errors.length > 0) {
    throw new Error(`Failed to format generated file: ${filePath}`);
  }

  writeFileSync(filePath, result.code, "utf-8");
}
