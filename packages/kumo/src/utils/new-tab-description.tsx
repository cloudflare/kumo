import { useId, type ReactNode } from "react";
import { useKumoLocale } from "./locale-provider";

export function useNewTabDescription({
  announce,
  ariaDescribedBy,
  ariaDescription,
}: {
  announce: boolean;
  ariaDescribedBy?: string;
  ariaDescription?: string;
}) {
  const { link } = useKumoLocale();
  const warningId = useId();
  const authoredDescriptionId = useId();

  if (!announce) {
    return {
      description: null,
      describedBy: ariaDescribedBy,
    };
  }

  const existingDescriptionIds = ariaDescribedBy?.trim();
  const preserveAriaDescription =
    !existingDescriptionIds && typeof ariaDescription === "string";
  const describedBy = [
    existingDescriptionIds,
    preserveAriaDescription ? authoredDescriptionId : undefined,
    warningId,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    describedBy,
    description: (
      <>
        {preserveAriaDescription ? (
          <HiddenDescription id={authoredDescriptionId}>
            {ariaDescription}
          </HiddenDescription>
        ) : null}
        <HiddenDescription id={warningId}>
          {link.opensInNewTab}
        </HiddenDescription>
      </>
    ),
  };
}

function HiddenDescription({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  return (
    <span id={id} hidden>
      {children}
    </span>
  );
}
