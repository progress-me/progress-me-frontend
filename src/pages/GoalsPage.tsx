import { listGoals } from "@/api/goals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Target } from "lucide-react";
import { useState } from "react";
import { CategoriesPage } from "./CategoriesPage";

const filterLabels: Record<string, string> = {
  all: "goals",
  active: "active goals",
  completed: "completed goals",
  paused: "paused goals",
};

function GoalsContent({
  showCreate,
  setShowCreate,
}: {
  showCreate: boolean;
  setShowCreate: (open: boolean) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: goals,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["goals", statusFilter],
    queryFn: () =>
      listGoals({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  return (
    <div className="space-y-5">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-destructive/50 p-6 text-destructive">
          <span>Failed to load goals.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && goals?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {statusFilter === "all"
              ? "No goals yet"
              : `No ${filterLabels[statusFilter]}`}
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "Goals help you stay focused and measure your personal growth."
              : `You don't have any ${filterLabels[statusFilter]} right now.`}
          </p>
          {statusFilter === "all" && (
            <Button className="mt-5" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first goal
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {goals?.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <CreateGoalDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}

export function GoalsPage() {
  const [activeTab, setActiveTab] = useState("goals");
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  return (
    <div className="space-y-6">
      <div className="hidden items-center justify-between md:flex">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === "goals" ? "Goals" : "Focus Areas"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "goals"
              ? "Track what matters to you and measure your growth."
              : "Organize your goals and entries by focus area."}
          </p>
        </div>
        {activeTab === "goals" ? (
          <Button onClick={() => setShowCreateGoal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Goal
          </Button>
        ) : (
          <Button onClick={() => setShowCreateCategory(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Focus Area
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="values">Focus Areas</TabsTrigger>
          </TabsList>
          {activeTab === "goals" ? (
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="md:hidden"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Goal
            </Button>
          ) : (
            <Button
              onClick={() => setShowCreateCategory(true)}
              className="md:hidden"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Focus Area
            </Button>
          )}
        </div>
        <TabsContent value="goals" className="mt-4">
          <GoalsContent
            showCreate={showCreateGoal}
            setShowCreate={setShowCreateGoal}
          />
        </TabsContent>
        <TabsContent value="values" className="mt-4">
          <CategoriesPage
            showCreate={showCreateCategory}
            setShowCreate={setShowCreateCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
