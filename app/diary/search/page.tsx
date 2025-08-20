import { SearchPage } from "~/app/diary/search/SearchPage";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";

export default function Search() {
  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">일기 검색</h1>
      </Header>

      <MainContainer>
        <SearchPage />
      </MainContainer>
    </>
  );
}
