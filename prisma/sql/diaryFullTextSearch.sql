-- @param {String} $1:searchTerm
-- @param {Int} $2:take
-- @param {Int} $3:skip

SELECT *
FROM diary
WHERE to_tsvector('korean', content) @@ websearch_to_tsquery('korean', $1)
LIMIT $2 OFFSET $3;