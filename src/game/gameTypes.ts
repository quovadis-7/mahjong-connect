export type BoardSize = 'small' | 'medium' | 'large'

export interface CardConfig {
  id: number
  imagePath: string
  matchText: string
}

export interface Tile {
  tileId: number
  cardId: number
  isFlipped: boolean
  isMatched: boolean
}

export interface PendingMatch {
  tileId1: number
  tileId2: number
  cardId: number
}

export type GamePhase = 'selecting' | 'playing' | 'finished'

export interface GameState {
  phase: GamePhase
  boardSize: BoardSize | null
  /** tileId of the currently "waiting" tile (first flip, not yet matched) */
  flipped: number | null
  tiles: Tile[]
  pendingMatch: PendingMatch | null
  /** tileIds of a mismatched pair waiting to flip back */
  pendingMismatch: { tileId1: number; tileId2: number } | null
}