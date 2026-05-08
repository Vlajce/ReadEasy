import { cn } from "@/lib/utils";

export type AdminSectionTab = "users" | "insights";

interface AdminSectionTabsProps {
  value: AdminSectionTab;
  onChange: (value: AdminSectionTab) => void;
}

const tabs: Array<{ label: string; value: AdminSectionTab }> = [
  { label: "Users", value: "users" },
  { label: "Insights", value: "insights" },
];

export function AdminSectionTabs({ value, onChange }: AdminSectionTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={cn(
            "rounded-lg px-6 py-2 text-sm font-semibold transition",
            value === tab.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-muted-foreground hover:text-slate-900",
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
