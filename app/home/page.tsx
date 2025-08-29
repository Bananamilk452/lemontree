import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { DiaryViewer } from "~/components/diary/DiaryViewer";
import { Header } from "~/components/Header";
import { SentimentChart } from "~/components/home/SentimentChart";
import { MainContainer } from "~/components/ui/container";

import { getSentimentByDate } from "../actions/diary";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["sentiment", 1, 7],
    queryFn: () => getSentimentByDate({ page: 1, limit: 7 }),
  });

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">홈</h1>
      </Header>

      <MainContainer className="flex flex-col gap-6">
        <DiaryViewer />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SentimentChart />
        </HydrationBoundary>
      </MainContainer>
    </>
  );
}
