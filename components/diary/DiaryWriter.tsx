"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createDiary } from "~/app/actions/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { CalendarIcon, SaveIcon } from "lucide-react";
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

  async function onSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    const res = await createDiary(data);

    if (res.success) {
    } else {
      console.error(res.error);
    }
  }

  async function onTempSave(data: z.infer<typeof DiaryWriterFormSchema>) {
    const res = await createDiary(data, { temp: true });

    if (res.success) {
    } else {
      console.error(res.error);
    }
  }

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
                  className="shadow-md rounded-xl resize-none h-72 p-4 !text-base"
                  placeholder="오늘은 어떤 일이 있었나요? 기분 좋은 일, 감사한 일, 또는 오늘 배운 것을 자유롭게 적어보세요."
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
