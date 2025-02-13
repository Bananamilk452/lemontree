import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import type { DiaryWithEmbedding } from "~/lib/models/diary";
const prisma = new PrismaClient();

async function main() {
  const seedFile = readFileSync("./prisma/seed.json", "utf-8");
  const seed = JSON.parse(seedFile) as DiaryWithEmbedding[];

  console.log("Seeding database...");
  console.log(seed.length);

  for await (const {
    content,
    embedding,
    sentiment,
    summary,
    keywords,
  } of seed) {
    await prisma.$executeRaw`
      INSERT INTO "Diary" (content, embedding, sentiment, summary, keywords)
      VALUES (
        ${content}, 
        ${embedding}::vector, 
        ${sentiment}, 
        ${summary}, 
        ${keywords}
      )
    `;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
