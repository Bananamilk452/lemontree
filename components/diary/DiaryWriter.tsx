"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { utcDateNow } from "~/utils";
import { CalendarIcon, PencilIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDiary, getDiaryByDate, updateDiary } from "~/app/actions/diary";
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

import type { Diary } from "~/lib/models/diary";

interface DiaryWriterProps {
  initialDate?: Date;
}

export function DiaryWriter(props: DiaryWriterProps) {
  const form = useForm<DiaryWriterForm>({
    resolver: zodResolver(DiaryWriterFormSchema),
    defaultValues: {
      date: props.initialDate ?? utcDateNow,
      content: "",
    },
  });

  async function onSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    setIsLoading(true);
    const res = await createDiary(data);
    setIsLoading(false);

    if (res.success) {
      toast.success("일기를 저장하고 메모리화했습니다.");
    } else {
      toast.error("일기 저장에 실패했습니다.");
      console.error(res.error);
    }
  }

  async function onTempSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    setIsLoading(true);
    const res = await createDiary(data, { temp: true });
    setIsLoading(false);

    if (res.success) {
      toast.success("임시 저장되었습니다.");
    } else {
      toast.error("임시 저장에 실패했습니다.");
      console.error(res.error);
    }
  }

  async function onUpdate(data: z.infer<typeof DiaryWriterFormSchema>) {
    if (!diary) {
      toast.error("일기를 불러오는 중입니다.");
      return;
    }

    setIsLoading(true);
    const res = await updateDiary(diary.id, data);
    setIsLoading(false);

    if (res.success) {
      toast.success("일기가 수정되었습니다.");
    } else {
      toast.error("일기 수정에 실패했습니다.");
      console.error(res.error);
    }
  }

  const [isLoading, setIsLoading] = useState(false);
  const [diary, setDiary] = useState<Diary | null>(null);
  const date = useWatch({
    control: form.control,
    name: "date",
  });

  useEffect(() => {
    if (date) {
      setIsLoading(true);
      getDiaryByDate(date)
        .then((diary) => {
          if (diary) {
            setDiary(diary);
          } else {
            setDiary(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching diary:", error);
          toast.error("일기를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [date]);

  useEffect(() => {
    if (diary) {
      form.setValue("content", diary.content);
    } else {
      form.setValue("content", "");
    }
  }, [date, diary, form]);

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
                  disabled={isLoading}
                  className="shadow-md rounded-xl resize-none h-[500px] p-4 !text-base"
                  placeholder={
                    isLoading
                      ? "일기를 불러오는 중입니다..."
                      : "오늘은 어떤 일이 있었나요? 기분 좋은 일, 감사한 일, 또는 오늘 배운 것을 자유롭게 적어보세요."
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {diary ? (
          <div className="flex justify-end gap-4">
            <Button
              onClick={form.handleSubmit(onUpdate)}
              size="lg"
              className="flex gap-2"
              disabled={form.formState.isSubmitting || isLoading}
            >
              <PencilIcon strokeWidth={1.5} className="size-5" />
              일기 수정
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-4">
            <Button
              onClick={form.handleSubmit(onTempSave)}
              size="lg"
              className="flex gap-2"
              variant="secondary"
              disabled={form.formState.isSubmitting || isLoading}
            >
              임시 저장
              {form.formState.isSubmitting && <Spinner />}
            </Button>

            <Button
              onClick={form.handleSubmit(onSave)}
              size="lg"
              className="flex gap-2"
              disabled={form.formState.isSubmitting || isLoading}
            >
              <SaveIcon strokeWidth={1.5} className="size-5" />
              일기 저장
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
