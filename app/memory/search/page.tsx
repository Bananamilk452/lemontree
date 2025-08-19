import { SearchPage } from "~/app/memory/search/SearchPage";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";

export default function Search() {
  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">메모리 검색</h1>
      </Header>

      <MainContainer>
        <SearchPage />
      </MainContainer>
    </>
  );
}
