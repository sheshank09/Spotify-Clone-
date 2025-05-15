import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, VolumeX, Volume1, Volume2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    play,
    pause,
    setVolume,
    next,
    previous,
    howl,
  } = usePlayerStore();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0); // Total duration of the song
  const [showFullScreen, setShowFullScreen] = useState(false); // State for full-screen modal
  const lastPosition = useRef(0); // Add this to store last position

  useEffect(() => {
    if (howl) {
      setDuration(howl.duration());
      let interval: NodeJS.Timeout | null = null;
      
      if (isPlaying) {
        // Resume from last position if available
        if (lastPosition.current > 0) {
          howl.seek(lastPosition.current);
        }
        interval = setInterval(() => {
          const seek = howl.seek();
          const currentPosition = typeof seek === 'number' ? seek : 0;
          setProgress(currentPosition);
          lastPosition.current = currentPosition; // Update last position while playing
        }, 100);
      } else {
        // Store current position when paused
        lastPosition.current = howl.seek() as number;
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [howl, isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (howl) {
      howl.seek(seekTime);
      setProgress(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 p-3 h-24 z-50"
        style={{
          backgroundColor: 'var(--nav-bg-color, #1a202c)', // Match Navigation Bar color
          color: 'var(--text-color, #ffffff)', // Use theme variable for text color
        }}
      >
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          <div className="flex items-center space-x-3">
            {currentSong ? (
              <>
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded"
                  onClick={() => setShowFullScreen(true)} // Open full-screen modal
                />
                <div className="text-inherit">
                  <h4 className="text-sm font-medium text-inherit">{currentSong.title}</h4>
                  <p className="text-xs opacity-80 text-inherit">{currentSong.artist}</p>
                </div>
              </>
            ) : (
              <div className="text-inherit opacity-70">Choose a song to play</div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={previous}
                className="p-1 hover:bg-gray-800 rounded-full"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={isPlaying ? pause : () => play(currentSong)}
                className="p-3 bg-green-500 text-white rounded-full hover:scale-105 hover:shadow-md transition-transform"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>

              <button
                onClick={next}
                className="p-1 hover:bg-gray-800 rounded-full"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-400">{formatTime(progress)}</span>
              <div className="relative w-full">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="1"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${(progress / (duration || 1)) * 100}%, #374151 ${(progress / (duration || 1)) * 100}%)`,
                    WebkitAppearance: 'none',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {volume === 0 ? (
              <VolumeX size={18} />
            ) : volume <= 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1"
            />
          </div>
        </div>
      </div>

      {showFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white z-50">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={() => setShowFullScreen(false)} // Close full-screen modal
          >
            Close
          </button>
          <img
            src={currentSong?.cover_url}
            alt={currentSong?.title}
            className="w-64 h-64 rounded mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">{currentSong?.title}</h1>
          <p className="text-lg text-gray-400">{currentSong?.artist}</p>
          <p className="text-sm text-gray-500">{currentSong?.album}</p>
        </div>
      )}
    </>
  );
};

export default Player;