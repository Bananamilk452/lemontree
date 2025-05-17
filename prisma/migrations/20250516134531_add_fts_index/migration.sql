CREATE EXTENSION textsearch_ko;

CREATE INDEX idx_diary_content_fts
ON diary
USING GIN (to_tsvector('korean', content));

CREATE INDEX idx_memory_content_fts
ON memory
USING GIN (to_tsvector('korean', content));