-- @param {String} $1:userId
-- @param {String} $2:vector
-- @param {Int} $3:take
-- @param {Int} $4:skip
-- @param {String} $5:direction

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
),
ordered_results AS (
  SELECT
    a.id,
    a.content,
    a.date,
    a."createdAt",
    a."updatedAt",
    a."userId",
    a.cosine_similarity AS score,
    COUNT(*) OVER() as total
  FROM 
    all_similarities a
  JOIN 
    max_similarities m ON a."diaryId" = m."diaryId" AND a.cosine_similarity = m.max_cosine_similarity
  ORDER BY
    CASE WHEN $5 = 'DESC' THEN a.date END DESC,
    CASE WHEN $5 = 'ASC' THEN a.date END ASC
)
SELECT *
FROM ordered_results
LIMIT $3 OFFSET $4;
