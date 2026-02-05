import { useState } from "react";
import { Badge, Button, LayerCard, Table } from "@cloudflare/kumo";
import { DotsThree, EnvelopeSimple } from "@phosphor-icons/react";

// Sample data for demos
const emailData = [
  {
    id: "1",
    subject: "Kumo v1.0.0 released",
    from: "Visal In",
    date: "5 seconds ago",
  },
  {
    id: "2",
    subject: "New Job Offer",
    from: "Cloudflare",
    date: "10 minutes ago",
  },
  {
    id: "3",
    subject: "Daily Email Digest",
    from: "Cloudflare",
    date: "1 hour ago",
    tags: ["promotion"],
  },
  {
    id: "4",
    subject: "GitLab - New Comment",
    from: "Rob Knecht",
    date: "1 day ago",
  },
  {
    id: "5",
    subject: "Out of Office",
    from: "Johnnie Lappen",
    date: "3 days ago",
  },
];

export function TableBasicDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableWithCheckboxDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead aria-label="Select all rows" />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.CheckCell aria-label={`Select ${row.subject}`} />
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableSelectedRowDemo() {
  const rows = emailData.slice(0, 3);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["2"]));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead
                checked={selectedIds.size === rows.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size < rows.length
                }
                onValueChange={toggleAll}
                aria-label="Select all rows"
              />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                variant={selectedIds.has(row.id) ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={selectedIds.has(row.id)}
                  onValueChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableFixedLayoutDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table layout="fixed">
          <colgroup>
            <col />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableFullDemo() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["2"]));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === emailData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emailData.map((r) => r.id)));
    }
  };

  return (
    <LayerCard>
      <LayerCard.Primary className="w-full overflow-x-auto p-0">
        <Table layout="fixed">
          <colgroup>
            <col style={{ width: "40px" }} />
            <col />
            <col style={{ width: "150px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "50px" }} />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead
                checked={selectedIds.size === emailData.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size < emailData.length
                }
                onValueChange={toggleAll}
                aria-label="Select all rows"
              />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row) => (
              <Table.Row
                key={row.id}
                variant={selectedIds.has(row.id) ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={selectedIds.has(row.id)}
                  onValueChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <EnvelopeSimple size={16} />
                    <span className="truncate">{row.subject}</span>
                    {row.tags && (
                      <div className="ml-2 inline-flex gap-1">
                        {row.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.from}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.date}</span>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label="More options"
                  >
                    <DotsThree weight="bold" size={16} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}
