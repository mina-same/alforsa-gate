import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, Snail, Turtle, Zap } from 'lucide-react'
import { formatTime } from 'media-chrome/dist/utils/time.js'
import InlineMessageMeta from '../bubble/InlineMessageMeta'
import Avatar from '../../shared/Avatar'

interface VoiceMessagePlayerProps {
  audioUrl: string
  isSender: boolean
  duration?: number
  timestamp?: string
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | string
  userAvatar?: string
  userName?: string
  channel_type?: string
  onPlay?: () => void
}

const DEFAULT_WAVE_COUNT = 30

const generateWaves = (count: number = DEFAULT_WAVE_COUNT) => {
  return Array.from({ length: count }, () => Math.random() * 0.6 + 0.3)
}

const computeWaveform = async (url: string, count: number = DEFAULT_WAVE_COUNT) => {
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    return generateWaves(count)
  }

  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContextClass()
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const channelData = audioBuffer.numberOfChannels > 0 ? audioBuffer.getChannelData(0) : new Float32Array(0)
    const blockSize = Math.max(1, Math.floor(channelData.length / count))

    const waveform = Array.from({ length: count }, (_, index) => {
      const start = index * blockSize
      const end = Math.min(channelData.length, start + blockSize)
      let sumSquares = 0
      let maxAbs = 0
      const sampleCount = end - start

      for (let i = start; i < end; i++) {
        const value = Math.abs(channelData[i])
        sumSquares += value * value
        maxAbs = Math.max(maxAbs, value)
      }

      const rms = sampleCount > 0 ? Math.sqrt(sumSquares / sampleCount) : 0
      const amplitude = Math.max(maxAbs, rms) * 1.6
      return Math.max(0.15, Math.min(1, amplitude))
    })

    await audioContext.close()
    return waveform
  } catch (error) {
    console.warn('VoiceMessagePlayer waveform decode failed:', error)
    return generateWaves(count)
  }
}

// Add a global ref to track the currently playing audio
let currentlyPlayingAudio: HTMLAudioElement | null = null
let currentlyPlayingSetter: ((playing: boolean) => void) | null = null

export default function VoiceMessagePlayer({
  audioUrl,
  isSender,
  channel_type,
  duration,
  timestamp,
  status,
  userAvatar,
  userName,
  onPlay,
}: VoiceMessagePlayerProps) {
  const isDarkMode = document.documentElement.classList.contains("dark")
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [waves, setWaves] = useState(generateWaves())
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showAvatar, setShowAvatar] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setTotalDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setShowAvatar(true)
      if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const sourceUrl = channel_type === 'internal' ? window.location.origin + audioUrl : audioUrl

    computeWaveform(sourceUrl, DEFAULT_WAVE_COUNT)
      .then((waveform) => {
        if (mounted) setWaves(waveform)
      })
      .catch((error) => {
        console.warn('VoiceMessagePlayer waveform load failed:', error)
      })

    return () => {
      mounted = false
    }
  }, [audioUrl, channel_type])

  const togglePlay = () => {
    if (!audioRef.current) return
    const audio = audioRef.current

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      setShowAvatar(true)
      currentlyPlayingAudio = null
      currentlyPlayingSetter = null
    } else {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        currentlyPlayingAudio.pause()
        if (currentlyPlayingSetter) currentlyPlayingSetter(false)
      }

      audio.play()
      audio.playbackRate = playbackSpeed
      setIsPlaying(true)
      setShowAvatar(false)
      onPlay?.()

      currentlyPlayingAudio = audio
      currentlyPlayingSetter = setIsPlaying
    }
  }

  const handleSpeedCycle = () => {
    const speedSequence = [1, 1.5, 2, 0.5]
    const currentIndex = speedSequence.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speedSequence.length
    const nextSpeed = speedSequence[nextIndex]

    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed
  }

  const getSpeedIcon = () => {
    switch (playbackSpeed) {
      case 0.5: return <Snail className="h-4 w-4" />
      case 1.5: return <Turtle className="h-4 w-4" />
      case 2: return <Zap className="h-4 w-4" />
      default: return <span className="text-xs font-bold">1x</span>
    }
  }

  const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className={`flex flex-col w-full gap-1  px-3 rounded-xl transition-all ${isSender
        ? ' text-gray-900 dark:text-white'
        : ' text-gray-900 dark:text-white'
      }`}>
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 p-2 rounded-full transition-all active:scale-90 hover:opacity-80"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
        </button>

        <div
          className="flex-1 flex items-center gap-0.5 h-8 cursor-pointer min-w-0 overflow-hidden px-1"
          onClick={(e) => {
            if (!audioRef.current) return
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            audioRef.current.currentTime = percent * totalDuration
          }}
        >
          {waves.map((wave, i) => (
            <div
              key={i}
              className={`rounded-full transition-all flex-shrink-0 ${isSender ? 'bg-xon-text-primary' : 'bg-xon-text-secondary'} ${progress > (i / waves.length) * 100 ? 'opacity-100' : 'opacity-30'
                }`}
              style={{
                height: `${Math.max(4, wave * 24)}px`,
                width: '3px',
                minWidth: '2px'
              }}
            />
          ))}
        </div>

        <div className="flex-shrink-0 relative w-8 h-8 flex items-center justify-center">
          {showAvatar && (
            <div className="h-8 w-8 rounded-full bg-xon-surface-container transition-opacity duration-300 ring-2 ring-background/10 overflow-hidden">
              <Avatar size="sm" src={userAvatar} name={userName} />
            </div>
          )}

          {isPlaying && (
            <button
              onClick={handleSpeedCycle}
              className={`p-1 rounded-full transition-all active:scale-95 absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-sm ${isSender ? 'hover:bg-white/20' : 'hover:bg-gray-400/30'}`}
              title={`Speed: ${playbackSpeed}x`}
            >
              <div className="transition-all duration-200">{getSpeedIcon()}</div>
            </button>
          )}
        </div>

        <audio
          ref={audioRef}
          src={
            channel_type === 'internal'
              ? window.location.origin + audioUrl
              : audioUrl
          }
          preload="metadata"
        />
      </div>

      <div className={`flex justify-between items-center px-1 text-[10px] font-medium ${isSender ? 'text-black/70 dark:text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
        <span>{formatTime(currentTime)} / {formatTime(totalDuration || 0)}</span>
        {!!timestamp && (
          <InlineMessageMeta
            time={timestamp}
            status={status}
            isSender={isSender}
            light={isDarkMode}
          />
        )}
      </div>
    </div>
  )
}


