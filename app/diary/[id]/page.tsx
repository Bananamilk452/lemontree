import { getDiaryById } from "~/app/actions/diary";
import { DiaryListCard } from "~/components/diary/DiaryListCard";
import { Header } from "~/components/Header";

export default async function DiaryId({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diary = await getDiaryById(id);

  if (!diary) {
    // TODO: 에러 페이지 따로 만들기기
    return <div>잘못된 페이지입니다.</div>;
  }

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">일기 보기</h1>
      </Header>

      <div className="px-6 pb-6">
        <DiaryListCard diary={diary} />
      </div>
    </>
  );
}
