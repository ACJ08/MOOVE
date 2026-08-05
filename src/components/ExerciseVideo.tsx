import { useRef, useState, useEffect } from 'react'
import defaultVideoSrc from '@/assets/videos/Chin_Tucks.mp4'

interface ExerciseVideoProps {
  exerciseEmoji?: string
  playing?: boolean
  className?: string
  /** Override the video source for a specific exercise */
  src?: string
}

// Reusable video player for exercise demonstrations.
// Pass `src` to use a per-exercise video; falls back to the bundled Chin Tucks video.
// Always autoplays muted, loops, and restarts when src changes.
export default function ExerciseVideo({ exerciseEmoji = '🧘', playing = true, className = '', src }: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const videoSrc = src || defaultVideoSrc

  // Restart + re-evaluate play state when src changes
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setLoaded(false); setError(false)
    v.load()
  }, [videoSrc])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.play().catch(() => { v.muted = true; v.play().catch(() => setError(true)) })
    } else {
      v.pause()
    }
  }, [playing])

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${className}`} style={{ aspectRatio: '16/9' }}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center">
          <div className="text-5xl opacity-40">{exerciseEmoji}</div>
        </div>
      )}

      {!error ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onCanPlay={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 to-orange-700">
          <div className="text-6xl mb-2">{exerciseEmoji}</div>
          <div className="text-white/70 text-xs font-semibold">Exercise Demonstration</div>
        </div>
      )}
    </div>
  )
}
