import { format } from "date-fns";
import Link from "next/link";

import { Button } from "~/components/ui/button";

interface DiaryEmptyProps {
  date?: Date;
}

export function DiaryEmpty({ date }: DiaryEmptyProps) {
  const url = date ? `/new?date=${format(date, "yyyy-MM-dd")}` : "/new";

  return (
    <div className="flex flex-col gap-4 p-6 justify-center items-center bg-gray-200 rounded-lg border border-dashed border-gray-500">
      <h2 className="text-lg">
        아직 작성된 일기가 없어요. 오늘의 일기를 작성해보세요!
      </h2>
      <Link href={url} className="hover:underline">
        <Button>일기 쓰러 가기</Button>
      </Link>
    </div>
  );
}
