import { clsx } from "clsx";
import { AlertCircle, Info, AlertTriangle, CheckCircle, Terminal } from "lucide-react";

// ─── Callout ────────────────────────────────────────────────────────────────

type CalloutType = "info" | "warning" | "error" | "success" | "note";

const calloutConfig: Record<
  CalloutType,
  { icon: React.ElementType; classes: string; iconClass: string }
> = {
  info: {
    icon: Info,
    classes: "bg-brand-500/5 border-brand-500/20 text-brand-400",
    iconClass: "text-brand-400",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-amber-500/5 border-amber-500/20 text-amber-300",
    iconClass: "text-amber-400",
  },
  error: {
    icon: AlertCircle,
    classes: "bg-red-500/5 border-red-500/20 text-red-300",
    iconClass: "text-red-400",
  },
  success: {
    icon: CheckCircle,
    classes: "bg-green-500/5 border-green-500/20 text-green-300",
    iconClass: "text-green-400",
  },
  note: {
    icon: Terminal,
    classes: "bg-zinc-800/50 border-zinc-700 text-zinc-300",
    iconClass: "text-zinc-400",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "my-5 flex gap-3 rounded-lg border px-4 py-3.5 not-prose",
        config.classes
      )}
      role={type === "warning" || type === "error" ? "alert" : undefined}
    >
      <Icon className={clsx("w-4 h-4 mt-0.5 shrink-0", config.iconClass)} />
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        {title && (
          <p className="font-semibold mb-0.5 font-mono text-xs uppercase tracking-wider opacity-80">
            {title}
          </p>
        )}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}

// ─── Steps ──────────────────────────────────────────────────────────────────

interface StepsProps {
  children: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
  return (
    <div className="my-6 space-y-4 not-prose">
      {children}
    </div>
  );
}

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono font-bold shrink-0">
          →
        </div>
        <div className="flex-1 w-px bg-white/[0.07] mt-2" />
      </div>
      <div className="flex-1 pb-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h4>
        <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

interface TabsProps {
  items: string[];
  children: React.ReactNode;
}

export function Tabs({ items, children }: TabsProps) {
  return (
    <div className="my-5 not-prose">
      <div className="flex border-b border-white/[0.07] gap-1 mb-4">
        {items.map((item, i) => (
          <button
            key={item}
            className={clsx(
              "px-3 py-1.5 text-xs font-mono transition-colors border-b-2 -mb-px",
              i === 0
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

// ─── Code with copy button (wrapper) ────────────────────────────────────────

interface CodeBlockProps {
  children: React.ReactNode;
  filename?: string;
  language?: string;
}

export function CodeBlock({ children, filename, language }: CodeBlockProps) {
  return (
    <div className="my-5 not-prose group relative">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1c2228] border border-white/[0.07] border-b-0 rounded-t-lg">
          <Terminal className="w-3 h-3 text-zinc-500" />
          <span className="text-xs font-mono text-zinc-400">{filename}</span>
          {language && (
            <span className="ml-auto text-[10px] font-mono text-zinc-600 uppercase">
              {language}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
