-- @param {String} $1:userId
-- @param {String} $2:vector
-- @param {Int} $3:take
-- @param {Int} $4:skip
-- @param {DateTime} $5:untilDate

WITH
user_memories AS (
	SELECT memory.*, diary.date from memory
  JOIN diary ON diary.id = memory."diaryId"
	WHERE memory."userId" = $1
),
memory_embeddings AS (
	SELECT * from embedding
	WHERE "memoryId" IN (SELECT id FROM user_memories)
),
all_similarities AS (
	SELECT
		m.*,
    e.vector,
    e."memoryId",
		1 - (e.vector <=> $2::vector) AS cosine_similarity
	FROM
		user_memories m
	JOIN
		memory_embeddings e ON e."memoryId" = m.id 
),
max_similarities AS (
  SELECT 
    "memoryId",
    MAX(cosine_similarity) AS max_cosine_similarity
  FROM 
    all_similarities
  GROUP BY 
    "memoryId"
),
ordered_results AS (
  SELECT
    a.id,
    a.content,
    a."createdAt",
    a."updatedAt",
    a."userId",
    a."diaryId",
    a.date,
    a.cosine_similarity AS score,
    COUNT(*) OVER() as total
  FROM
    all_similarities a
  JOIN
    max_similarities m ON a."memoryId" = m."memoryId" AND a.cosine_similarity = m.max_cosine_similarity
  WHERE
    a.date < $5
  ORDER BY
    a.cosine_similarity DESC
)
SELECT *
FROM ordered_results
LIMIT $3 OFFSET $4;