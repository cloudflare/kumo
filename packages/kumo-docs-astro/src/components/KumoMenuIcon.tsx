import { useState } from "react";
import { cn } from "@cloudflare/kumo";

interface KumoMenuIconProps {
  className?: string;
}

export function KumoMenuIcon({ className }: KumoMenuIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "h-[19.8px] w-[20px] cursor-pointer overflow-visible",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 108 107"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <clipPath id="contentClip">
            <rect x="0" y="25" width="108" height="82" />
          </clipPath>
        </defs>

        {/* Vertical connector - NOT clipped */}
        <path
          className={cn(
            "origin-center-top transition-all duration-800",
            isHovered
              ? "translate-y-[22px] scale-y-0 opacity-0"
              : "translate-y-0 scale-y-100 opacity-100",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: "0.03s",
          }}
          d="M48.8398 2.75977H57.5998V52.9198H48.8398V2.75977Z"
          fill="currentColor"
        />

        {/* Character parts that will animate away (clipped below y=25) */}
        <g clipPath="url(#contentClip)">
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[33px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.05s",
            }}
            d="M13.7998 57.96H93.2398V65.04H13.7998V57.96Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[49px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.1s",
            }}
            d="M0 73.5601H107.28V80.7601H0V73.5601Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[51px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.15s",
            }}
            d="M33.0002 75.2402L43.5602 77.1602C41.0802 81.0802 38.3202 85.1202 35.2802 89.2802C32.3202 93.3602 29.5202 96.8802 26.8802 99.8402L19.2002 97.5602C20.8802 95.5602 22.5602 93.2402 24.2402 90.6002C26.0002 87.9602 27.6402 85.3202 29.1602 82.6802C30.6802 79.9602 31.9602 77.4802 33.0002 75.2402Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[70px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.2s",
            }}
            d="M6.6001 94.92C13.3201 94.76 21.2001 94.6 30.2401 94.44C39.3601 94.28 49.0401 94.08 59.2801 93.84C69.6001 93.52 79.8801 93.24 90.1201 93L89.7601 100.2C79.8401 100.52 69.8401 100.88 59.7601 101.28C49.6801 101.68 40.1601 102 31.2001 102.24C22.2401 102.48 14.3201 102.72 7.4401 102.96L6.6001 94.92Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "translate-y-[25px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0s",
            }}
            d="M9.35986 0H97.7999V7.2H9.35986V0Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[5px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.05s",
            }}
            d="M17.1602 30.2402H42.6002V36.4802H17.1602V30.2402Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[19px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.1s",
            }}
            d="M14.6401 44.04H42.4801V50.28H14.6401V44.04Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[19px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.1s",
            }}
            d="M63.96 44.04H93V50.28H63.96V44.04Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[5px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.05s",
            }}
            d="M63.96 30.2402H89.76V36.4802H63.96V30.2402Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "translate-y-[9px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.02s",
            }}
            d="M2.75977 15.8398H104.64V41.7598H96.2398V22.9198H10.9198V41.7598H2.75977V15.8398Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "translate-y-[9px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.02s",
            }}
            d="M104.64 15.8398H2.75977V22.9198H10.9198H96.2398H104.64V15.8398Z"
            fill="currentColor"
          />
          <path
            className={cn(
              "origin-center-top transition-all duration-800",
              isHovered
                ? "-translate-y-[60px] scale-y-[0.01]"
                : "translate-y-0 scale-y-100",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.25s",
            }}
            d="M66.3599 84.6001L73.9199 80.6401C77.1999 82.6401 80.5999 84.9201 84.1199 87.4801C87.7199 90.0401 91.0799 92.6402 94.1999 95.2802C97.3199 97.8402 99.8799 100.2 101.88 102.36L93.8399 106.68C91.9999 104.52 89.5599 102.12 86.5199 99.4801C83.4799 96.9201 80.1999 94.3201 76.6799 91.6801C73.1599 89.0401 69.7199 86.6801 66.3599 84.6001Z"
            fill="currentColor"
          />
        </g>

        {/* Hamburger lines (on top, not clipped) */}
        <rect
          className={cn(
            "origin-left-center transition-all duration-800",
            isHovered
              ? "h-[6px] translate-x-[0.36px] translate-y-[24.88px]"
              : "h-[7px]",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          x="9.64014"
          y="0.120117"
          width="88"
          fill="currentColor"
        />
        <rect
          className={cn(
            "origin-left-center transition-all duration-800",
            isHovered
              ? "h-[6px] translate-x-[7.36px] translate-y-[30.88px] scale-x-[0.863]"
              : "h-[9px]",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          x="2.64014"
          y="16.1201"
          width="102"
          fill="currentColor"
        />
        <rect
          className={cn(
            "origin-left-center transition-all duration-800",
            isHovered
              ? "h-[6px] -translate-x-[3.64px] -translate-y-[11.12px] scale-x-[1.114] opacity-0"
              : "h-[6px] opacity-100",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          x="13.6401"
          y="58.1201"
          width="79"
          fill="currentColor"
        />
        <rect
          className={cn(
            "origin-left-center transition-all duration-800",
            isHovered
              ? "h-[6px] translate-x-[9.36px] -translate-y-[5.12px] scale-x-[0.83]"
              : "h-[6px]",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          x="0.640137"
          y="74.1201"
          width="106"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
