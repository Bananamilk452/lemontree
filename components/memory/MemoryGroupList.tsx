import { format } from "date-fns";
import { Fragment } from "react";

import { semanticSearch } from "~/app/actions/memory";
import { Memory } from "~/prisma/generated/client";

export function MemoryGroupList({
  date,
  memories,
  render,
}: {
  date: string;
  memories: Memory[] | Awaited<ReturnType<typeof semanticSearch>>["memories"];
  render: (
    memory: Memory | Awaited<ReturnType<typeof semanticSearch>>["memories"][0],
  ) => React.ReactNode;
}) {
  const formattedDate = format(new Date(date), "yyyy년 MM월 dd일");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{formattedDate}</h2>
      <div className="flex flex-col gap-3 rounded-xl border p-4">
        {memories.map((memory, i) => (
          <Fragment key={memory.id}>
            {render(memory)}
            {i !== memories.length - 1 && <hr />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
