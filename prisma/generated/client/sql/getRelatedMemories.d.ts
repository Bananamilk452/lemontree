import * as $runtime from "../runtime/library"

/**
 * @param diaryId
 * @param date
 */
export const getRelatedMemories: (diaryId: string, date: Date) => $runtime.TypedSql<getRelatedMemories.Parameters, getRelatedMemories.Result>

export namespace getRelatedMemories {
  export type Parameters = [diaryId: string, date: Date]
  export type Result = {
    memoryId: string
    content: string
    cosine_similarity: number | null
    date: Date
  }
}
