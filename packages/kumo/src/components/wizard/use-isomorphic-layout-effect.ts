import { useEffect, useLayoutEffect } from "react";

// SSR-safe layout effect — avoids the React "useLayoutEffect does nothing on the server" warning. Falls back to useEffect during SSR.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
