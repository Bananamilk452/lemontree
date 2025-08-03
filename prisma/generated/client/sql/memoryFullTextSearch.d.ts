import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 */
export const memoryFullTextSearch: (userId: string, searchTerm: string, take: number, skip: number) => $runtime.TypedSql<memoryFullTextSearch.Parameters, memoryFullTextSearch.Result>

export namespace memoryFullTextSearch {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number]
  export type Result = {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date | null
    userId: string
    diaryId: string | null
    score: number | null
  }
}
