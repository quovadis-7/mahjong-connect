import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from './gameReducer'
import type { GameState } from './gameTypes'

describe('START_GAME', () => {
  it('transitions to playing phase with correct board', () => {
    const state = gameReducer(initialState, {
      type: 'START_GAME',
      payload: { boardSize: 'small' },
    })
    expect(state.phase).toBe('playing')
    expect(state.boardSize).toBe('small')
    expect(state.tiles).toHaveLength(36)
    expect(state.flipped).toBeNull()
    expect(state.pendingMatch).toBeNull()
  })
})

describe('FLIP_TILE', () => {
  function startGame(size: 'small' | 'medium' | 'large' = 'small') {
    return gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: size } })
  }

  it('flips tile and sets flipped when no tile is waiting', () => {
    const s0 = startGame()
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    expect(s1.tiles[0].isFlipped).toBe(true)
    expect(s1.flipped).toBe(0)
    expect(s1.pendingMatch).toBeNull()
  })

  it('ignores already-flipped tile', () => {
    const s0 = startGame()
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    expect(s2.flipped).toBe(0) // unchanged
  })

  it('blocks flipping when pendingMatch is active', () => {
    const s0 = startGame()
    const stateWithPending: GameState = {
      ...s0,
      pendingMatch: { tileId1: 0, tileId2: 1, cardId: 1 },
    }
    const s1 = gameReducer(stateWithPending, { type: 'FLIP_TILE', payload: { tileId: 2 } })
    expect(s1.tiles[2].isFlipped).toBe(false)
  })

  it('sets pendingMatch when matching pair is flipped', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const cardId = tiles[0].cardId
    const id1 = tiles.findIndex(t => t.cardId === cardId)
    const id2 = tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.pendingMatch).not.toBeNull()
    expect(s2.pendingMatch?.cardId).toBe(cardId)
    expect(s2.pendingMatch?.tileId1).toBe(id1)
    expect(s2.pendingMatch?.tileId2).toBe(id2)
    expect(s2.flipped).toBeNull()
  })

  it('sets pendingMismatch when non-matching tile is flipped', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const id1 = 0
    const id2 = tiles.findIndex((t, i) => i !== 0 && t.cardId !== tiles[0].cardId)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.flipped).toBeNull()
    expect(s2.pendingMismatch).toEqual({ tileId1: id1, tileId2: id2 })
    expect(s2.tiles[id1].isFlipped).toBe(true)
    expect(s2.tiles[id2].isFlipped).toBe(true)
    expect(s2.pendingMatch).toBeNull()
  })

  it('blocks flipping when pendingMismatch is active', () => {
    const s0 = startGame()
    const id1 = 0
    const id2 = s0.tiles.findIndex((t, i) => i !== 0 && t.cardId !== s0.tiles[0].cardId)
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const id3 = s0.tiles.findIndex((t, i) => i !== id1 && i !== id2 && !t.isFlipped)
    const s3 = gameReducer(s2, { type: 'FLIP_TILE', payload: { tileId: id3 } })
    expect(s3).toBe(s2)
  })
})

describe('CONFIRM_MATCH', () => {
  it('marks both tiles as matched and clears pendingMatch', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const tiles = s0.tiles
    const cardId = tiles[0].cardId
    const id1 = tiles.findIndex(t => t.cardId === cardId)
    const id2 = tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const s3 = gameReducer(s2, { type: 'CONFIRM_MATCH' })

    expect(s3.tiles[id1].isMatched).toBe(true)
    expect(s3.tiles[id2].isMatched).toBe(true)
    expect(s3.pendingMatch).toBeNull()
    expect(s3.phase).toBe('playing')
  })

  it('transitions to finished when all tiles matched', () => {
    // Build a state where only 2 tiles remain unmatched
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const cardId = s0.tiles[0].cardId
    const id1 = s0.tiles.findIndex(t => t.cardId === cardId)
    const id2 = s0.tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    // Mark all tiles except this pair as matched
    const almostDone: GameState = {
      ...s0,
      tiles: s0.tiles.map(t =>
        t.tileId === id1 || t.tileId === id2 ? t : { ...t, isMatched: true }
      ),
    }
    const s1 = gameReducer(almostDone, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const s3 = gameReducer(s2, { type: 'CONFIRM_MATCH' })

    expect(s3.phase).toBe('finished')
  })

  it('is a no-op when pendingMatch is null', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const s1 = gameReducer(s0, { type: 'CONFIRM_MATCH' })
    expect(s1).toBe(s0)
  })
})

describe('CLEAR_MISMATCH', () => {
  it('flips both mismatched tiles back and clears pendingMismatch', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const id1 = 0
    const id2 = s0.tiles.findIndex((t, i) => i !== 0 && t.cardId !== s0.tiles[0].cardId)
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const s3 = gameReducer(s2, { type: 'CLEAR_MISMATCH' })

    expect(s3.tiles[id1].isFlipped).toBe(false)
    expect(s3.tiles[id2].isFlipped).toBe(false)
    expect(s3.pendingMismatch).toBeNull()
    expect(s3.flipped).toBeNull()
  })

  it('is a no-op when pendingMismatch is null', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const s1 = gameReducer(s0, { type: 'CLEAR_MISMATCH' })
    expect(s1).toBe(s0)
  })
})

describe('RESTART', () => {
  it('resets state to initial', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const s1 = gameReducer(s0, { type: 'RESTART' })
    expect(s1).toEqual(initialState)
  })
})