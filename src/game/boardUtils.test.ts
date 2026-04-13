import { describe, it, expect } from 'vitest'
import { shuffle, getPairCount, getCols, initTiles } from './boardUtils'
import { CARDS } from '../data/cards'

describe('shuffle', () => {
  it('returns array with same elements in any order', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result).toHaveLength(5)
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate original array', () => {
    const arr = [1, 2, 3]
    shuffle(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('returns a new array reference', () => {
    const arr = [1, 2, 3]
    expect(shuffle(arr)).not.toBe(arr)
  })
})

describe('getPairCount', () => {
  it('returns 18 for small', () => expect(getPairCount('small')).toBe(18))
  it('returns 24 for medium', () => expect(getPairCount('medium')).toBe(24))
  it('returns 32 for large', () => expect(getPairCount('large')).toBe(32))
})

describe('getCols', () => {
  it('returns 6 for small', () => expect(getCols('small')).toBe(6))
  it('returns 8 for medium', () => expect(getCols('medium')).toBe(8))
  it('returns 8 for large', () => expect(getCols('large')).toBe(8))
})

describe('initTiles', () => {
  it('creates 36 tiles for small (6x6)', () => {
    expect(initTiles(CARDS, 'small')).toHaveLength(36)
  })

  it('creates 48 tiles for medium (6x8)', () => {
    expect(initTiles(CARDS, 'medium')).toHaveLength(48)
  })

  it('creates 64 tiles for large (8x8)', () => {
    expect(initTiles(CARDS, 'large')).toHaveLength(64)
  })

  it('each cardId appears exactly twice', () => {
    const tiles = initTiles(CARDS, 'small')
    const counts = new Map<number, number>()
    tiles.forEach(t => counts.set(t.cardId, (counts.get(t.cardId) ?? 0) + 1))
    counts.forEach(count => expect(count).toBe(2))
  })

  it('all tiles start unflipped and unmatched', () => {
    const tiles = initTiles(CARDS, 'small')
    tiles.forEach(t => {
      expect(t.isFlipped).toBe(false)
      expect(t.isMatched).toBe(false)
    })
  })

  it('tileIds are sequential from 0', () => {
    const tiles = initTiles(CARDS, 'small')
    expect(tiles.map(t => t.tileId)).toEqual(Array.from({ length: 36 }, (_, i) => i))
  })

  it('uses all 32 cards for large board', () => {
    const tiles = initTiles(CARDS, 'large')
    const cardIds = new Set(tiles.map(t => t.cardId))
    expect(cardIds.size).toBe(32)
  })
})