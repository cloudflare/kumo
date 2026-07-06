export const defaultValueFormat = (value: number) => value.toLocaleString();

/** Escape HTML special characters to prevent XSS in default tooltips. */
export const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
