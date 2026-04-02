import {
  ClipboardText,
  KumoLocaleProvider,
  Pagination,
  type KumoTranslationsPartial,
} from "@cloudflare/kumo";
import { useMemo, useState } from "react";

/** Default English locale (no provider needed, but shown for explicitness) */
export function KumoLocaleProviderBasicDemo() {
  return <ClipboardText text="npm install @cloudflare/kumo" size="sm" />;
}

export function KumoLocaleProviderChineseDemo() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const trans = useMemo(
    () =>
      ({
        pagination: {
          perPage: "每页",
          showInfo: "显示 {range} 条，共 {total} 条",
        },
      }) as KumoTranslationsPartial,
    [],
  );

  return (
    <KumoLocaleProvider translations={trans}>
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        totalCount={500}
      >
        <Pagination.Info />
        <Pagination.Separator />
        <Pagination.PageSize
          value={perPage}
          onChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
        <Pagination.Controls />
      </Pagination>
    </KumoLocaleProvider>
  );
}

export function KumoLocaleProviderFrenchDemo() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const trans = useMemo(
    () =>
      ({
        pagination: {
          perPage: "Par page",
          showInfo: "Affichage de {range} sur {total} éléments",
        },
      }) satisfies KumoTranslationsPartial,
    [],
  );

  return (
    <KumoLocaleProvider translations={trans}>
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        totalCount={500}
      >
        <Pagination.Info />
        <Pagination.Separator />
        <Pagination.PageSize
          value={perPage}
          onChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
        <Pagination.Controls />
      </Pagination>
    </KumoLocaleProvider>
  );
}
