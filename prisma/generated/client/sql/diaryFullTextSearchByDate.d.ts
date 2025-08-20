import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 * @param direction
 */
export const diaryFullTextSearchByDate: (userId: string, searchTerm: string, take: number, skip: number, direction: string) => $runtime.TypedSql<diaryFullTextSearchByDate.Parameters, diaryFullTextSearchByDate.Result>

export namespace diaryFullTextSearchByDate {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number, direction: string]
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
