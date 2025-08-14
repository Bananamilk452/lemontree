import { DiaryWriter } from "~/components/diary/DiaryWriter";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";

export default async function New({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const date = (await searchParams).date;
  let initialDate: Date | undefined;

  if (date && !Array.isArray(date)) {
    const d = new Date(date);

    if (!isNaN(d.getTime())) {
      initialDate = d;
    }
  }

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">일기 쓰기</h1>
      </Header>

      <MainContainer className="flex flex-col gap-4">
        <DiaryWriter initialDate={initialDate} />
      </MainContainer>
    </>
  );
}
