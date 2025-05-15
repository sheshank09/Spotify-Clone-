import { create } from 'zustand';
import { Howl } from 'howler';
import { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  howl: Howl | null;
  queue: Song[];
  recentlyPlayed: Song[];
  play: (song: Song | undefined) => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (song: Song) => void;
  addToRecentlyPlayed: (song: Song) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 1,
  howl: null,
  queue: [],
  recentlyPlayed: [],
  
  play: (song) => {
    if (!song) {
      console.error('No song provided to play');
      return;
    }
    
    try {
      if (get().currentSong?.id === song.id && get().howl) {
        console.log('Resuming current song:', song.title);
        get().howl.play();
      } else {
        if (get().howl) {
          console.log('Unloading previous song');
          get().howl.unload();
        }
        
        console.log('Creating new Howl instance for:', song.title);
        console.log('Audio URL:', song.audio_url);
        
        const howl = new Howl({
          src: [song.audio_url],
          volume: get().volume,
          html5: true, // Add this to improve loading of large files
          onload: () => {
            console.log('Audio loaded successfully:', song.title);
          },
          onloaderror: (id, error) => {
            console.error('Error loading audio:', song.title, error);
          },
          onplay: () => {
            console.log('Audio started playing:', song.title);
          },
          onend: () => {
            console.log('Audio finished playing:', song.title);
            get().next();
          }
        });
        
        howl.play();
        set((state) => {
          // Add song to recently played
          const newRecentlyPlayed = [
            song,
            ...state.recentlyPlayed.filter(s => s.id !== song.id)
          ].slice(0, 5); // Keep only last 5 songs

          return {
            currentSong: song,
            howl,
            isPlaying: true,
            recentlyPlayed: newRecentlyPlayed,
            queue: state.queue.map((s) =>
              s.id === song.id ? { ...s, playCount: (s.playCount || 0) + 1 } : s
            ),
          };
        });
      }
      
      set({ isPlaying: true });
    } catch (error) {
      console.error('Error playing song:', song.title, error);
    }
  },

  pause: () => {
    const { howl } = get();
    if (howl) {
      howl.pause();
      set({ isPlaying: false });
    }
  },

  setVolume: (volume) => {
    const { howl } = get();
    if (howl) howl.volume(volume);
    set({ volume });
  },

  next: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      set({ queue: newQueue });
      get().play(nextSong);
    }
  },

  previous: () => {
    const { queue, currentSong } = get();
    const currentIndex = queue.findIndex((song) => song.id === currentSong?.id);
    if (currentIndex > 0) {
      const previousSong = queue[currentIndex - 1];
      set({ currentSong: previousSong });
      get().play(previousSong);
    } else {
      console.warn('No previous song in the queue'); // Add warning for edge cases
    }
  },

  addToQueue: (song) => {
    set((state) => ({ queue: [...state.queue, song] }));
  },

  addToRecentlyPlayed: (song) => {
    set((state) => ({
      recentlyPlayed: [
        song,
        ...state.recentlyPlayed.filter(s => s.id !== song.id)
      ].slice(0, 5)
    }));
  },
}));