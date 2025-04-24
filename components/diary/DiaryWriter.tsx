"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { utcDateNow } from "~/utils";
import { CalendarIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDiary, getDiaryByDate } from "~/app/actions/diary";
import { DatePicker } from "~/components/DatePicker";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";

export function DiaryWriter() {
  const form = useForm<DiaryWriterForm>({
    resolver: zodResolver(DiaryWriterFormSchema),
    defaultValues: {
      date: utcDateNow,
      content: "",
    },
  });

  async function onSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    const res = await createDiary(data);

    if (res.success) {
      toast.success("일기가 저장되었습니다.");
    } else {
      toast.error("일기 저장에 실패했습니다.");
      console.error(res.error);
    }
  }

  async function onTempSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    const res = await createDiary(data, { temp: true });

    if (res.success) {
      toast.success("임시 저장되었습니다.");
    } else {
      toast.error("임시 저장에 실패했습니다.");
      console.error(res.error);
    }
  }

  const [isTextareaDisabled, setIsTextareaDisabled] = useState(false);
  const date = useWatch({
    control: form.control,
    name: "date",
  });

  useEffect(() => {
    if (date) {
      setIsTextareaDisabled(true);
      getDiaryByDate(date)
        .then((diary) => {
          if (diary) {
            form.setValue("content", diary.content);
          } else {
            form.setValue("content", "");
          }
        })
        .finally(() => {
          setIsTextareaDisabled(false);
        });
    }
  }, [date]);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <div className="border px-4 py-3 shadow-md rounded-lg">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 text-sm">
                <CalendarIcon className="size-5 text-primary" />
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                의 일기에요!
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isTextareaDisabled}
                  className="shadow-md rounded-xl resize-none h-[500px] p-4 !text-base"
                  placeholder={
                    isTextareaDisabled
                      ? "일기를 불러오는 중입니다..."
                      : "오늘은 어떤 일이 있었나요? 기분 좋은 일, 감사한 일, 또는 오늘 배운 것을 자유롭게 적어보세요."
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            onClick={form.handleSubmit(onTempSave)}
            size="lg"
            className="flex gap-2"
            variant="secondary"
            disabled={form.formState.isSubmitting}
          >
            임시 저장
            {form.formState.isSubmitting && <Spinner />}
          </Button>

          <Button
            onClick={form.handleSubmit(onSave)}
            size="lg"
            className="flex gap-2"
            disabled={form.formState.isSubmitting}
          >
            <SaveIcon strokeWidth={1.5} className="size-5" />
            일기 저장
            {form.formState.isSubmitting && <Spinner />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
