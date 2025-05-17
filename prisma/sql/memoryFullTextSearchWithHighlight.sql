-- @param {String} $1:searchTerm
-- @param {Int} $2:take
-- @param {Int} $3:skip

SELECT
    *,
    ts_headline(
        'korean',
        content,
        websearch_to_tsquery('korean', $1)
    ) AS highlighted_content
FROM
    memory
WHERE
    to_tsvector('korean', content) @@ websearch_to_tsquery('korean', $1)
LIMIT $2 OFFSET $3;