import { useState } from 'react'
import type { BoardSize, GameMode } from '../game/gameTypes'
import { PASSCODE } from '../data/config'

interface SelectScreenProps {
  onSelect: (boardSize: BoardSize, mode: GameMode) => void
}

const OPTIONS: { size: BoardSize; label: string; sub: string; tiles: string }[] = [
  { size: 'small',  label: '小局',  sub: '6 × 6',  tiles: '36 张 · 18 对' },
  { size: 'medium', label: '中局',  sub: '6 × 8',  tiles: '48 张 · 24 对' },
  { size: 'large',  label: '大局',  sub: '8 × 8',  tiles: '64 张 · 32 对' },
]

export function SelectScreen({ onSelect }: SelectScreenProps) {
  const [input, setInput] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [mode, setMode] = useState<GameMode>('standard')

  const unlocked = input === PASSCODE
  const showError = attempted && !unlocked

  const handleInputChange = (v: string) => {
    setInput(v)
    setAttempted(false)
  }

  const handleUnlock = () => {
    setAttempted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12 gap-8">
      {/* Title */}
      <div className="text-center">
        <div className="text-rose-400 text-3xl mb-2">✦ ♡ ✦</div>
        <h1 className="font-mashan text-5xl text-rose-700 mb-3">专属记忆游戏</h1>
        <p className="font-kuaile text-rose-400 text-lg tracking-wide">翻开每一张牌，找到属于你们的故事</p>
      </div>

      {/* Passcode gate */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <label className="font-kuaile text-rose-500 text-sm tracking-wide">
          {unlocked ? '🔓 已解锁' : '🔒 请输入口令'}
        </label>
        <div className="flex gap-2 w-full">
          <input
            type="password"
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="口令"
            className={`flex-1 px-4 py-2 rounded-full border-2 font-kuaile text-center text-rose-800 outline-none transition-colors ${
              unlocked
                ? 'border-rose-400 bg-rose-50'
                : showError
                ? 'border-red-400 bg-red-50'
                : 'border-rose-200 bg-white focus:border-rose-400'
            }`}
          />
          {!unlocked && (
            <button
              onClick={handleUnlock}
              className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-kuaile text-sm shadow transition-colors"
            >
              确认
            </button>
          )}
        </div>
        {showError && (
          <p className="font-kuaile text-red-400 text-xs">口令不正确，再想想 ♡</p>
        )}
      </div>

      {/* Mode + board size — only shown when unlocked */}
      {unlocked && (
        <>
          {/* Mode toggle */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-kuaile text-rose-500 text-sm">选择模式</span>
            <div className="flex rounded-full border-2 border-rose-200 overflow-hidden shadow-sm">
              {(['easy', 'standard'] as GameMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-6 py-2 font-kuaile text-sm transition-colors ${
                    mode === m
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  {m === 'easy' ? '简单' : '标准'}
                </button>
              ))}
            </div>
            <p className="font-kuaile text-rose-300 text-xs text-center">
              {mode === 'easy' ? '翻开的牌保持显示' : '不匹配的牌会自动翻回'}
            </p>
          </div>

          {/* Board size options */}
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
            {OPTIONS.map(({ size, label, sub, tiles }) => (
              <button
                key={size}
                onClick={() => onSelect(size, mode)}
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
        </>
      )}
    </div>
  )
}