import { describe, it, expect } from 'vitest'
import { shuffle, getPairCount, getCols, initTiles, getRandomImageIds } from './boardUtils'
import { IMAGE_CONTENTS } from '../data/imageContent'

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

describe('getRandomImageIds', () => {
  it('returns correct count for small', () => {
    expect(getRandomImageIds(18)).toHaveLength(18)
  })

  it('returns correct count for medium', () => {
    expect(getRandomImageIds(24)).toHaveLength(24)
  })

  it('returns correct count for large', () => {
    expect(getRandomImageIds(32)).toHaveLength(32)
  })

  it('returns only valid image ids', () => {
    const validIds = new Set(IMAGE_CONTENTS.map(c => c.id))
    getRandomImageIds(18).forEach(id => expect(validIds.has(id)).toBe(true))
  })

  it('returns no duplicate ids', () => {
    const ids = getRandomImageIds(32)
    expect(new Set(ids).size).toBe(32)
  })
})

describe('initTiles', () => {
  const sampleIds = IMAGE_CONTENTS.slice(0, 18).map(c => c.id)

  it('creates 2 tiles per image id', () => {
    expect(initTiles(sampleIds)).toHaveLength(36)
  })

  it('each cardId appears exactly twice', () => {
    const tiles = initTiles(sampleIds)
    const counts = new Map<string, number>()
    tiles.forEach(t => counts.set(t.cardId, (counts.get(t.cardId) ?? 0) + 1))
    counts.forEach(count => expect(count).toBe(2))
  })

  it('all tiles start unflipped and unmatched', () => {
    initTiles(sampleIds).forEach(t => {
      expect(t.isFlipped).toBe(false)
      expect(t.isMatched).toBe(false)
    })
  })

  it('tileIds are sequential from 0', () => {
    const tiles = initTiles(sampleIds)
    expect(tiles.map(t => t.tileId)).toEqual(Array.from({ length: 36 }, (_, i) => i))
  })

  it('creates 64 tiles for 32 image ids', () => {
    const ids32 = IMAGE_CONTENTS.slice(0, 32).map(c => c.id)
    expect(initTiles(ids32)).toHaveLength(64)
  })
})
