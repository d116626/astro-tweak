"use client";

import type { ReactNode } from "react";

export function Pill({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors [&_svg]:size-3.5 ${
        active
          ? "border-white/60 bg-white/20 text-white"
          : "border-white/15 text-white/75 hover:border-white/35 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex h-20 flex-wrap content-start gap-2">{children}</div>;
}

export function Divider() {
  return <span className="mx-0.5 w-px self-stretch bg-white/15" />;
}
