import { Form } from "react-router";

import { DiaryService, getAllDiary } from "~/lib/models/diary.server";

import { DiaryCard } from "~/components/diary/DiaryCard";
import { Header } from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const diarys = getAllDiary();
  return diarys;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const content = formData.get("content") as string;

  const diaryService = new DiaryService();

  const jobs = await diaryService.createDiary(content);

  return jobs.map((job) => {
    return { id: job.id, name: job.name };
  });
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const diarys = loaderData;

  return (
    <>
      <Header>
        <h1 className="text-lg">📔 일기장</h1>
      </Header>

      <div className="p-4">
        <div className="size-96">
          <Form method="POST" className="flex h-full flex-col gap-2">
            <h1 className="text-lg font-semibold">일기 쓰기!</h1>
            <Textarea
              name="content"
              className="mt-2 flex-grow resize-none"
              placeholder="오늘은 어떤 일이 있었나요?"
            />
            <Button type="submit">일기 쓰기</Button>
          </Form>
        </div>

        {actionData && <pre>{JSON.stringify(actionData, null, 2)}</pre>}

        {diarys.map((diary) => (
          <DiaryCard diary={diary} key={diary.id} />
        ))}
      </div>
    </>
  );
}
