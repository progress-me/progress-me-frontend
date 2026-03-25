import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useRef, useState } from "react";

const MAX_LENGTH = 2000;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend =
    trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !disabled;

  const handleSubmit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[40px] max-h-[160px] resize-none"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!canSend}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
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
