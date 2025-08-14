"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SaveIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
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
import { DIARY_MAX_LENGTH } from "~/constants";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { utcDateNow } from "~/utils";

type InferredDiaryWriterForm = z.infer<typeof DiaryWriterFormSchema>;

interface DiaryWriterProps {
  initialDate?: Date;
}

export function DiaryWriter(props: DiaryWriterProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<DiaryWriterForm>({
    resolver: zodResolver(DiaryWriterFormSchema),
    defaultValues: {
      date: props.initialDate ?? utcDateNow,
      content: "",
    },
  });

  const date = form.watch("date");

  const {
    data: diary,
    status: diaryStatus,
    error,
  } = useQuery({
    queryKey: ["diary", date],
    queryFn: () => getDiaryByDate(date),
    enabled: !!date,
  });

  useEffect(() => {
    if (date) {
      router.replace(`/new?date=${format(date, "yyyy-MM-dd")}`);
    }
  }, [date, router]);

  useEffect(() => {
    form.setValue("content", diary?.content || "");
  }, [diary, form]);

  useEffect(() => {
    if (error) {
      toast.error("일기를 불러오는 중 오류가 발생했습니다.");
    }
  }, [error]);

  const { mutate: saveDiary, status: saveDiaryStatus } = useMutation({
    mutationFn: ({
      diaryId,
      data,
    }: {
      diaryId?: string;
      data: InferredDiaryWriterForm;
    }) => createDiary(diaryId, data),
    onSuccess: ({ diary }) => {
      toast.success("일기를 저장하고 메모리화했습니다.");
      queryClient.setQueryData(["diary", diary.date], diary);
      form.setValue("content", diary.content);
      router.push(`/diary/${diary.id}`);
    },
    onError: (error) => {
      toast.error("일기 저장에 실패했습니다.");
      console.error(error);
    },
  });

  const { mutate: tempSaveDiary, status: tempSaveDiaryStatus } = useMutation({
    mutationFn: ({
      diaryId,
      data,
    }: {
      diaryId?: string;
      data: InferredDiaryWriterForm;
    }) => createDiary(diaryId, data, { temp: true }),
    onSuccess: ({ diary }) => {
      toast.success("일기를 임시 저장했습니다.");
      queryClient.setQueryData(["diary", diary.date], diary);
      form.setValue("content", diary.content);
      router.push(`/diary/${diary.id}`);
    },
    onError: (error) => {
      toast.error("일기 임시 저장에 실패했습니다.");
      console.error(error);
    },
  });

  const isLoading =
    diaryStatus === "pending" ||
    form.formState.isSubmitting ||
    saveDiaryStatus === "pending" ||
    tempSaveDiaryStatus === "pending";

  function onSave(data: InferredDiaryWriterForm) {
    saveDiary({ diaryId: diary?.id, data });
  }

  function onTempSave(data: InferredDiaryWriterForm) {
    tempSaveDiary({ diaryId: diary?.id, data });
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <DiaryWriterDatePicker form={form} />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  disabled={isLoading}
                  className="h-[500px] resize-none rounded-xl p-4 !text-base shadow-md"
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

        <DiaryWriterFooter
          form={form}
          isLoading={isLoading}
          onTempSave={onTempSave}
          onSave={onSave}
        />
      </form>
    </Form>
  );
}

function DiaryWriterDatePicker({
  form,
}: {
  form: UseFormReturn<InferredDiaryWriterForm>;
}) {
  function handleDateChange(direction: number) {
    const date = new Date(form.getValues("date"));

    if (direction === 1) {
      addDays(date, 1);
      form.setValue("date", addDays(date, 1));
    } else {
      addDays(date, -1);
      form.setValue("date", addDays(date, -1));
    }
  }

  return (
    <div className="flex items-center rounded-lg border px-4 py-3 shadow-md">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 text-sm">
            <CalendarIcon className="text-primary size-5" />
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

      <div className="flex-grow"></div>

      <div className="flex items-center gap-2">
        <button
          className="hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleDateChange(-1);
          }}
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleDateChange(1);
          }}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

function DiaryWriterFooter({
  form,
  isLoading,
  onTempSave,
  onSave,
}: {
  form: UseFormReturn<InferredDiaryWriterForm>;
  isLoading: boolean;
  onTempSave: (data: InferredDiaryWriterForm) => void;
  onSave: (data: InferredDiaryWriterForm) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-4">
      <p className="self-start text-sm text-gray-600">
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
  );
}
