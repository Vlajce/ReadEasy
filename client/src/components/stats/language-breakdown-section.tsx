import { Globe2 } from "lucide-react";
import { getName } from "language-flag-colors";
import type { LanguageStatsItem } from "@/types/vocabulary";

interface LanguageBreakdownSectionProps {
  languages: LanguageStatsItem[];
}

const LANGUAGE_COLORS = [
  "#378ADD",
  "#EF9F27",
  "#1D9E75",
  "#9B6DFF",
  "#E05C8A",
  "#3DBDD4",
];

export function LanguageBreakdownSection({
  languages,
}: LanguageBreakdownSectionProps) {
  if (!languages || languages.length === 0) {
    return null;
  }

  const maxTotal = Math.max(...languages.map((l) => l.total));

  return (
    <div
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50">
          <Globe2 className="w-5 h-5 text-zinc-900" />
        </div>{" "}
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Languages
        </div>
      </div>

      {/* Language rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {languages.map((lang, index) => {
          const color = LANGUAGE_COLORS[index % LANGUAGE_COLORS.length];
          const barWidth = (lang.total / maxTotal) * 100;

          return (
            <div key={lang.language}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {getName(lang.language) || lang.language}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {lang.total} words
                </span>
              </div>

              <div
                style={{
                  height: "6px",
                  backgroundColor: "var(--color-background-secondary)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    backgroundColor: color,
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
