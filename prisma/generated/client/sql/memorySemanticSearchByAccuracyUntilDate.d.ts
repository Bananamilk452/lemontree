import * as $runtime from "../runtime/library"

/**
 * @param userId
 * @param vector
 * @param take
 * @param skip
 * @param untilDate
 */
export const memorySemanticSearchByAccuracyUntilDate: (userId: string, vector: string, take: number, skip: number, untilDate: Date) => $runtime.TypedSql<memorySemanticSearchByAccuracyUntilDate.Parameters, memorySemanticSearchByAccuracyUntilDate.Result>

export namespace memorySemanticSearchByAccuracyUntilDate {
  export type Parameters = [userId: string, vector: string, take: number, skip: number, untilDate: Date]
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
