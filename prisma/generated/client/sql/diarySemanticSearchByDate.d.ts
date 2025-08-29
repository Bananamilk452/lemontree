import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 * @param direction
 */
export const diarySemanticSearchByDate: (userId: string, vector: string, take: number, skip: number, direction: string) => $runtime.TypedSql<diarySemanticSearchByDate.Parameters, diarySemanticSearchByDate.Result>

export namespace diarySemanticSearchByDate {
  export type Parameters = [userId: string, vector: string, take: number, skip: number, direction: string]
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
