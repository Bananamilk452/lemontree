import { cn } from "~/utils";

import type { Diary } from "~/lib/models/diary";

interface DiaryCardProps {
  diary: Diary;
  className?: string;
}

export function DiaryPaper({ diary, className }: DiaryCardProps) {
  return (
    <article
      className={cn(
        "max-h-96 overflow-scroll rounded-xl border border-gray-300 bg-white shadow-md",
        className,
      )}
    >
      <div className="p-4">
        <p
          className="break-keep-all whitespace-pre-wrap"
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
