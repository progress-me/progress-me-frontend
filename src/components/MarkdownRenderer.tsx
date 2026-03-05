import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 flex items-center gap-2 border-b border-border pb-2 text-xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-3 text-base font-semibold text-foreground/90">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-foreground/80">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-5 space-y-3 pl-1">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-5 space-y-3 pl-5 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="relative pl-5 leading-relaxed text-foreground/80 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60">
      {children}
    </li>
  ),
  hr: () => (
    <hr className="my-6 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="text-muted-foreground">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/30 bg-muted/50 py-2 pl-4 pr-3 rounded-r-md text-foreground/70 italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={`${className} block overflow-x-auto rounded-lg bg-muted/70 p-4 text-sm`}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-muted/70 px-1.5 py-0.5 text-sm font-medium text-foreground/90">
        {children}
      </code>
    );
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="insight-content text-[0.935rem]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
