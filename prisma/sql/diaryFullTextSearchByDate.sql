-- @param {String} $1:userId
-- @param {String} $2:searchTerm
-- @param {Int} $3:take
-- @param {Int} $4:skip
-- @param {String} $5:direction

SELECT 
  d.*,
  ts_rank_cd(to_tsvector('korean', d.content), websearch_to_tsquery('korean', $2)) AS score,
  COUNT(*) OVER() as total,
  (
    SELECT JSON_AGG(
      JSON_BUILD_OBJECT(
          'id', m.id,
          'content', m.content,
          'createdAt', m."createdAt",
          'updatedAt', m."updatedAt",
          'userId', m."userId",
          'diaryId', m."diaryId"
      )
    )
    FROM memory m 
    WHERE m."diaryId" = d.id
  ) AS memories,
  (
    SELECT COUNT(*)
    FROM embedding e
    WHERE e."diaryId" = d.id
  ) AS "embeddingCount"
FROM 
  diary d
WHERE
	d."userId" = $1
	AND
  to_tsvector('korean', d.content) @@ websearch_to_tsquery('korean', $2)
ORDER BY
  CASE WHEN $5 = 'DESC' THEN d.date END DESC,
  CASE WHEN $5 = 'ASC' THEN d.date END ASC,
  ts_rank_cd(to_tsvector('korean', d.content), websearch_to_tsquery('korean', $2)) DESC
LIMIT $3 OFFSET $4;