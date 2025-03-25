import { DiaryService } from "~/lib/models/diary.server";
import { parseFormData } from "~/lib/utils";
import { prisma } from "~/lib/utils/db.server";

import { DiaryCard } from "~/components/diary/DiaryCard";
import {
  DiaryWriter,
  type DiaryWriterForm,
} from "~/components/diary/DiaryWriter";
import { Header } from "~/components/Header";
import { Button } from "~/components/ui/button";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const diarys = await prisma.diary.findMany({
    orderBy: { createdAt: "desc" },
  });
  return diarys;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = parseFormData<DiaryWriterForm>(formData);

  const date = new Date(data.date);
  const content = formData.get("content") as string;

  const diaryService = new DiaryService();

  const diary = await diaryService.createDiary({
    date,
    content,
  });

  return diary;
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const diarys = loaderData;

  return (
    <div className="w-full sm:w-3/4 xl:w-1/2 mx-auto">
      <Header>
        <h1 className="text-2xl font-bold">일기장</h1>
      </Header>

      <div className="flex flex-col gap-4 px-6">
        <DiaryWriter />

        {actionData && <pre>{JSON.stringify(actionData, null, 2)}</pre>}

        <hr className="my-4" />

        <h2 className="text-lg font-medium">최근 일기</h2>

        {diarys.map((diary) => (
          <DiaryCard diary={diary} key={diary.id} />
        ))}
      </div>
    </div>
  );
}
