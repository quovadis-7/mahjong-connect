// src/components/LoadingScreen.tsx
import { useEffect, useState } from 'react'
import { getImageUrl } from '../data/imageContent'

interface LoadingScreenProps {
  imageIds: string[]
  onLoaded: () => void
}

export function LoadingScreen({ imageIds, onLoaded }: LoadingScreenProps) {
  const [loadedCount, setLoadedCount] = useState(0)
  const total = imageIds.length

  useEffect(() => {
    let cancelled = false
    let count = 0

    const promises = imageIds.map(
      id =>
        new Promise<void>(resolve => {
          const img = new Image()
          const done = () => {
            if (!cancelled) {
              count++
              setLoadedCount(count)
            }
            resolve()
          }
          img.onload = done
          img.onerror = done  // 加载失败也计入完成，不卡住游戏
          img.src = getImageUrl(id)
        })
    )

    Promise.all(promises).then(() => {
      if (!cancelled) onLoaded()
    })

    return () => {
      cancelled = true
    }
  }, []) // imageIds 在 loading 阶段不会变化

  const pct = total === 0 ? 100 : Math.round((loadedCount / total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-rose-400 text-3xl mb-4">✦ ♡ ✦</div>
        <h2 className="font-mashan text-4xl text-rose-700 mb-2">游戏加载中</h2>
        <p className="font-kuaile text-rose-400 text-sm">正在准备专属记忆...</p>
      </div>

      <div className="flex flex-col items-center gap-3 w-64">
        <div className="w-full h-3 bg-rose-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-kuaile text-rose-500 text-lg">{pct}%</span>
      </div>
    </div>
  )
}
