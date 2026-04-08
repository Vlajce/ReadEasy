import { getName } from "language-flag-colors";
import type { LanguageStatsItem } from "@/types/vocabulary";

interface LanguageBreakdownSectionProps {
  languages: LanguageStatsItem[];
}

const COLORS = {
  new: "#378ADD",
  learning: "#EF9F27",
  mastered: "#1D9E75",
};

export function LanguageBreakdownSection({
  languages,
}: LanguageBreakdownSectionProps) {
  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginBottom: "16px",
        }}
      >
        Progress by language
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {languages.map((lang) => {
          const total = lang.total;
          const newPct = (lang.byStatus.new / total) * 100;
          const learningPct = (lang.byStatus.learning / total) * 100;
          const masteredPct = (lang.byStatus.mastered / total) * 100;

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
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                    {lang.language.toUpperCase()}
                  </span>
                  <span>{getName(lang.language) || lang.language}</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {total} words
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
                    display: "flex",
                  }}
                >
                  {newPct > 0 && (
                    <div
                      style={{
                        width: `${newPct}%`,
                        backgroundColor: COLORS.new,
                        borderRadius:
                          newPct === 100
                            ? "3px"
                            : newPct > 0
                              ? "3px 0 0 3px"
                              : "0",
                      }}
                    />
                  )}
                  {learningPct > 0 && (
                    <div
                      style={{
                        width: `${learningPct}%`,
                        backgroundColor: COLORS.learning,
                      }}
                    />
                  )}
                  {masteredPct > 0 && (
                    <div
                      style={{
                        width: `${masteredPct}%`,
                        backgroundColor: COLORS.mastered,
                        borderRadius: masteredPct > 0 ? "0 3px 3px 0" : "0",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div
          style={{
            display: "flex",
            gap: "16px",
            paddingTop: "4px",
            borderTop: "0.5px solid var(--color-border-tertiary)",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                backgroundColor: COLORS.new,
                display: "inline-block",
              }}
            />
            New
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                backgroundColor: COLORS.learning,
                display: "inline-block",
              }}
            />
            Learning
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                backgroundColor: COLORS.mastered,
                display: "inline-block",
              }}
            />
            Mastered
          </span>
        </div>
      </div>
    </div>
  );
}
