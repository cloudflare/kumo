import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    inert?: boolean | undefined;
  }
}
