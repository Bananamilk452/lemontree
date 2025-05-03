"use client";

import { cn } from "~/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as React from "react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function DatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // 클라이언트 사이드에서만 렌더링 확인
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
  const dateDisplay =
    mounted && value ? (
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
          defaultMonth={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
