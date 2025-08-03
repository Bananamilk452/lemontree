import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 */
export const diarySemanticSearch: (userId: string, vector: string, take: number, skip: number) => $runtime.TypedSql<diarySemanticSearch.Parameters, diarySemanticSearch.Result>

export namespace diarySemanticSearch {
  export type Parameters = [userId: string, vector: string, take: number, skip: number]
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
