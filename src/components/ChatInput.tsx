import { useDraft } from "@/hooks/useDraft";
import { Send } from "lucide-react";
import { useRef } from "react";

const MAX_LENGTH = 2000;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  draftKey?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  draftKey = "chat-draft",
}: ChatInputProps) {
  const [value, setValue, clearDraft] = useDraft(draftKey);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend =
    trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !disabled;

  const handleSubmit = () => {
    if (!canSend) return;
    onSend(trimmed);
    clearDraft();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMobile = "ontouchstart" in window;
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue);
    }
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-end gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 shadow-sm backdrop-blur-md transition-colors focus-within:border-ring/50 focus-within:shadow-md">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-[160px] flex-1 resize-none bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {value.length > MAX_LENGTH * 0.9 && (
        <p
          className={`text-xs text-right ${value.length >= MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
        >
          {value.length}/{MAX_LENGTH}
        </p>
      )}
    </div>
  );
}
