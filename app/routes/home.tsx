import { prisma } from "~/lib/utils/db";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const diarys = prisma.diary.findMany();
  return diarys;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const diarys = loaderData;

  return (
    <>
      {diarys.map((diary) => (
        <div key={diary.id}>
          <h1>{diary.createdAt.toLocaleString()}</h1>
          <p>{diary.content}</p>
        </div>
      ))}
    </>
  );
}
