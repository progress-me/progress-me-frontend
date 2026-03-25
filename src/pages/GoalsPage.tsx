import { listGoals } from "@/api/goals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { CategoriesPage } from "./CategoriesPage";

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
    <div className="space-y-6">
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
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  return (
    <div className="space-y-6">
      <div className="hidden items-center justify-between md:flex">
        <h1 className="text-2xl font-bold">
          {activeTab === "goals" ? "Goals" : "Values & Categories"}
        </h1>
        {activeTab === "goals" ? (
          <Button onClick={() => setShowCreateGoal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Goal
          </Button>
        ) : (
          <Button onClick={() => setShowCreateCategory(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Category
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="values">Values & Categories</TabsTrigger>
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
              New Category
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
