"use client";

import { createContext, useContext, useState } from "react";

import type { Diary } from "~/lib/models/diary";
import type { ReactNode } from "react";

export type DiaryModalType =
  | "delete"
  | "memory-past-first"
  | "memory-reset-alert"
  | null;

interface DiaryModalContextValue {
  activeModal: DiaryModalType;
  setActiveModal: (modal: DiaryModalType) => void;
  pastDiary: Diary | null;
  openModal: (type: DiaryModalType, data?: { pastDiary?: Diary }) => void;
  closeModal: () => void;
}

const DiaryModalContext = createContext<DiaryModalContextValue | undefined>(
  undefined,
);

export function DiaryModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<DiaryModalType>(null);
  const [pastDiary, setPastDiary] = useState<Diary | null>(null);

  const openModal = (type: DiaryModalType, data?: { pastDiary?: Diary }) => {
    setActiveModal(type);
    if (data?.pastDiary) {
      setPastDiary(data.pastDiary);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setPastDiary(null);
  };
  return (
    <DiaryModalContext.Provider
      value={{
        activeModal,
        setActiveModal,
        pastDiary,
        openModal,
        closeModal,
      }}
    >
      {children}
    </DiaryModalContext.Provider>
  );
}

export function useDiaryModal() {
  const context = useContext(DiaryModalContext);
  if (context === undefined) {
    throw new Error("useDiaryModal must be used within a DiaryModalProvider");
  }
  return context;
}
