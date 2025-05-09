-- @param {String} $1:diaryId
-- @param {DateTime} $2:date
WITH 
diary_embeddings AS (
  SELECT embedding.vector, embedding."diaryId"
  FROM embedding
  WHERE "diaryId" = $1
),
memory_embeddings AS (
  SELECT memory.id AS "memoryId", embedding.vector AS memory_vector, memory.content, diary.date as date
  FROM memory
  JOIN embedding ON memory.id = embedding."memoryId"
  JOIN diary ON memory."diaryId" = diary.id
  WHERE $2 > diary.date
),
all_similarities AS (
  SELECT 
    d."diaryId",
    m."memoryId",
    m.content,
    m.date,
    1 - (d.vector <=> m.memory_vector) AS cosine_similarity
  FROM 
    diary_embeddings d
  CROSS JOIN 
    memory_embeddings m
),
max_similarities AS (
  SELECT 
    "memoryId",
    MAX(cosine_similarity) AS max_cosine_similarity
  FROM 
    all_similarities
  GROUP BY 
    "memoryId"
)

SELECT
  a."memoryId",
  a.content,
  a.cosine_similarity,
  a.date
FROM 
  all_similarities a
JOIN 
  max_similarities m ON a."memoryId" = m."memoryId" AND a.cosine_similarity = m.max_cosine_similarity
WHERE a.cosine_similarity >= 0.73
ORDER BY 
  a.cosine_similarity DESC;