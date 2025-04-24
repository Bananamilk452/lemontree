import { DiaryCard } from "~/components/diary/DiaryCard";
import { DiaryEmpty } from "~/components/diary/DiaryEmpty";
import { DiaryWriter } from "~/components/diary/DiaryWriter";
import { Header } from "~/components/Header";
import { prisma } from "~/utils/db";

export default async function Home() {
  const diarys = await prisma.diary.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full sm:w-3/4 md:w-3/5 xl:w-1/2 mx-auto">
      <Header>
        <h1 className="text-2xl font-bold">일기장</h1>
      </Header>

      <div className="flex flex-col gap-4 px-6">
        <DiaryWriter />

        <hr className="my-4" />

        <h2 className="text-lg font-medium">최근 일기</h2>

        {diarys.length ? (
          diarys.map((diary) => <DiaryCard diary={diary} key={diary.id} />)
        ) : (
          <DiaryEmpty />
        )}
      </div>
    </div>
  );
}
