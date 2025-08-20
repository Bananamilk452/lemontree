import { SearchListPage } from "~/app/diary/search/[page]/ListPage";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";

export default async function Search({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;

  if (isNaN(Number(page))) {
    // TODO: 에러 페이지 따로 만들기기
    return <div>잘못된 페이지입니다.</div>;
  }

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">일기 검색</h1>
      </Header>

      <MainContainer>
        <SearchListPage page={Number(page)} />
      </MainContainer>
    </>
  );
}
