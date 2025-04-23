"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createDiary } from "~/app/actions/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { CalendarIcon, CircleAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export function DiaryWriter() {
  const form = useForm<DiaryWriterForm>({
    resolver: zodResolver(DiaryWriterFormSchema),
    defaultValues: {
      date: new Date(),
      content: "",
    },
  });

  async function onSubmit(data: z.infer<typeof DiaryWriterFormSchema>) {
    const res = await createDiary(data);
    console.log("res", res);

    if (res.success) {
    } else {
      console.error(res.error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
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
                일기에요!
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
                  className="shadow-md rounded-xl resize-none h-72 p-4 text-base"
                  placeholder="오늘은 어떤 일이 있었나요? 기분 좋은 일, 감사한 일, 또는 오늘 배운 것을 자유롭게 적어보세요."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {/* <div className="flex items-center gap-2 text-gray-600">
            <CircleAlert className="size-4" />
            <p className="text-xs">일기는 오전 12시에 자동으로 처리됩니다.</p>
          </div> */}

          <Button
            type="submit"
            size="lg"
            className="flex gap-2"
            disabled={form.formState.isSubmitting}
          >
            일기 쓰기
            {form.formState.isSubmitting && <Spinner />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
