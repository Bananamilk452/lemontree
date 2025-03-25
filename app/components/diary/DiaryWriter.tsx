import { CalendarIcon } from "lucide-react";
import { Form, useFetcher } from "react-router";

import { DatePicker } from "~/components/DatePicker";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export function DiaryWriter() {
  const fetcher = useFetcher();

  return (
    <div className="flex flex-col gap-4">
      <div className="border px-4 py-3 shadow-md rounded-lg flex items-center gap-2 text-sm">
        <CalendarIcon className="size-5 text-primary" />
        <DatePicker defaultValue={new Date()} />의 일기에요!
      </div>

      <fetcher.Form className="flex flex-col gap-4" method="POST">
        <Textarea
          name="content"
          className="shadow-md rounded-xl resize-none h-72 p-4 text-base"
          placeholder="오늘은 어떤 일이 있었나요? 기분 좋은 일, 감사한 일, 또는 오늘 배운 것을 자유롭게 적어보세요."
        />

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            일기 쓰기
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
