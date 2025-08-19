import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 * @param direction
 */
export const memoryFullTextSearchByDate: (userId: string, searchTerm: string, take: number, skip: number, direction: string) => $runtime.TypedSql<memoryFullTextSearchByDate.Parameters, memoryFullTextSearchByDate.Result>

export namespace memoryFullTextSearchByDate {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number, direction: string]
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
