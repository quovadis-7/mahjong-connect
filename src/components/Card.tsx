import type { Tile, CardConfig } from '../game/gameTypes'

interface CardProps {
  tile: Tile
  cardConfig: CardConfig
  onClick: (tileId: number) => void
}

function CardBack() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 75 100"
      className="w-full h-full"
    >
      <rect width="75" height="100" rx="6" fill="#c2185b" />
      <rect x="4" y="4" width="67" height="92" rx="5" fill="none" stroke="#f48fb1" strokeWidth="1.5" />
      <rect x="8" y="8" width="59" height="84" rx="4" fill="none" stroke="#f48fb1" strokeWidth="0.8" opacity="0.5" />
      {/* Center heart */}
      <path
        d="M37.5 62 C37.5 62 18 48 18 36 A12 12 0 0 1 37.5 30 A12 12 0 0 1 57 36 C57 48 37.5 62 37.5 62Z"
        fill="#f48fb1"
        opacity="0.9"
      />
      {/* Corner hearts */}
      {[
        [14, 16], [61, 16], [14, 84], [61, 84],
      ].map(([cx, cy], i) => (
        <path
          key={i}
          d={`M${cx} ${cy + 3} C${cx} ${cy + 3} ${cx - 5} ${cy - 1} ${cx - 5} ${cy - 3} A3.5 3.5 0 0 1 ${cx} ${cy + 1} A3.5 3.5 0 0 1 ${cx + 5} ${cy - 3} C${cx + 5} ${cy - 1} ${cx} ${cy + 3} ${cx} ${cy + 3}Z`}
          fill="#f48fb1"
          opacity="0.7"
        />
      ))}
      {/* Decorative dots */}
      {[
        [37, 16], [37, 84], [8, 50], [67, 50],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#f48fb1" opacity="0.6" />
      ))}
    </svg>
  )
}

export function Card({ tile, cardConfig, onClick }: CardProps) {
  const handleClick = () => {
    if (!tile.isMatched && !tile.isFlipped) {
      onClick(tile.tileId)
    }
  }

  return (
    <div
      className={`card-wrapper transition-[opacity,visibility] duration-500 ${
        tile.isMatched ? 'invisible opacity-0' : 'cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className={`card-inner ${tile.isFlipped ? 'flipped' : ''}`}>
        {/* Back face */}
        <div className="card-face card-back shadow-md hover:shadow-lg transition-shadow">
          <CardBack />
        </div>
        {/* Front face */}
        <div className="card-face card-front bg-white shadow-md flex items-center justify-center p-2">
          <img
            src={cardConfig.imagePath}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}