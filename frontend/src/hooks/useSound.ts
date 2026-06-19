import { useCallback, useRef } from "react"

const STORAGE_KEY = "querylab-sound-enabled"

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const soundEnabled = useCallback(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEY) !== "false"
  }, [])

  const toggleSound = useCallback(() => {
    const current = soundEnabled()
    localStorage.setItem(STORAGE_KEY, current ? "false" : "true")
  }, [soundEnabled])

  const playSuccess = useCallback(() => {
    if (!soundEnabled()) return
    try {
      const ctx = ctxRef.current ?? new AudioContext()
      ctxRef.current = ctx

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
    }
  }, [soundEnabled])

  return { soundEnabled, toggleSound, playSuccess }
}
