import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { getMemories } from "~/app/actions/memory";
import { ListPage } from "~/app/memory/list/[page]/ListPage";
import { PAGE_SIZE } from "~/constants";

const limit = PAGE_SIZE;

export default async function List({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;

  if (isNaN(Number(page))) {
    // TODO: 에러 페이지 따로 만들기기
    return <div>잘못된 페이지입니다.</div>;
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["memories", { limit, page: Number(page) }],
    queryFn: () => getMemories({ limit, page: Number(page) }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListPage page={Number(page)} />
    </HydrationBoundary>
  );
}
