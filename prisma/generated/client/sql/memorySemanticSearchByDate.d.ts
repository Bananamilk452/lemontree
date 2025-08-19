import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 * @param direction
 */
export const memorySemanticSearchByDate: (userId: string, vector: string, take: number, skip: number, direction: string) => $runtime.TypedSql<memorySemanticSearchByDate.Parameters, memorySemanticSearchByDate.Result>

export namespace memorySemanticSearchByDate {
  export type Parameters = [userId: string, vector: string, take: number, skip: number, direction: string]
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
