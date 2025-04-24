import { cn } from "~/utils";

import type { Diary } from "~/lib/models/diary";

interface DiaryCardProps {
  diary: Diary;
  className?: string;
}

export function DiaryCard({ diary, className }: DiaryCardProps) {
  return (
    <article
      className={cn(
        "bg-white border border-gray-300 rounded-xl shadow-md",
        className,
      )}
    >
      <div className="p-4">
        <p
          className="whitespace-pre-wrap break-keep-all"
          style={{
            backgroundImage: "linear-gradient(#ccc 1px, transparent 1px)",
            backgroundSize: "100% 26px",
            lineHeight: "26px",
            backgroundPosition: "0 25px",
          }}
        >
          {diary.content}
        </p>
      </div>
    </article>
  );
}
