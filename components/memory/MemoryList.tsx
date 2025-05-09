import { MemoryStickIcon } from "lucide-react";
import { Fragment } from "react";

import { Memory } from "~/components/memory/Memory";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

import type { Memory as MemoryType } from "@prisma/client";

interface MemoryListProps {
  memories: MemoryType[];
}

export function MemoryList({ memories }: MemoryListProps) {
  return (
    <div className="flex flex-col gap-2">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="justify-start gap-2">
            <h3 className="flex items-center gap-1.5 text-sm text-gray-600">
              <MemoryStickIcon className="size-4" />
              메모리 ({memories.length}개)
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 border rounded-xl p-4">
              {memories.map((memory, i) => (
                <Fragment key={memory.id}>
                  <Memory memory={memory} />
                  {i < memories.length - 1 && <hr />}
                </Fragment>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
