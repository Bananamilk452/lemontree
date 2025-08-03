-- Change vector dimension from 768 to 3072 for embedding table
-- First, drop the existing HNSW index since it's tied to the vector column
DROP INDEX IF EXISTS "embedding_vector_HNSW";

-- Alter the vector column to change dimension from 768 to 3072
ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE vector(3072);

-- Recreate the HNSW index with the new vector dimension
CREATE INDEX "embedding_vector_HNSW" ON "embedding" USING hnsw ((vector::halfvec(3072)) halfvec_cosine_ops);