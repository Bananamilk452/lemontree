"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { DiaryViewModal } from "~/components/diary/DiaryViewModal";
import { DeleteMemoryModal } from "~/components/memory/DeleteMemoryModal";
import { EditMemoryModal } from "~/components/memory/EditMemoryModal";
import { parseMemoryDate } from "~/utils";

import type { Memory } from "~/prisma/generated/client";

interface MemoryProps {
  memory: Memory;
}

export function Memory(props: MemoryProps) {
  const [isDeleteMemoryModalOpen, setIsDeleteMemoryModalOpen] = useState(false);
  const [isEditMemoryModalOpen, setIsEditMemoryModalOpen] = useState(false);
  const [memory, setMemory] = useState(props.memory);

  const contents = useMemo(() => {
    const segments = parseMemoryDate(memory.content);
    const memoryContents = [];

    for (const segment of segments) {
      if (segment.type === "date") {
        memoryContents.push(
          <MemoryDateButton key={segment.content} date={segment.content} />,
        );
      } else {
        memoryContents.push(segment.content);
      }
    }

    return memoryContents;
  }, [memory.content]);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-sm leading-[22px] text-gray-800">{...contents}</div>
      <div className="flex items-center gap-2">
        <button
          className="group hover:cursor-pointer"
          onClick={() => setIsEditMemoryModalOpen(true)}
        >
          <PencilIcon className="size-4 text-gray-600 opacity-60 group-hover:opacity-100" />
        </button>
        <button
          className="group hover:cursor-pointer"
          onClick={() => setIsDeleteMemoryModalOpen(true)}
        >
          <Trash2Icon className="size-4 text-red-600 opacity-60 group-hover:opacity-100" />
        </button>
      </div>

      <DeleteMemoryModal
        memory={memory}
        open={isDeleteMemoryModalOpen}
        setOpen={setIsDeleteMemoryModalOpen}
      />

      <EditMemoryModal
        memory={memory}
        open={isEditMemoryModalOpen}
        setOpen={setIsEditMemoryModalOpen}
        onSuccess={(updatedMemory) => {
          setMemory(updatedMemory);
        }}
      />
    </div>
  );
}

function MemoryDateButton({ date }: { date: string }) {
  const [isDiaryViewModalOpen, setIsDiaryViewModalOpen] = useState(false);

  return (
    <>
      <time
        onClick={() => setIsDiaryViewModalOpen(true)}
        className="leading-[22px] break-all text-blue-600 hover:cursor-pointer hover:underline"
        dateTime={date}
      >
        {date}
      </time>
      {isDiaryViewModalOpen && (
        <DiaryViewModal
          date={date}
          open={isDiaryViewModalOpen}
          setOpen={setIsDiaryViewModalOpen}
        />
      )}
    </>
  );
}
