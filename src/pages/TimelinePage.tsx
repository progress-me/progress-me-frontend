import { getDashboard } from "@/api/dashboard";
import { listLogEntries } from "@/api/log-entries";
import { ActivityChart } from "@/components/ActivityChart";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { StatCard } from "@/components/StatCard";
import { TrendChart } from "@/components/TrendChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LogEntryResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  FileText,
  Flame,
  Heart,
  Pencil,
  PenLine,
  Target,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(
  entries: LogEntryResponse[],
): Map<string, LogEntryResponse[]> {
  const groups = new Map<string, LogEntryResponse[]>();
  for (const entry of entries) {
    const key = entry.loggedAt.slice(0, 10);
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}

// --- Timeline Tab ---

function TimelineContent() {
  const [page, setPage] = useState(0);
  const [editingEntry, setEditingEntry] = useState<LogEntryResponse | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["log-entries", page],
    queryFn: () => listLogEntries({ page, size: 20 }),
  });

  const entries = data?.content ?? [];
  const grouped = groupByDate(entries);

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load entries.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <p className="text-muted-foreground">
          No entries yet. Create your first one!
        </p>
      )}

      {[...grouped.entries()].map(([dateKey, items]) => (
        <div key={dateKey} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {formatDate(items[0].loggedAt)}
          </h2>
          {items.map((entry) => (
            <Card key={entry.id} className="group relative">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                <span className="text-xs text-muted-foreground">
                  {formatTime(entry.loggedAt)}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {entry.mood !== null && (
                    <span className="text-xs" title="Mood">
                      Mood: {entry.mood}/10
                    </span>
                  )}
                  {entry.energy !== null && (
                    <span className="text-xs" title="Energy">
                      Energy: {entry.energy}/10
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntry(entry);
                      setIsEditOpen(true);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                    title="Edit entry"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap text-sm">{entry.content}</p>
                {(entry.goals?.length > 0 || entry.tags?.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.goals
                      ?.filter((g) => !g.isDefault)
                      .map((g) => (
                        <Badge
                          key={g.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Target className="mr-1 h-3 w-3" />
                          {g.title}
                        </Badge>
                      ))}
                    {entry.tags?.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={
                          tag.categoryColor
                            ? {
                                borderColor: tag.categoryColor,
                                color: tag.categoryColor,
                              }
                            : undefined
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {data && (
        <div className="flex justify-center gap-2">
          {data.number > 0 && (
            <Button variant="outline" onClick={() => setPage((p) => p - 1)}>
              Previous page
            </Button>
          )}
          {!data.last && (
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Next page
            </Button>
          )}
        </div>
      )}

      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setTimeout(() => setEditingEntry(null), 300);
            }
          }}
        />
      )}
    </div>
  );
}

// --- Dashboard Tab ---

function DashboardContent() {
  const [period, setPeriod] = useState(30);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboard(period),
  });

  return (
    <div className="space-y-6">
      <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
        <TabsList>
          <TabsTrigger value="7">7 days</TabsTrigger>
          <TabsTrigger value="30">30 days</TabsTrigger>
          <TabsTrigger value="90">90 days</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load dashboard.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Total Entries"
              value={data.entryStats.total}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${data.streak.current}d`}
            />
            <StatCard
              icon={Zap}
              label="Longest Streak"
              value={`${data.streak.longest}d`}
            />
            <StatCard
              icon={Target}
              label="Active Goals"
              value={data.goalSummary.active}
            />
          </div>

          <ActivityChart data={data.entryStats.byDay} />

          <TrendChart mood={data.moodTrend} energy={data.energyTrend} />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Goals Overview</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-3 text-sm">
                  <span>{data.goalSummary.active} active</span>
                  <span>{data.goalSummary.completed} completed</span>
                  <span>{data.goalSummary.paused} paused</span>
                </div>
                {data.goalSummary.items.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{g.title}</span>
                    <Badge variant="outline">{g.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Top Values</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topValues.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tagged entries yet.
                  </p>
                )}
                {data.topValues.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Heart
                        className="h-3 w-3"
                        style={{ color: v.categoryColor ?? undefined }}
                      />
                      {v.name}
                      <span className="text-xs text-muted-foreground">
                        ({v.categoryName})
                      </span>
                    </span>
                    <Badge variant="secondary">{v.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {Object.keys(data.entryStats.byType).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Entry Types</h3>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  {Object.entries(data.entryStats.byType).map(
                    ([type, count]) => (
                      <span key={type}>
                        {type.replace("_", " ")}: <strong>{count}</strong>
                      </span>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// --- Main Page ---

export function TimelinePage() {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="space-y-6">
      <div className="hidden items-center justify-between md:flex">
        <h1 className="text-2xl font-bold">
          {activeTab === "timeline" ? "Timeline" : "Dashboard"}
        </h1>
        <Link to="/entries/new">
          <Button>
            <PenLine className="mr-1.5 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="timeline" className="mt-4">
          <TimelineContent />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-4">
          <DashboardContent />
        </TabsContent>
      </Tabs>

      <Link
        to="/entries/new"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
      >
        <PenLine className="h-6 w-6" />
      </Link>
    </div>
  );
}
