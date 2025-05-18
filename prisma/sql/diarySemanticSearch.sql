-- @param {String} $1:userId
-- @param {String} $2:vector
-- @param {Int} $3:take
-- @param {Int} $4:skip

WITH
user_diaries AS (
	SELECT * from diary
	WHERE "userId" = $1
),
diary_embeddings AS (
	SELECT * from embedding
	WHERE "diaryId" IN (SELECT id FROM user_diaries)
),
all_similarities AS (
	SELECT
		d.*,
    e.vector,
    e."diaryId",
		1 - (e.vector <=> $2::vector) AS cosine_similarity
	FROM
		user_diaries d
	JOIN
		diary_embeddings e ON e."diaryId" = d.id 
),
max_similarities AS (
  SELECT 
    "diaryId",
    MAX(cosine_similarity) AS max_cosine_similarity
  FROM 
    all_similarities
  GROUP BY 
    "diaryId"
)

SELECT
  a.id,
  a.content,
  a.date,
  a."createdAt",
  a."updatedAt",
  a."userId",
  a.cosine_similarity AS score
FROM 
  all_similarities a
JOIN 
  max_similarities m ON a."diaryId" = m."diaryId" AND a.cosine_similarity = m.max_cosine_similarity
ORDER BY 
  a.cosine_similarity DESC
LIMIT $3 OFFSET $4;
