import { ChartPalette, LayerCard, Table } from "@cloudflare/kumo";

export function ColorDemo() {
  const ColorName = [
    "Attention",
    "Warning",
    "Neutral",
    "NeutralLight",
    "Disabled",
    "DisabledLight",
  ];

  const categoricalColorIndices = Array.from({ length: 10 }, (_, i) => i);

  return (
    <>
      <LayerCard>
        <LayerCard.Secondary>Semantic Colors</LayerCard.Secondary>
        <LayerCard.Primary className="p-0">
          <Table>
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <Table.Header>
              <Table.Row>
                <Table.Head>Semantic Color</Table.Head>
                <Table.Head>Light</Table.Head>
                <Table.Head>Dark</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ColorName.map((name) => (
                <Table.Row key={name}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: ChartPalette.semantic(name as any),
                        }}
                        className="-m-1 size-6 rounded p-1"
                      />
                      <span className="ml-1 font-mono text-xs">
                        {ChartPalette.semantic(name as any)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: ChartPalette.semantic(
                            name as any,
                            true,
                          ),
                        }}
                        className="-m-1 size-6 rounded p-1"
                      />
                      <span className="ml-1 font-mono text-xs">
                        {ChartPalette.semantic(name as any, true)}
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </LayerCard.Primary>
      </LayerCard>

      <LayerCard>
        <LayerCard.Secondary>Categorical Colors</LayerCard.Secondary>
        <LayerCard.Primary className="p-0">
          <Table>
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <Table.Header>
              <Table.Row>
                <Table.Head>Index</Table.Head>
                <Table.Head>Light</Table.Head>
                <Table.Head>Dark</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categoricalColorIndices.map((colorIdx) => (
                <Table.Row key={colorIdx}>
                  <Table.Cell>{colorIdx}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: ChartPalette.color(colorIdx, false),
                        }}
                        className="-m-1 size-6 rounded p-1"
                      />
                      <span className="ml-1 font-mono text-xs">
                        {ChartPalette.color(colorIdx, false)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: ChartPalette.color(colorIdx, true),
                        }}
                        className="-m-1 size-6 rounded p-1"
                      />
                      <span className="ml-1 font-mono text-xs">
                        {ChartPalette.color(colorIdx, true)}
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </LayerCard.Primary>
      </LayerCard>
    </>
  );
}
