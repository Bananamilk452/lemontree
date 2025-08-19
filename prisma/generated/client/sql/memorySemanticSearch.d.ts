import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 */
export const memorySemanticSearch: (userId: string, vector: string, take: number, skip: number) => $runtime.TypedSql<memorySemanticSearch.Parameters, memorySemanticSearch.Result>

export namespace memorySemanticSearch {
  export type Parameters = [userId: string, vector: string, take: number, skip: number]
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
