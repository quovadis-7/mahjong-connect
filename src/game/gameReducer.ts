import type { GameState, BoardSize, GameMode } from './gameTypes'
import { CARDS } from '../data/cards'
import { initTiles } from './boardUtils'

export type GameAction =
  | { type: 'START_GAME'; payload: { boardSize: BoardSize; mode: GameMode } }
  | { type: 'FLIP_TILE'; payload: { tileId: number } }
  | { type: 'CONFIRM_MATCH' }
  | { type: 'CLEAR_MISMATCH' }
  | { type: 'RESTART' }

export const initialState: GameState = {
  phase: 'selecting',
  boardSize: null,
  mode: 'easy',
  tiles: [],
  flipped: null,
  pendingMatch: null,
  pendingMismatch: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { boardSize, mode } = action.payload
      return {
        phase: 'playing',
        boardSize,
        mode,
        tiles: initTiles(CARDS, boardSize),
        flipped: null,
        pendingMatch: null,
        pendingMismatch: null,
      }
    }

    case 'FLIP_TILE': {
      if (state.pendingMatch !== null || state.pendingMismatch !== null) return state

      const { tileId } = action.payload
      const tile = state.tiles[tileId]
      if (!tile || tile.isFlipped || tile.isMatched) return state

      const newTiles = state.tiles.map(t =>
        t.tileId === tileId ? { ...t, isFlipped: true } : t
      )

      // Search ALL currently face-up unmatched tiles for a matching cardId
      const matchingTile = state.tiles.find(
        t => t.tileId !== tileId && t.isFlipped && !t.isMatched && t.cardId === tile.cardId
      )

      if (matchingTile) {
        return {
          ...state,
          tiles: newTiles,
          flipped: null,
          pendingMatch: {
            tileId1: matchingTile.tileId,
            tileId2: tileId,
            cardId: tile.cardId,
          },
        }
      }

      // No match found
      if (state.mode === 'standard' && state.flipped !== null) {
        // Standard mode: flip both back after a delay
        return {
          ...state,
          tiles: newTiles,
          flipped: null,
          pendingMismatch: { tileId1: state.flipped, tileId2: tileId },
        }
      }

      // Easy mode (or first flip in standard mode): tile stays face-up
      return { ...state, tiles: newTiles, flipped: tileId }
    }

    case 'CONFIRM_MATCH': {
      if (!state.pendingMatch) return state

      const { tileId1, tileId2 } = state.pendingMatch
      const newTiles = state.tiles.map(t =>
        t.tileId === tileId1 || t.tileId === tileId2
          ? { ...t, isMatched: true }
          : t
      )
      const allMatched = newTiles.every(t => t.isMatched)

      return {
        ...state,
        tiles: newTiles,
        pendingMatch: null,
        phase: allMatched ? 'finished' : 'playing',
      }
    }

    case 'CLEAR_MISMATCH': {
      if (!state.pendingMismatch) return state

      const { tileId1, tileId2 } = state.pendingMismatch
      const newTiles = state.tiles.map(t =>
        t.tileId === tileId1 || t.tileId === tileId2
          ? { ...t, isFlipped: false }
          : t
      )
      return { ...state, tiles: newTiles, pendingMismatch: null, flipped: null }
    }

    case 'RESTART': {
      return { ...initialState }
    }

    default:
      return state
  }
}