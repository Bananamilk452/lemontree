import type { Diary } from "~/lib/models/diary";

interface DiaryCardProps {
  diary: Diary;
}

export function DiaryCard({ diary }: DiaryCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl shadow border p-4 transition-all hover:shadow-md hover:-translate-y-1">
      <p className="text-sm text-gray-600">
        {diary.createdAt.toLocaleString()}
      </p>

      <p className="line-clamp-3">{diary.content}</p>

      <div className="flex flex-wrap gap-2">
        {diary.keywords.map((keyword) => (
          <span
            key={keyword}
            className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
