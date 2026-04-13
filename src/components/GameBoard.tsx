import { useEffect, useState } from 'react'
import type { GameState } from '../game/gameTypes'
import type { GameAction } from '../game/gameReducer'
import type { CardConfig } from '../game/gameTypes'
import { getCols } from '../game/boardUtils'
import { Card } from './Card'
import { MatchDialog } from './MatchDialog'
import { ImageZoomDialog } from './ImageZoomDialog'

interface GameBoardProps {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  cards: CardConfig[]
}

export function GameBoard({ state, dispatch, cards }: GameBoardProps) {
  const { tiles, pendingMatch, pendingMismatch, boardSize } = state
  const cols = getCols(boardSize!)

  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  // Standard mode: flip mismatched tiles back after 800ms
  useEffect(() => {
    if (!pendingMismatch) return
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_MISMATCH' }), 800)
    return () => clearTimeout(timer)
  }, [pendingMismatch, dispatch])

  const cardMap = new Map(cards.map(c => [c.id, c]))
  const matchedCount = tiles.filter(t => t.isMatched).length / 2
  const totalPairs = tiles.length / 2

  const pendingCard = pendingMatch ? cardMap.get(pendingMatch.cardId) : null

  const colClass: Record<number, string> = {
    6: 'grid-cols-6',
    8: 'grid-cols-8',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center px-4 py-8 gap-6">
      {/* Back button */}
      <div className="w-full max-w-4xl flex">
        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="flex items-center gap-1 font-kuaile text-rose-400 hover:text-rose-600 text-sm transition-colors"
        >
          ← 重新选择
        </button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="font-mashan text-3xl text-rose-700 mb-1">专属记忆游戏</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="font-kuaile text-rose-500 text-sm">已找到</span>
          <span className="font-kuaile text-rose-700 text-lg font-bold">{matchedCount}</span>
          <span className="font-kuaile text-rose-500 text-sm">/ {totalPairs} 对</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-48 h-2 bg-rose-100 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          />
        </div>
      </div>

      {/* Board */}
      <div className={`grid ${colClass[cols]} gap-2`}>
        {tiles.map(tile => {
          const config = cardMap.get(tile.cardId)!
          return (
            <div key={tile.tileId} className="w-14 h-20 sm:w-16 sm:h-22">
              <Card
                tile={tile}
                cardConfig={config}
                onClick={tileId => dispatch({ type: 'FLIP_TILE', payload: { tileId } })}
                onZoom={setZoomedImage}
              />
            </div>
          )
        })}
      </div>

      {/* Match dialog */}
      {pendingMatch && pendingCard && (
        <MatchDialog
          cardConfig={pendingCard}
          onConfirm={() => dispatch({ type: 'CONFIRM_MATCH' })}
        />
      )}

      {/* Image zoom */}
      {zoomedImage && (
        <ImageZoomDialog imagePath={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  )
}