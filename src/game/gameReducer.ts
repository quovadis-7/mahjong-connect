import type { GameState, BoardSize } from './gameTypes'
import { CARDS } from '../data/cards'
import { initTiles } from './boardUtils'

export type GameAction =
  | { type: 'START_GAME'; payload: { boardSize: BoardSize } }
  | { type: 'FLIP_TILE'; payload: { tileId: number } }
  | { type: 'CONFIRM_MATCH' }
  | { type: 'RESTART' }

export const initialState: GameState = {
  phase: 'selecting',
  boardSize: null,
  tiles: [],
  flipped: null,
  pendingMatch: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { boardSize } = action.payload
      return {
        phase: 'playing',
        boardSize,
        tiles: initTiles(CARDS, boardSize),
        flipped: null,
        pendingMatch: null,
      }
    }

    case 'FLIP_TILE': {
      if (state.pendingMatch !== null) return state

      const { tileId } = action.payload
      const tile = state.tiles[tileId]
      if (!tile || tile.isFlipped || tile.isMatched) return state

      const newTiles = state.tiles.map(t =>
        t.tileId === tileId ? { ...t, isFlipped: true } : t
      )

      if (state.flipped === null) {
        return { ...state, tiles: newTiles, flipped: tileId }
      }

      const firstTile = newTiles[state.flipped]
      const secondTile = newTiles[tileId]

      if (firstTile.cardId === secondTile.cardId) {
        return {
          ...state,
          tiles: newTiles,
          flipped: null,
          pendingMatch: {
            tileId1: state.flipped,
            tileId2: tileId,
            cardId: firstTile.cardId,
          },
        }
      }

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

    case 'RESTART': {
      return { ...initialState }
    }

    default:
      return state
  }
}