import type { CardConfig } from '../game/gameTypes'
import { getImageUrl } from '../data/imageContent'

interface MatchDialogProps {
  cardConfig: CardConfig
  onConfirm: () => void
  onZoom: (imageUrl: string) => void
}

export function MatchDialog({ cardConfig, onConfirm, onZoom }: MatchDialogProps) {
  const imageUrl = getImageUrl(cardConfig.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm"
        onClick={onConfirm}
      />
      {/* Dialog card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 mx-6 max-w-sm w-full flex flex-col items-center gap-5 border border-rose-200">
        {/* Decorative top line */}
        <div className="flex items-center gap-2 w-full justify-center mb-1">
          <span className="text-rose-300 text-xl">✦</span>
          <span className="text-rose-400 font-kuaile text-sm tracking-widest">配对成功</span>
          <span className="text-rose-300 text-xl">✦</span>
        </div>

        {/* Image — 点击放大 */}
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center shadow-inner border border-rose-100">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-contain p-2 cursor-zoom-in"
            onClick={e => { e.stopPropagation(); onZoom(imageUrl) }}
          />
        </div>

        {/* Match text */}
        <p className="text-center text-rose-800 font-mashan text-lg leading-relaxed px-2">
          {cardConfig.matchText}
        </p>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="mt-2 px-10 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-kuaile text-base shadow-md hover:shadow-lg transition-all duration-200"
        >
          知道了 ♡
        </button>
      </div>
    </div>
  )
}
