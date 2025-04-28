import { DiaryWriter } from "~/components/diary/DiaryWriter";
import { Header } from "~/components/Header";

export default async function New() {
  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">일기 쓰기</h1>
      </Header>

      <div className="flex flex-col gap-4 px-6 pb-6">
        <DiaryWriter />
      </div>
    </>
  );
}
