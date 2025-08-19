-- @param {String} $1:userId
-- @param {String} $2:searchTerm
-- @param {Int} $3:take
-- @param {Int} $4:skip
-- @param {String} $5:direction

SELECT
    memory.*,
    diary.date,
    ts_rank_cd(to_tsvector('korean', memory.content), websearch_to_tsquery('korean', $2)) AS score,
    COUNT(*) OVER() as total
FROM
    memory
JOIN diary ON diary.id = memory."diaryId"
WHERE
	memory."userId" = $1
	AND
    to_tsvector('korean', memory.content) @@ websearch_to_tsquery('korean', $2)
ORDER BY
    CASE WHEN $5 = 'DESC' THEN diary.date END DESC,
    CASE WHEN $5 = 'ASC' THEN diary.date END ASC,
    ts_rank_cd(to_tsvector('korean', memory.content), websearch_to_tsquery('korean', $2)) DESC
LIMIT $3 OFFSET $4;