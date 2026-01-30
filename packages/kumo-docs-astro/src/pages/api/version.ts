import type { APIRoute } from "astro";

declare const __KUMO_VERSION__: string;
declare const __DOCS_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_COMMIT_DATE__: string;
declare const __BUILD_BRANCH__: string;
declare const __BUILD_DATE__: string;

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      kumoVersion: __KUMO_VERSION__,
      docsVersion: __DOCS_VERSION__,
      commit: __BUILD_COMMIT__,
      commitDate: __BUILD_COMMIT_DATE__,
      branch: __BUILD_BRANCH__,
      buildDate: __BUILD_DATE__,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
