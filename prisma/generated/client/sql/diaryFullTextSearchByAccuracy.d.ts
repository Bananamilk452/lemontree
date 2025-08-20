import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 */
export const diaryFullTextSearchByAccuracy: (userId: string, searchTerm: string, take: number, skip: number) => $runtime.TypedSql<diaryFullTextSearchByAccuracy.Parameters, diaryFullTextSearchByAccuracy.Result>

export namespace diaryFullTextSearchByAccuracy {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number]
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
    embeddingCount: bigint | null
  }
}
