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
            <Table.Row>
              <Table.CheckCell aria-label="Select row 1" />
              <Table.Cell>Kumo v1.0.0 released</Table.Cell>
              <Table.Cell>Visal In</Table.Cell>
              <Table.Cell>5 seconds ago</Table.Cell>
            </Table.Row>
            <Table.Row variant="selected">
              <Table.CheckCell checked aria-label="Select row 2" />
              <Table.Cell>New Job Offer</Table.Cell>
              <Table.Cell>Cloudflare</Table.Cell>
              <Table.Cell>10 minutes ago</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.CheckCell aria-label="Select row 3" />
              <Table.Cell>Daily Email Digest</Table.Cell>
              <Table.Cell>Cloudflare</Table.Cell>
              <Table.Cell>1 hour ago</Table.Cell>
            </Table.Row>
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
              <Table.CheckHead aria-label="Select all rows" />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row, index) => (
              <Table.Row
                key={row.id}
                variant={index === 1 ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={index === 1}
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
