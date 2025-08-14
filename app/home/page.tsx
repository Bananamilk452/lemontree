import { DiaryViewer } from "~/components/diary/DiaryViewer";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";

export default function Home() {
  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">홈</h1>
      </Header>

      <MainContainer className="flex flex-col gap-4">
        <DiaryViewer />
      </MainContainer>
    </>
  );
}
