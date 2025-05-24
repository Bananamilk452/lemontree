"use client";

import { DiaryListCardContent } from "~/components/diary/DiaryListCard/Content";
import { DiaryListCardHeader } from "~/components/diary/DiaryListCard/Header";
import { DiaryListCardModals } from "~/components/diary/DiaryListCard/Modals";
import { DiaryModalProvider } from "~/components/diary/DiaryListCard/Provider";
import { DiaryPaper } from "~/components/diary/DiaryPaper";
import { DiaryWithCount } from "~/lib/models/diary";

interface DiaryListCardProps {
  diary: DiaryWithCount;
}

export function DiaryListCard({ diary }: DiaryListCardProps) {
  return (
    <DiaryModalProvider>
      <div className="flex flex-col gap-4">
        <DiaryListCardHeader diary={diary} />

        <DiaryPaper diary={diary} />

        <DiaryListCardContent diary={diary} />

        <DiaryListCardModals diary={diary} />
      </div>
    </DiaryModalProvider>
  );
}
