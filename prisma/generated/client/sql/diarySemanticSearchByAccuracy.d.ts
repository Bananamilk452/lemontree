import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 */
export const diarySemanticSearchByAccuracy: (userId: string, vector: string, take: number, skip: number) => $runtime.TypedSql<diarySemanticSearchByAccuracy.Parameters, diarySemanticSearchByAccuracy.Result>

export namespace diarySemanticSearchByAccuracy {
  export type Parameters = [userId: string, vector: string, take: number, skip: number]
  export type Result = {
    id: string
    content: string
    date: Date
    createdAt: Date
    updatedAt: Date | null
    userId: string
    score: number | null
    total: bigint | null
    memories: $runtime.JsonValue | null
    sentiment: number | null
    embeddingCount: bigint | null
  }
}
