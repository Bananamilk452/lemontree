import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as React from "react";

import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function DatePicker({ defaultValue }: { defaultValue?: Date }) {
  const [date, setDate] = React.useState<Date>();

  React.useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          {date ? (
            format(date, "PPP", { locale: ko })
          ) : (
            <span>날짜를 선택하세요</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
