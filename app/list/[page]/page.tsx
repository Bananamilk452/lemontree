import { getDiarys } from "~/app/actions/diary";
import { DiaryEmpty } from "~/components/diary/DiaryEmpty";
import { Header } from "~/components/Header";
import DiaryList from "~/components/list/DiaryList";

export default async function List({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const limit = 10;
  const { page } = await params;

  if (isNaN(Number(page))) {
    // TODO: 에러 페이지 따로 만들기기
    return <div>잘못된 페이지입니다.</div>;
  }

  const { diarys, total } = await getDiarys({ limit, page: Number(page) });

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">
          일기 목록
          <span className="text-base ml-2">(총 {total}개)</span>
        </h1>
      </Header>

      <div className="px-6 pb-6">
        {diarys.length > 0 ? (
          <DiaryList
            diarys={diarys}
            limit={limit}
            page={Number(page)}
            total={total}
          />
        ) : (
          <DiaryEmpty />
        )}
      </div>
    </>
  );
}
