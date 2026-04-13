import type { CardConfig, Tile, BoardSize } from './gameTypes'

export function getPairCount(boardSize: BoardSize): number {
  const map: Record<BoardSize, number> = { small: 18, medium: 24, large: 32 }
  return map[boardSize]
}

export function getCols(boardSize: BoardSize): number {
  const map: Record<BoardSize, number> = { small: 6, medium: 8, large: 8 }
  return map[boardSize]
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function initTiles(cards: CardConfig[], boardSize: BoardSize): Tile[] {
  const pairCount = getPairCount(boardSize)
  const selected = shuffle(cards).slice(0, pairCount)
  const shuffledPairs = shuffle([...selected, ...selected])
  return shuffledPairs.map((card, index) => ({
    tileId: index,
    cardId: card.id,
    isFlipped: false,
    isMatched: false,
  }))
}