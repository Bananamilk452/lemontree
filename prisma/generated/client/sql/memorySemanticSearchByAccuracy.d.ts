import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 */
export const memorySemanticSearchByAccuracy: (userId: string, vector: string, take: number, skip: number) => $runtime.TypedSql<memorySemanticSearchByAccuracy.Parameters, memorySemanticSearchByAccuracy.Result>

export namespace memorySemanticSearchByAccuracy {
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
