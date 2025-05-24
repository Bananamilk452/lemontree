"use client";

import { Diary } from "@prisma/client";

import { DeleteDiaryModal } from "~/components/diary/DiaryListCard/DeleteDiaryModal";
import { MemoryPastFirstModal } from "~/components/diary/DiaryListCard/MemoryPastFirstModal";
import { MemoryResetAlertModal } from "~/components/diary/DiaryListCard/MemoryResetAlertModal";
import { useDiaryModal } from "~/components/diary/DiaryListCard/Provider";

interface DiaryListCardModalsProps {
  diary: Diary;
}

export function DiaryListCardModals({ diary }: DiaryListCardModalsProps) {
  const { activeModal, pastDiary, setActiveModal, closeModal } =
    useDiaryModal();

  return (
    <>
      <DeleteDiaryModal
        diary={diary}
        open={activeModal === "delete"}
        setOpen={closeModal}
      />
      <MemoryResetAlertModal
        diary={diary}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      {pastDiary && (
        <MemoryPastFirstModal
          diary={pastDiary}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
        />
      )}
    </>
  );
}
