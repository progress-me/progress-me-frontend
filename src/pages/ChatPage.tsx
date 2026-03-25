import {
  createChatSession,
  getChatStarters,
  getSessionMessages,
  listChatSessions,
  sendMessage,
} from "@/api/chat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageList } from "@/components/ChatMessageList";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ChatMessageResponse } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function SessionSidebar({
  sessionId,
  onSelect,
  onNewChat,
}: {
  sessionId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  const { data } = useQuery({
    queryKey: ["chat-sessions", 0],
    queryFn: () => listChatSessions(0, 20),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {data?.content.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors mb-0.5",
              session.id === sessionId
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <p className="truncate font-medium">
              {session.title ?? "New conversation"}
            </p>
            <p className="truncate text-xs opacity-60">
              {new Date(session.updatedAt).toLocaleDateString()}
            </p>
          </button>
        ))}
        {data && data.content.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet
          </p>
        )}
      </div>
    </div>
  );
}

function StartersView({
  onSend,
  isPending,
}: {
  onSend: (message: string) => void;
  isPending: boolean;
}) {
  const { data: starters } = useQuery({
    queryKey: ["chat-starters"],
    queryFn: getChatStarters,
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Starting conversation...</p>
        <p className="text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-2xl font-semibold tracking-tight">
            How can I help?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            I have access to your persona, values, goals, and recent entries
          </p>
        </div>

        {starters && starters.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {starters.map((starter) => (
              <Button
                key={starter.id}
                variant="outline"
                size="sm"
                className="h-auto rounded-full px-4 py-2 text-sm"
                onClick={() => onSend(starter.query)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {starter.label}
              </Button>
            ))}
          </div>
        )}

        <div className="mx-auto max-w-xl">
          <ChatInput
            onSend={onSend}
            placeholder="Ask about your progress, patterns, goals..."
          />
        </div>
      </div>
    </div>
  );
}

function ChatView({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => getSessionMessages(sessionId),
    enabled: !!sessionId,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendMessage(sessionId, { message }),
    onMutate: async (message) => {
      await queryClient.cancelQueries({
        queryKey: ["chat-messages", sessionId],
      });

      const previous = queryClient.getQueryData(["chat-messages", sessionId]);

      queryClient.setQueryData(
        ["chat-messages", sessionId],
        (old: typeof data) => {
          if (!old) return old;
          const optimisticMessage: ChatMessageResponse = {
            id: `optimistic-${Date.now()}`,
            role: "USER",
            content: message,
            createdAt: new Date().toISOString(),
          };
          return {
            ...old,
            content: [...old.content, optimisticMessage],
          };
        },
      );

      return { previous };
    },
    onSuccess: (assistantMessage) => {
      queryClient.setQueryData(
        ["chat-messages", sessionId],
        (old: typeof data) => {
          if (!old) return old;
          return {
            ...old,
            content: [...old.content, assistantMessage],
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: (_error, _message, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["chat-messages", sessionId],
          context.previous,
        );
      }
      toast.error("Failed to send message. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          Failed to load conversation. Please try again.
        </p>
      </div>
    );
  }

  const messages = data?.content ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatMessageList
            messages={messages}
            isPending={sendMutation.isPending}
          />
        </div>
      </div>
      <div className="border-t px-3 py-2 md:px-4 md:py-3">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSend={(msg) => sendMutation.mutate(msg)}
            disabled={sendMutation.isPending}
            placeholder="Ask a follow-up question..."
          />
        </div>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: createChatSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      navigate(`/chat/${session.id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation. Please try again.");
    },
  });

  const handleNewChat = () => {
    navigate("/chat");
    setSheetOpen(false);
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`);
    setSheetOpen(false);
  };

  const handleSend = (message: string) => {
    createMutation.mutate({ message });
  };

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-3.5rem-4rem)] md:h-[calc(100dvh-3.5rem)]">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden border-r bg-muted/30 transition-all duration-200 md:flex md:flex-col",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <SessionSidebar
          sessionId={sessionId}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-12 items-center gap-2 border-b px-3">
          {/* Mobile: Sheet trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Chat history</SheetTitle>
              </SheetHeader>
              <SessionSidebar
                sessionId={sessionId}
                onSelect={handleSelectSession}
                onNewChat={handleNewChat}
              />
            </SheetContent>
          </Sheet>

          {/* Desktop: sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            {sessionId ? "Conversation" : "New chat"}
          </span>
        </div>

        {/* Content */}
        {sessionId ? (
          <ChatView sessionId={sessionId} />
        ) : (
          <StartersView
            onSend={handleSend}
            isPending={createMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
