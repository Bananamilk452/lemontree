import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param searchTerm
 * @param take
 * @param skip
 */
export const diaryFullTextSearch: (userId: string, searchTerm: string, take: number, skip: number) => $runtime.TypedSql<diaryFullTextSearch.Parameters, diaryFullTextSearch.Result>

export namespace diaryFullTextSearch {
  export type Parameters = [userId: string, searchTerm: string, take: number, skip: number]
  export type Result = {
    id: string
    content: string
    date: Date
    createdAt: Date
    updatedAt: Date | null
    userId: string
    score: number | null
  }
}
