import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from './gameReducer'
import type { GameState } from './gameTypes'

describe('START_GAME', () => {
  it('transitions to playing phase with correct board', () => {
    const state = gameReducer(initialState, {
      type: 'START_GAME',
      payload: { boardSize: 'small', mode: 'easy' },
    })
    expect(state.phase).toBe('playing')
    expect(state.boardSize).toBe('small')
    expect(state.mode).toBe('easy')
    expect(state.tiles).toHaveLength(36)
    expect(state.flipped).toBeNull()
    expect(state.pendingMatch).toBeNull()
  })
})

describe('FLIP_TILE (easy mode)', () => {
  function startGame(size: 'small' | 'medium' | 'large' = 'small') {
    return gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: size, mode: 'easy' } })
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
    expect(s2.flipped).toBe(0)
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
    expect(s2.flipped).toBeNull()
  })

  it('keeps non-matching tile face-up in easy mode', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const id1 = 0
    const id2 = tiles.findIndex((t, i) => i !== 0 && t.cardId !== tiles[0].cardId)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.tiles[id1].isFlipped).toBe(true)
    expect(s2.tiles[id2].isFlipped).toBe(true)
    expect(s2.pendingMismatch).toBeNull()
    expect(s2.pendingMatch).toBeNull()
  })

  it('matches a tile flipped earlier even when other non-matching tiles are also face-up', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const cardIdA = tiles[0].cardId
    const idA = tiles.findIndex(t => t.cardId === cardIdA)
    const idA2 = tiles.findIndex((t, i) => t.cardId === cardIdA && i !== idA)
    const idB = tiles.findIndex((t, i) => i !== idA && i !== idA2 && t.cardId !== cardIdA)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: idA } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: idB } })
    const s3 = gameReducer(s2, { type: 'FLIP_TILE', payload: { tileId: idA2 } })

    expect(s3.pendingMatch).not.toBeNull()
    expect(s3.pendingMatch?.cardId).toBe(cardIdA)
  })
})

describe('FLIP_TILE (standard mode)', () => {
  function startStandard() {
    return gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'standard' } })
  }

  it('sets pendingMismatch when two non-matching tiles are flipped', () => {
    const s0 = startStandard()
    const tiles = s0.tiles
    const id1 = 0
    const id2 = tiles.findIndex((t, i) => i !== 0 && t.cardId !== tiles[0].cardId)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.pendingMismatch).toEqual({ tileId1: id1, tileId2: id2 })
    expect(s2.flipped).toBeNull()
  })

  it('blocks flipping when pendingMismatch is active', () => {
    const s0 = startStandard()
    const id1 = 0
    const id2 = s0.tiles.findIndex((t, i) => i !== 0 && t.cardId !== s0.tiles[0].cardId)
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const id3 = s0.tiles.findIndex((_t, i) => i !== id1 && i !== id2)
    const s3 = gameReducer(s2, { type: 'FLIP_TILE', payload: { tileId: id3 } })
    expect(s3).toBe(s2)
  })
})

describe('CONFIRM_MATCH', () => {
  it('marks both tiles as matched and clears pendingMatch', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'easy' } })
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
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'easy' } })
    const cardId = s0.tiles[0].cardId
    const id1 = s0.tiles.findIndex(t => t.cardId === cardId)
    const id2 = s0.tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

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
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'easy' } })
    const s1 = gameReducer(s0, { type: 'CONFIRM_MATCH' })
    expect(s1).toBe(s0)
  })
})

describe('CLEAR_MISMATCH', () => {
  it('flips both mismatched tiles back and clears pendingMismatch', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'standard' } })
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
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'standard' } })
    const s1 = gameReducer(s0, { type: 'CLEAR_MISMATCH' })
    expect(s1).toBe(s0)
  })
})

describe('RESTART', () => {
  it('resets state to initial', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small', mode: 'easy' } })
    const s1 = gameReducer(s0, { type: 'RESTART' })
    expect(s1).toEqual(initialState)
  })
})