import Link from "next/link";

import { Button } from "~/components/ui/button";

export function DiaryEmpty() {
  return (
    <div className="flex flex-col gap-4 p-6 justify-center items-center bg-gray-200 rounded-lg border border-dashed border-gray-500">
      <h2 className="text-lg">
        아직 작성된 일기가 없어요. 오늘의 일기를 작성해보세요!
      </h2>
      <Link href="/" className="hover:underline">
        <Button>일기 쓰러 가기</Button>
      </Link>
    </div>
  );
}
