import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { ActivityStatsItem } from "@/types/vocabulary";

interface DailyActivityChartProps {
  activity: ActivityStatsItem[];
  days: 7 | 30;
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  value: number;
}

export function DailyActivityChart({
  activity,
  days,
}: DailyActivityChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const filteredData = activity.slice(activity.length - days);

  const chartData: Array<{ name: string; value: number; date: string }> =
    (() => {
      if (days === 7) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dataMap = new Map<string, number>();
        filteredData.forEach((item: ActivityStatsItem) => {
          dataMap.set(item.date, item.wordsAdded);
        });

        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = dayNames[d.getUTCDay()];
          result.push({
            name: dayName,
            value: dataMap.get(dateStr) || 0,
            date: dateStr,
          });
        }
        return result;
      } else {
        return filteredData.map((item: ActivityStatsItem) => {
          const date = new Date(item.date);
          const day = date.getUTCDate();
          const month = date.getUTCMonth() + 1;
          return {
            name: `${day}/${month}`,
            value: item.wordsAdded,
            date: item.date,
          };
        });
      }
    })();

  return (
    <div
      style={{
        backgroundColor: "var(--color-background-secondary, #f9f9f9)",
        border: "0.5px solid var(--color-border-tertiary, #ebebeb)",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "14px",
        }}
      >
        Daily vocabulary
      </div>

      <div style={{ position: "relative", height: "160px" }}>
        {tooltip && tooltip.value > 0 && (
          <div
            style={{
              position: "absolute",
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translateX(-50%) translateY(calc(-100% - 8px))",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                backgroundColor: "#2a2a2a",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                minWidth: "60px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {tooltip.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#60A5FA",
                    borderRadius: "2px",
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {tooltip.value}
                </span>
              </div>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -40, bottom: 0 }}
            onMouseLeave={() => setTooltip(null)}
          >
            <CartesianGrid
              strokeDasharray="0"
              vertical={false}
              stroke="rgba(0,0,0,0.05)"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              interval={days === 7 ? 0 : 4}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, "dataMax"]}
            />
            <RechartsTooltip content={() => null} cursor={false} />
            <Bar
              dataKey="value"
              fill="#60A5FA"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              onMouseEnter={(data, _index, event) => {
                const target = event.target as SVGElement;
                const rect = target.getBoundingClientRect();
                const container = target
                  .closest(".recharts-wrapper")
                  ?.getBoundingClientRect();
                if (!container) return;
                setTooltip({
                  x: rect.left - container.left + rect.width / 2,
                  y: rect.top - container.top,
                  name: data.name,
                  value: data.value,
                });
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
