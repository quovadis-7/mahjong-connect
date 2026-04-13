import type { BoardSize } from '../game/gameTypes'

interface SelectScreenProps {
  onSelect: (boardSize: BoardSize) => void
}

const OPTIONS: { size: BoardSize; label: string; sub: string; tiles: string }[] = [
  { size: 'small',  label: '小局',  sub: '6 × 6',  tiles: '36 张 · 18 对' },
  { size: 'medium', label: '中局',  sub: '6 × 8',  tiles: '48 张 · 24 对' },
  { size: 'large',  label: '大局',  sub: '8 × 8',  tiles: '64 张 · 32 对' },
]

export function SelectScreen({ onSelect }: SelectScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12 gap-10">
      {/* Title */}
      <div className="text-center">
        <div className="text-rose-400 text-3xl mb-2">✦ ♡ ✦</div>
        <h1 className="font-mashan text-5xl text-rose-700 mb-3">专属记忆游戏</h1>
        <p className="font-kuaile text-rose-400 text-lg tracking-wide">翻开每一张牌，找到属于你们的故事</p>
      </div>

      {/* Board size options */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {OPTIONS.map(({ size, label, sub, tiles }) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className="flex-1 group bg-white hover:bg-rose-50 border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-md hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <span className="font-mashan text-3xl text-rose-600 group-hover:text-rose-700 transition-colors">
              {label}
            </span>
            <span className="font-kuaile text-2xl text-rose-800">{sub}</span>
            <span className="font-kuaile text-sm text-rose-400">{tiles}</span>
            <span className="mt-2 text-rose-300 text-xl group-hover:text-rose-500 transition-colors">♡</span>
          </button>
        ))}
      </div>

      <p className="font-kuaile text-rose-300 text-sm text-center">选择你想要的牌数，开始游戏</p>
    </div>
  )
}