import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MetricTrend } from "@/types/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendChartProps {
  mood: MetricTrend;
  energy: MetricTrend;
}

export function TrendChart({ mood, energy }: TrendChartProps) {
  const allDates = new Set([
    ...mood.daily.map((d) => d.date),
    ...energy.daily.map((d) => d.date),
  ]);

  const moodMap = Object.fromEntries(
    mood.daily.map((d) => [d.date, d.average]),
  );
  const energyMap = Object.fromEntries(
    energy.daily.map((d) => [d.date, d.average]),
  );

  const chartData = [...allDates].sort().map((date) => ({
    date: date.slice(5),
    mood: moodMap[date] ?? null,
    energy: energyMap[date] ?? null,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="font-semibold">Mood & Energy Trends</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Avg Mood: {mood.average.toFixed(1)}</span>
          <span>Avg Energy: {energy.average.toFixed(1)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data for this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" fontSize={11} />
              <YAxis domain={[1, 10]} fontSize={11} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
