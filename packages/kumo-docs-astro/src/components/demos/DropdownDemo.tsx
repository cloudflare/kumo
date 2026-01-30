import { useState } from "react";
import { DropdownMenu, Button } from "@cloudflare/kumo";
import {
  PlusIcon,
  UserIcon,
  CreditCardIcon,
  MoonIcon,
  SignOutIcon,
} from "@phosphor-icons/react";

export function DropdownBasicDemo() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />
      <DropdownMenu.Content>
        <DropdownMenu.Item>Worker</DropdownMenu.Item>
        <DropdownMenu.Item>Pages</DropdownMenu.Item>
        <DropdownMenu.Item>KV Namespace</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

const languages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
];

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
];

export function DropdownCheckboxDemo() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button>View Options</Button>} />
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Display</DropdownMenu.Label>
          <DropdownMenu.CheckboxItem
            checked={showSidebar}
            onCheckedChange={setShowSidebar}
          >
            Show sidebar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={showLineNumbers}
            onCheckedChange={setShowLineNumbers}
          >
            Show line numbers
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={wordWrap}
            onCheckedChange={setWordWrap}
          >
            Word wrap
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export function DropdownNestedDemo() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button icon={UserIcon}>Account</Button>} />
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={UserIcon}>Profile</DropdownMenu.Item>
        <DropdownMenu.Item icon={CreditCardIcon}>Billing</DropdownMenu.Item>
        <DropdownMenu.Item icon={MoonIcon}>Dark mode</DropdownMenu.Item>

        {/* Language submenu with RadioGroup */}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Language</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Group>
              <DropdownMenu.RadioGroup value={language} onValueChange={setLanguage}>
                {languages.map((lang) => (
                  <DropdownMenu.RadioItem key={lang.code} value={lang.code}>
                    {lang.label}
                    <DropdownMenu.RadioItemIndicator />
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Group>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        {/* Timezone submenu with RadioGroup */}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Set Timezone</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Group>
              <DropdownMenu.RadioGroup value={timezone} onValueChange={setTimezone}>
                {timezones.map((tz) => (
                  <DropdownMenu.RadioItem key={tz.value} value={tz.value}>
                    {tz.label}
                    <DropdownMenu.RadioItemIndicator />
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Group>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={SignOutIcon} variant="danger">
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
