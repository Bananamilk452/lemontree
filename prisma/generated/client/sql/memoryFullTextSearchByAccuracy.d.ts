import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 */
export const memoryFullTextSearchByAccuracy: (userId: string, searchTerm: string, take: number, skip: number) => $runtime.TypedSql<memoryFullTextSearchByAccuracy.Parameters, memoryFullTextSearchByAccuracy.Result>

export namespace memoryFullTextSearchByAccuracy {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number]
  export type Result = {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date | null
    userId: string
    diaryId: string | null
    date: Date
    score: number | null
    total: bigint | null
  }
}
