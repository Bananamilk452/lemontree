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
  function handleOpenChange(open: boolean) {
    setOpen(open);
  }

  function handleOnChange(date: Date | undefined) {
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  }

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
          {value ? (
            format(value, "PPP", { locale: ko })
          ) : (
            <span>날짜를 선택하세요</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleOnChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
