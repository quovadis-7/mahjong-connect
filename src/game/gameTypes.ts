export type BoardSize = 'small' | 'medium' | 'large'

export type GameMode = 'easy' | 'standard'

export interface CardConfig {
  id: string        // '01' ~ '35'（原为 number，移除 imagePath）
  matchText: string
}

export interface Tile {
  tileId: number
  cardId: string    // 改为 string，与 ImageContent.id 对齐
  isFlipped: boolean
  isMatched: boolean
}

export interface PendingMatch {
  tileId1: number
  tileId2: number
  cardId: string    // 改为 string
}

export type GamePhase = 'selecting' | 'loading' | 'playing' | 'finished'

export interface GameState {
  phase: GamePhase
  boardSize: BoardSize | null
  mode: GameMode
  selectedImageIds: string[]    // 新增：本局随机抽取的图片 ID 列表
  /** tileId of the currently "waiting" tile (first flip, not yet matched) */
  flipped: number | null
  tiles: Tile[]
  pendingMatch: PendingMatch | null
  /** standard mode: tileIds of a mismatched pair waiting to flip back */
  pendingMismatch: { tileId1: number; tileId2: number } | null
}
