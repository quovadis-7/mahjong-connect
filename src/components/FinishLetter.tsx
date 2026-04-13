import { LOVE_LETTER } from '../data/letter'

interface FinishLetterProps {
  onRestart: () => void
}

export function FinishLetter({ onRestart }: FinishLetterProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Letter container */}
      <div className="letter-appear w-full max-w-lg">
        {/* Envelope top decoration */}
        <div className="text-center mb-6">
          <div className="text-rose-400 text-4xl mb-2">✉</div>
          <div className="text-rose-300 text-sm font-kuaile tracking-widest">— 全部找到了 —</div>
        </div>

        {/* Letter paper */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-10 border border-rose-100"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31px, #fce4ec 31px, #fce4ec 32px)',
          }}
        >
          {/* Top decoration */}
          <div className="text-center mb-6">
            <span className="text-rose-300 text-2xl">✦ ♡ ✦</span>
          </div>

          {/* Letter content */}
          <p className="font-mashan text-rose-800 text-lg leading-loose whitespace-pre-line">
            {LOVE_LETTER}
          </p>

          {/* Bottom decoration */}
          <div className="text-center mt-8">
            <span className="text-rose-200 text-xl">— ♡ —</span>
          </div>
        </div>

        {/* Replay button */}
        <div className="text-center mt-8">
          <button
            onClick={onRestart}
            className="px-10 py-3 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-kuaile text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            再玩一次 ♡
          </button>
        </div>
      </div>
    </div>
  )
}