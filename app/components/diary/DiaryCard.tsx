import type { DiaryWithIsEmbeddingNull } from "~/lib/models/diary.server";

interface DiaryCardProps {
  diary: DiaryWithIsEmbeddingNull;
}

export function DiaryCard({ diary }: DiaryCardProps) {
  return (
    <div className="flex w-[500px] flex-col gap-2 rounded-lg border p-4">
      <h1 className="text-lg font-semibold">
        {diary.createdAt.toLocaleString()}
      </h1>
      <p>{diary.content}</p>
      <p className="text-sm">
        감정: {diary.sentiment} / 요약: {diary.summary}
      </p>
      <p className="text-sm">키워드: {diary.keywords.join(", ")}</p>
    </div>
  );
}
