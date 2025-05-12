"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DIARY_MAX_LENGTH } from "~/constants";
import { utcDateNow } from "~/utils";
import { CalendarIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

import type { Diary } from "~/lib/models/diary";

interface DiaryWriterProps {
  initialDate?: Date;
}

export function DiaryWriter(props: DiaryWriterProps) {
  const router = useRouter();

  const form = useForm<DiaryWriterForm>({
    resolver: zodResolver(DiaryWriterFormSchema),
    defaultValues: {
      date: props.initialDate ?? utcDateNow,
      content: "",
    },
  });

  function onSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    setIsLoading(true);
    createDiary(diary?.id, data)
      .then(({ diary }) => {
        toast.success("일기를 저장하고 메모리화했습니다.");
        setDiary(diary);
        form.setValue("content", diary.content);
        router.push(`/diary/${diary.id}`);
      })
      .catch((error) => {
        toast.error("일기 저장에 실패했습니다.");
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function onTempSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    setIsLoading(true);
    createDiary(diary?.id, data, { temp: true })
      .then(({ diary }) => {
        toast.success("일기를 임시 저장했습니다.");
        setDiary(diary);
        form.setValue("content", diary.content);
        router.push(`/diary/${diary.id}`);
      })
      .catch((error) => {
        toast.error("일기 임시 저장에 실패했습니다.");
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [isLoading, setIsLoading] = useState(false);
  const [diary, setDiary] = useState<Diary | null>(null);
  const date = form.watch("date");

  useEffect(() => {
    if (date) {
      setIsLoading(true);
      getDiaryByDate(date)
        .then((diary) => {
          if (diary) {
            setDiary(diary);
            form.setValue("content", diary.content);
          } else {
            setDiary(null);
            form.setValue("content", "");
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
  }, [date, form]);

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

        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-gray-600 self-start">
            {form.watch("content").length}/{DIARY_MAX_LENGTH}
          </p>
          <div className="grow"></div>
          {(form.formState.isSubmitting || isLoading) && (
            <Spinner className="size-5 shrink-0" />
          )}
          <Button
            onClick={form.handleSubmit(onTempSave)}
            size="lg"
            className="flex gap-2"
            variant="secondary"
            disabled={form.formState.isSubmitting || isLoading}
          >
            임시 저장
          </Button>

          <Button
            onClick={form.handleSubmit(onSave)}
            size="lg"
            className="flex gap-2"
            disabled={form.formState.isSubmitting || isLoading}
          >
            <SaveIcon strokeWidth={1.5} className="size-5" />
            일기 저장
          </Button>
        </div>
      </form>
    </Form>
  );
}
