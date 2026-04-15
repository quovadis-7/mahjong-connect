import type { Tile, BoardSize } from './gameTypes'
import { IMAGE_CONTENTS } from '../data/imageContent'

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

/** 从 35 张图中随机抽取 pairCount 张，返回不重复的 id 列表 */
export function getRandomImageIds(pairCount: number): string[] {
  return shuffle(IMAGE_CONTENTS.map(c => c.id)).slice(0, pairCount)
}

/** 根据图片 id 列表生成打乱后的 tile 数组（每个 id 复制两份） */
export function initTiles(imageIds: string[]): Tile[] {
  const shuffledPairs = shuffle([...imageIds, ...imageIds])
  return shuffledPairs.map((id, index) => ({
    tileId: index,
    cardId: id,
    isFlipped: false,
    isMatched: false,
  }))
}
