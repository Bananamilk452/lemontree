"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { DeleteMemoryModal } from "~/components/memory/DeleteMemoryModal";
import { EditMemoryModal } from "~/components/memory/EditMemoryModal";

import type { Memory } from "~/prisma/generated/client";

interface MemoryProps {
  memory: Memory;
}

export function Memory({ memory }: MemoryProps) {
  const [isDeleteMemoryModalOpen, setIsDeleteMemoryModalOpen] = useState(false);
  const [isEditMemoryModalOpen, setIsEditMemoryModalOpen] = useState(false);

  return (
    <div className="flex gap-4 items-start justify-between">
      <div className="text-gray-800 text-sm leading-[22px]">
        {memory.content}
      </div>
      <div className="flex gap-2 items-center">
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
      />
    </div>
  );
}
