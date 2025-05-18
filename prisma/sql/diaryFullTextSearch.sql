-- @param {String} $1:userId
-- @param {String} $2:searchTerm
-- @param {Int} $3:take
-- @param {Int} $4:skip

SELECT
    *,
    ts_rank_cd(to_tsvector('korean', content), websearch_to_tsquery('korean', $2)) AS score
FROM
    diary
WHERE
	"userId" = $1
	AND
    to_tsvector('korean', content) @@ websearch_to_tsquery('korean', $2)
ORDER BY
    ts_rank_cd(to_tsvector('korean', content), websearch_to_tsquery('korean', $2)) DESC
LIMIT $3 OFFSET $4;