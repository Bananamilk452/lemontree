"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as React from "react";

import { getDiariesExistenceByMonth } from "~/app/actions/diary";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/utils";

export function DatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(value ?? new Date());

  const { data: diaryMap } = useQuery({
    queryKey: ["diariesExistence", month.getFullYear(), month.getMonth() + 1],
    queryFn: () =>
      getDiariesExistenceByMonth(month.getFullYear(), month.getMonth() + 1),
  });

  function handleOpenChange(open: boolean) {
    setOpen(open);
  }

  function handleOnChange(date: Date | undefined) {
    if (onChange && date) {
      // UTC로 변환
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
      onChange(utcDate);
    }
    setOpen(false);
  }

  // 서버 렌더링 중에는 날짜 표시 부분을 비워두기
  const dateDisplay = value ? (
    format(value, "PPP", { locale: ko })
  ) : (
    <span>날짜를 선택하세요</span>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {dateDisplay}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleOnChange}
          month={month}
          onMonthChange={setMonth}
          initialFocus
          diaryMap={diaryMap}
        />
      </PopoverContent>
    </Popover>
  );
}
