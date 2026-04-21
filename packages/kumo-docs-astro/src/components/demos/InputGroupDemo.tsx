import { useRef, useState } from "react";
import { InputGroup, Loader } from "@cloudflare/kumo";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  QuestionIcon,
  XIcon,
} from "@phosphor-icons/react";

export function InputGroupDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">(
    "success",
  );
  const [value, setValue] = useState("kumo");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;

    setValue(next);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (next.length > 0) {
      setStatus("loading");

      timerRef.current = setTimeout(() => setStatus("success"), 1500);
    } else {
      setStatus("idle");
    }
  };

  return (
    <div className="w-full max-w-2xs">
      <InputGroup>
        <InputGroup.Input
          maxLength={20}
          onChange={handleChange}
          value={value}
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        {status !== "idle" && (
          <InputGroup.Addon align="end">
            {status === "loading" ? (
              <Loader />
            ) : (
              <CheckCircleIcon weight="duotone" className="text-kumo-success" />
            )}
          </InputGroup.Addon>
        )}
      </InputGroup>
    </div>
  );
}

export function InputGroupIconsDemo() {
  return (
    <InputGroup className="w-full max-w-3xs">
      <InputGroup.Addon>
        <LinkIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Paste a link..." aria-label="Link" />
    </InputGroup>
  );
}

export function InputGroupTextDemo() {
  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="w-full max-w-3xs">
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input placeholder="username" aria-label="Username" />
      </InputGroup>

      <InputGroup className="w-full max-w-3xs">
        <InputGroup.Input placeholder="email" aria-label="Email" />
        <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
      </InputGroup>

      <InputGroup className="w-full max-w-3xs">
        <InputGroup.Addon>/api/</InputGroup.Addon>
        <InputGroup.Input placeholder="endpoint" aria-label="API path" />
        <InputGroup.Addon align="end">.json</InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export function InputGroupButtonsDemo() {
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("search");

  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="w-full max-w-3xs">
        <InputGroup.Input
          type={show ? "text" : "password"}
          defaultValue="password"
          aria-label="Password"
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={show ? EyeSlashIcon : EyeIcon}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup className="w-full max-w-3xs">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input
          value={searchValue}
          placeholder="Search"
          aria-label="Search"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <InputGroup.Addon align="end" className="pr-1">
            <InputGroup.Button
              aria-label="Clear search"
              onClick={() => setSearchValue("")}
            >
              <XIcon />
            </InputGroup.Button>
          </InputGroup.Addon>
        )}
        <InputGroup.Button variant="secondary" onClick={() => {}}>
          Search
        </InputGroup.Button>
      </InputGroup>
    </div>
  );
}

export function InputGroupTooltipButtonDemo() {
  return (
    <InputGroup className="w-full max-w-2xs">
      <InputGroup.Addon>
        <MagnifyingGlassIcon />
      </InputGroup.Addon>
      <InputGroup.Input
        placeholder="Search with query language..."
        aria-label="Search"
      />
      <InputGroup.Addon align="end">
        <InputGroup.Button
          className="text-kumo-subtle"
          icon={QuestionIcon}
          tooltip="Query language help"
          onClick={() => {}}
        />
      </InputGroup.Addon>
    </InputGroup>
  );
}

export function InputGroupKbdDemo() {
  return (
    <InputGroup className="w-full max-w-3xs">
      <InputGroup.Addon>
        <MagnifyingGlassIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search..." aria-label="Search" />
      <InputGroup.Addon align="end">
        <kbd className="bg-none! border-none!">⌘K</kbd>
      </InputGroup.Addon>
    </InputGroup>
  );
}

export function InputGroupLoadingDemo() {
  return (
    <InputGroup className="w-full max-w-3xs">
      <InputGroup.Input defaultValue="kumo" aria-label="kumo" />
      <InputGroup.Addon align="end">
        <Loader />
      </InputGroup.Addon>
    </InputGroup>
  );
}

export function InputGroupSuffixDemo() {
  return (
    <div className="flex w-full max-w-2xs flex-col gap-4">
      <InputGroup label="Subdomain">
        <InputGroup.Input
          aria-label="Subdomain"
          defaultValue="kumo"
          maxLength={20}
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        <InputGroup.Addon align="end">
          <CheckCircleIcon weight="duotone" className="text-kumo-success" />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup
        label="Subdomain"
        error={{ message: "This subdomain is unavailable", match: true }}
      >
        <InputGroup.Input
          aria-label="Subdomain"
          defaultValue="kumo"
          maxLength={20}
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        <InputGroup.Addon align="end">
          <XCircleIcon weight="duotone" className="text-kumo-danger" />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export function InputGroupSizesDemo() {
  return (
    <div className="flex w-full max-w-3xs flex-col gap-4">
      <InputGroup size="xs" label="Extra Small">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Extra small input" />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={QuestionIcon}
            shape="square"
            aria-label="Help"
          />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup size="sm" label="Small">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Small input" />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={QuestionIcon}
            shape="square"
            aria-label="Help"
          />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup label="Base (default)">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Base input" />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={QuestionIcon}
            shape="square"
            aria-label="Help"
          />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup size="lg" label="Large">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Large input" />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={QuestionIcon}
            shape="square"
            aria-label="Help"
          />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export function InputGroupStatesDemo() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex w-full max-w-3xs flex-col gap-4">
      <InputGroup
        label="Error State"
        error={{ message: "Please enter a valid email address", match: true }}
      >
        <InputGroup.Input type="email" defaultValue="invalid-email" />
        <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
      </InputGroup>

      <InputGroup label="Disabled" disabled>
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." />
      </InputGroup>

      <InputGroup label="Optional Field" required={false}>
        <InputGroup.Addon>$</InputGroup.Addon>
        <InputGroup.Input placeholder="0.00" />
      </InputGroup>

      <InputGroup
        label="With Description"
        description="Must be at least 8 characters"
        labelTooltip="Your password is stored securely"
      >
        <InputGroup.Input
          type={show ? "text" : "password"}
          placeholder="Password"
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            className="text-kumo-subtle"
            icon={show ? EyeSlashIcon : EyeIcon}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}
