import { cn } from "~/components/utils";

interface ThemeToggleProps {
  isDark: boolean;
  onClick: () => void;
  className?: string;
}

export function ThemeToggle({ isDark, onClick, className }: ThemeToggleProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-[20px] h-[20px] overflow-visible cursor-pointer relative",
        className
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Sun rays */}
        <g
          className={cn(
            "transition-all duration-500 origin-center",
            isDark
              ? "opacity-0 scale-0 rotate-90"
              : "opacity-100 scale-100 rotate-0"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <path
            d="M16 5V2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 8L6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 24L6 26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 8L26 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 24L26 26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 16H2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 27V30"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 16H30"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Sun circle */}
        <circle
          cx="16"
          cy="16"
          r="7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "transition-all duration-500 origin-center",
            isDark
              ? "opacity-0 scale-[0.3]"
              : "opacity-100 scale-100"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Moon */}
        <path
          d="M13.5136 3.51367C12.885 5.59375 12.8324 7.80542 13.3615 9.91303C13.8905 12.0206 14.9815 13.9452 16.518 15.4818C18.0546 17.0183 19.9792 18.1093 22.0868 18.6383C24.1944 19.1674 26.406 19.1148 28.4861 18.4862C27.8831 20.4689 26.7768 22.2617 25.2751 23.6899C23.7734 25.1181 21.9274 26.133 19.9169 26.6359C17.9064 27.1387 15.8 27.1123 13.8027 26.5592C11.8055 26.0061 9.98551 24.9451 8.52009 23.4797C7.05467 22.0143 5.99374 20.1943 5.44064 18.1971C4.88754 16.1998 4.86111 14.0934 5.36394 12.0829C5.86677 10.0724 6.8817 8.22639 8.30991 6.72467C9.73811 5.22295 11.5309 4.1167 13.5136 3.51367Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "transition-all duration-500 origin-center",
            isDark
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-[0.3] -rotate-90"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
    </button>
  );
}
