import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { HighlightColor, VocabularyStatus } from "@/types/vocabulary";
import { getEmoji, getLanguage, getName } from "language-flag-colors";

const COLOR_OPTIONS = [
  { value: "all" as const, label: "All colors" },
  { value: "yellow" as const, label: "Yellow" },
  { value: "green" as const, label: "Green" },
  { value: "blue" as const, label: "Blue" },
  { value: "pink" as const, label: "Pink" },
  { value: "purple" as const, label: "Purple" },
];

const STATUS_OPTIONS = [
  { value: "all" as const, label: "All statuses" },
  { value: "new" as const, label: "New" },
  { value: "learning" as const, label: "Learning" },
  { value: "mastered" as const, label: "Mastered" },
];

export function VocabularyFilters({
  statusFilter,
  onStatusChange,
  languageFilter,
  onLanguageChange,
  colorFilter,
  onColorChange,
  onReset,
  availableLanguages,
}: {
  statusFilter: "all" | VocabularyStatus;
  onStatusChange: (value: "all" | VocabularyStatus) => void;
  languageFilter: string;
  onLanguageChange: (value: string) => void;
  colorFilter: "all" | HighlightColor;
  onColorChange: (value: "all" | HighlightColor) => void;
  onReset: () => void;
  availableLanguages: Array<{ language: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium">Filters</h3>

      <div className="grid gap-3 md:grid-cols-3">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
        />

        <FilterSelect
          label="Language"
          value={languageFilter}
          onChange={onLanguageChange}
          options={[
            { value: "all", label: "All languages" },
            ...availableLanguages
              .map((lang) => lang.language)
              .sort()
              .map((language) => ({
                value: language,
                label: formatLanguage(language),
              })),
          ]}
        />

        <FilterSelect
          label="Highlight color"
          value={colorFilter}
          onChange={onColorChange}
          options={COLOR_OPTIONS}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function formatLanguage(language: string) {
  const country = getLanguage(language)?.country ?? "";
  const emoji = country ? getEmoji(country) : "";
  const name = getName(language) || language.toUpperCase();
  return `${emoji ? `${emoji} ` : ""}${name}`;
}

export { COLOR_OPTIONS, STATUS_OPTIONS };
