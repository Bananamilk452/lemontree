import { DiaryViewer } from "~/components/diary/DiaryViewer";
import { Header } from "~/components/Header";

export default function Home() {
  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">홈</h1>
      </Header>

      <div className="flex flex-col gap-4 px-6 pb-6">
        <DiaryViewer />
      </div>
    </>
  );
}
