import { listGoals } from "@/api/goals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { CategoriesPage } from "./CategoriesPage";

function GoalsContent() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

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
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load goals.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && goals?.length === 0 && (
        <p className="text-muted-foreground">
          No goals yet. Create your first one!
        </p>
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {activeTab === "goals" ? "Goals" : "Values & Categories"}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="values">Values & Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-4">
          <GoalsContent />
        </TabsContent>
        <TabsContent value="values" className="mt-4">
          <CategoriesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
