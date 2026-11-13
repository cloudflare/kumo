import { useState, useEffect } from "react";
import { Button, DropdownMenu } from "@cloudflare/kumo";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

type ThemePreference = "light" | "dark" | "system";

const themeIcons: Record<ThemePreference, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: DesktopIcon,
};

const themeOptions = [
  { value: "light", label: "Light", icon: themeIcons.light },
  { value: "dark", label: "Dark", icon: themeIcons.dark },
  { value: "system", label: "System", icon: themeIcons.system },
] as const;

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const getCurrentTheme = () => {
      const stored = localStorage.getItem("theme");
      return isThemePreference(stored) ? stored : "system";
    };

    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<{ theme?: string }>).detail
        ?.theme;
      if (isThemePreference(nextTheme)) {
        setTheme(nextTheme);
      }
    };

    setMounted(true);
    setTheme(getCurrentTheme());
    window.addEventListener("kumo:theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("kumo:theme-change", handleThemeChange);
    };
  }, []);

  const selectTheme = (newTheme: string) => {
    if (!isThemePreference(newTheme)) return;

    const resolvedTheme =
      newTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : newTheme;

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-mode", resolvedTheme);
    window.dispatchEvent(
      new CustomEvent("kumo:theme-change", {
        detail: { theme: newTheme, resolvedTheme },
      }),
    );
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" shape="square" aria-label="Select theme">
        <DesktopIcon size={20} />
      </Button>
    );
  }

  const ActiveIcon = themeIcons[theme];

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            shape="square"
            aria-label={`Select theme, current theme is ${theme}`}
          >
            <ActiveIcon size={20} />
          </Button>
        }
      />
      <DropdownMenu.Content align="end">
        <DropdownMenu.RadioGroup value={theme} onValueChange={selectTheme}>
          <DropdownMenu.Label>Theme</DropdownMenu.Label>
          {themeOptions.map((option) => (
            <DropdownMenu.RadioItem
              key={option.value}
              value={option.value}
              icon={option.icon}
            >
              {option.label}
              <DropdownMenu.RadioItemIndicator />
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
