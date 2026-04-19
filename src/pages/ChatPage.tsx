import {
  createChatSession,
  getChatStarters,
  getSessionMessages,
  listChatSessions,
  sendMessageStream,
} from "@/api/chat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageList } from "@/components/ChatMessageList";
import { MobileHistoryDrawer } from "@/components/MobileHistoryDrawer";
import { Button } from "@/components/ui/button";
import type {
  ChatMessageResponse,
  ChatSessionResponse,
  Page,
} from "@/types/api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookOpen,
  Loader2,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return "Today";
  if (date >= weekAgo) return "This week";
  return "Older";
}

function groupSessionsByDate(
  sessions: ChatSessionResponse[],
): { label: string; sessions: ChatSessionResponse[] }[] {
  const order = ["Today", "This week", "Older"];
  const groups = new Map<string, ChatSessionResponse[]>();

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  for (const session of sorted) {
    const group = getDateGroup(session.updatedAt);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(session);
  }

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, sessions: groups.get(label)! }));
}

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

  const grouped = data ? groupSessionsByDate(data.content) : [];

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
        {grouped.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 pt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
            {group.sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors mb-0.5 ${
                  session.id === sessionId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <p className="truncate font-medium">
                  {session.title ?? "New conversation"}
                </p>
              </button>
            ))}
          </div>
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
  pendingMessage,
}: {
  onSend: (message: string) => void;
  isPending: boolean;
  pendingMessage: string | null;
}) {
  const { data: starters } = useQuery({
    queryKey: ["chat-starters"],
    queryFn: getChatStarters,
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (isPending && pendingMessage) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-24 pt-3 md:px-4 md:pb-24 md:pt-4">
          <div className="mx-auto max-w-2xl space-y-3">
            {/* User's message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                <p className="whitespace-pre-wrap text-sm">{pendingMessage}</p>
              </div>
            </div>
            {/* Typing indicator */}
            <div className="flex items-start gap-2">
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-transparent via-background/80 to-transparent px-2 pb-6 pt-4 md:px-4 md:pb-6">
          <div className="pointer-events-auto mx-auto max-w-2xl">
            <ChatInput
              onSend={onSend}
              disabled
              placeholder="Starting conversation..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Mobile: scrollable content with bottom-pinned input */}
      {/* Desktop: centered content with inline input */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 pb-20 md:pb-4 md:px-4">
        <div className="w-full max-w-lg space-y-5 md:space-y-6">
          <div className="text-center">
            <MessageCircle className="mx-auto mb-3 h-9 w-9 text-muted-foreground/40 md:mb-4 md:h-12 md:w-12" />
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              What's on your mind?
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground md:mt-2 md:text-sm">
              I have access to your persona, values, goals, and recent entries
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: BookOpen, label: "Create or update notes" },
              { icon: Target, label: "Set and manage goals" },
              { icon: TrendingUp, label: "Analyze your progress" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground"
              >
                <feature.icon className="h-3 w-3" />
                {feature.label}
              </div>
            ))}
          </div>

          {/* Desktop: centered input */}
          <div className="hidden md:block">
            <ChatInput
              onSend={onSend}
              placeholder="Ask anything about your progress..."
            />
          </div>

          {starters && starters.length > 0 && (
            <>
              {/* Mobile: horizontal pills */}
              <div className="flex flex-wrap justify-center gap-1.5 md:hidden">
                {starters.map((starter) => (
                  <Button
                    key={starter.id}
                    variant="outline"
                    size="sm"
                    className="h-auto rounded-full px-3 py-1.5 text-xs"
                    onClick={() => onSend(starter.query)}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    {starter.label}
                  </Button>
                ))}
              </div>
              {/* Desktop: 2x2 card grid */}
              <div className="hidden gap-2 md:grid md:grid-cols-2">
                {starters.map((starter) => (
                  <button
                    key={starter.id}
                    onClick={() => onSend(starter.query)}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {starter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile only: sticky bottom input */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-transparent via-background/80 to-transparent px-2 pb-6 pt-4 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <ChatInput onSend={onSend} placeholder="ask anything..." />
        </div>
      </div>
    </div>
  );
}

function ChatView({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [statusPhase, setStatusPhase] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const rawStreamRef = useRef("");
  const prevSessionRef = useRef(sessionId);

  // Abort streaming only on real session change, not strict mode remount
  useEffect(() => {
    if (prevSessionRef.current !== sessionId) {
      abortRef.current?.abort();
      prevSessionRef.current = sessionId;
    }
  }, [sessionId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => getSessionMessages(sessionId),
    enabled: !!sessionId,
  });

  const handleSend = useCallback(
    async (message: string) => {
      if (isStreaming) return;

      // Optimistic user message
      const optimisticMessage: ChatMessageResponse = {
        id: `optimistic-${Date.now()}`,
        role: "USER",
        content: message,
        actionType: null,
        actionPayload: null,
        actionStatus: null,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["chat-messages", sessionId],
        (old: Page<ChatMessageResponse> | undefined) => {
          if (!old) return old;
          return { ...old, content: [...old.content, optimisticMessage] };
        },
      );

      // Move active session to top by updating its updatedAt
      queryClient.setQueryData(
        ["chat-sessions", 0],
        (old: Page<ChatSessionResponse> | undefined) => {
          if (!old) return old;
          const now = new Date().toISOString();
          const updated = old.content
            .map((s) => (s.id === sessionId ? { ...s, updatedAt: now } : s))
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            );
          return { ...old, content: updated };
        },
      );

      setIsStreaming(true);
      setStreamedText("");
      setStatusPhase(null);
      rawStreamRef.current = "";

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendMessageStream(
          sessionId,
          message,
          {
            onStatus: (phase) => setStatusPhase(phase),
            onToken: (text) => {
              setStatusPhase(null);
              rawStreamRef.current += text;
              const raw = rawStreamRef.current;
              const jsonMarker = raw.indexOf("```json");
              setStreamedText(
                jsonMarker >= 0 ? raw.slice(0, jsonMarker).trim() : raw,
              );
            },
            onProposal: () => {
              // Proposal data will be part of the done message
            },
            onDone: (doneMsg) => {
              setIsStreaming(false);
              setStreamedText("");
              setStatusPhase(null);

              const assistantMessage: ChatMessageResponse = {
                id: doneMsg.messageId,
                role: "ASSISTANT",
                content: doneMsg.content,
                actionType: doneMsg.actionType ?? null,
                actionPayload: doneMsg.actionPayload ?? null,
                actionStatus: doneMsg.actionStatus ?? null,
                createdAt: new Date().toISOString(),
              };

              queryClient.setQueryData(
                ["chat-messages", sessionId],
                (old: Page<ChatMessageResponse> | undefined) => {
                  if (!old) return old;
                  return {
                    ...old,
                    content: [...old.content, assistantMessage],
                  };
                },
              );

              queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
              queryClient.invalidateQueries({
                queryKey: ["chat-messages", sessionId],
              });

              if (doneMsg.actionType) {
                queryClient.invalidateQueries({ queryKey: ["goals"] });
                queryClient.invalidateQueries({ queryKey: ["log-entries"] });
              }
            },
            onError: (error) => {
              setIsStreaming(false);
              setStreamedText("");
              setStatusPhase(null);
              toast.error(error || "Failed to send message. Please try again.");
            },
          },
          controller.signal,
        );
      } catch (err) {
        setIsStreaming(false);
        setStreamedText("");
        setStatusPhase(null);
        if ((err as Error).name === "AbortError") return;
        toast.error("Failed to send message. Please try again.");
      }
    },
    [sessionId, isStreaming, queryClient],
  );

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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-24 pt-3 md:px-4 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-2xl">
          <ChatMessageList
            messages={messages}
            isPending={isStreaming}
            onSendMessage={handleSend}
            streamingText={streamedText || undefined}
            statusPhase={statusPhase}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-transparent via-background/80 to-transparent px-2 pb-6 pt-4 md:px-4 md:pb-6">
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            placeholder="Ask a follow-up question..."
            draftKey={`chat-draft-${sessionId}`}
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
  const [historyOpen, setHistoryOpen] = useState(false);

  // Restore last active session when landing on /chat without a sessionId
  useEffect(() => {
    if (!sessionId) {
      const lastSession = sessionStorage.getItem("chat-last-session");
      if (lastSession) {
        navigate(`/chat/${lastSession}`, { replace: true });
      }
    } else {
      sessionStorage.setItem("chat-last-session", sessionId);
    }
  }, [sessionId, navigate]);

  const handleOpenHistory = useCallback(() => setHistoryOpen(true), []);
  const handleCloseHistory = useCallback(() => setHistoryOpen(false), []);

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
    sessionStorage.removeItem("chat-last-session");
    navigate("/chat");
    setHistoryOpen(false);
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`);
    setHistoryOpen(false);
  };

  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const handleSend = (message: string) => {
    setPendingMessage(message);
    createMutation.mutate({ message });
  };

  return (
    <div className="flex overflow-hidden h-[calc(100dvh-3.5rem-4rem)] md:h-[calc(100dvh-3.5rem)] overscroll-y-none">
      {/* Desktop sidebar — always visible */}
      <div className="hidden w-72 border-r bg-muted/30 md:flex md:flex-col">
        <SessionSidebar
          sessionId={sessionId}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile history drawer (swipe to open/close) */}
      <MobileHistoryDrawer
        isOpen={historyOpen}
        onOpen={handleOpenHistory}
        onClose={handleCloseHistory}
      >
        <SessionSidebar
          sessionId={sessionId}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
        />
      </MobileHistoryDrawer>

      {/* Main area */}
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        {sessionId ? (
          <ChatView sessionId={sessionId} />
        ) : (
          <StartersView
            onSend={handleSend}
            isPending={createMutation.isPending}
            pendingMessage={pendingMessage}
          />
        )}
      </div>

      {/* Mobile history button */}
      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        className="fixed left-4 top-17 z-30 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-transform active:scale-95 md:hidden"
        aria-label="Chat history"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
