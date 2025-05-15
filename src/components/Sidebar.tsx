import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, LogOut, Clock, Play } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { Song } from '../types';

const Sidebar = ({ className }: { className?: string }) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { recentlyPlayed, play } = usePlayerStore();
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [weRollinSong, setWeRollinSong] = useState<Song | null>(null);

  const navItems = [
    { icon: Library, label: 'Your Library', path: '/library' },
    { icon: Library, label: 'Recently Played', path: '/history' },
  ];

  useEffect(() => {
    const fetchWeRollinSong = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('title', 'We Rollin')
        .single();

      if (error) {
        console.error('Error fetching We Rollin song:', error);
        return;
      }

      if (data) {
        const song: Song = {
          id: data.id,
          title: 'We Rollin',
          artist: 'Shubh',
          album: 'We Rollin',
          duration: 189,
          cover_url: '/images/shubh.jpeg',
          audio_url: data.audio_url || 'https://example.com/we-rollin.mp3',
          created_at: data.created_at || new Date().toISOString(),
        };
        setWeRollinSong(song);
      }
    };

    fetchWeRollinSong();
  }, []);

  const handlePlayTrendingSong = () => {
    const song = {
      id: 'jhol',
      title: 'Jhol(KoshalWorld.Com)',
      artist: 'Unknown Artist',
      album: 'Trending',
      duration: 210,
      cover_url: '/images/jhol-cover.jpeg', // Add a valid cover image path
      audio_url: '/Songs/Jhol(KoshalWorld.Com).mp3', // Ensure this path is correct
      created_at: new Date().toISOString(),
    };

    console.log('Playing song:', song);
    play(song);
  };

  return (
    <div
      className={`p-6 pt-20 sidebar-text ${className}`}
      style={{
        backgroundColor: 'var(--sidebar-bg-color, #1a202c)',
        color: 'var(--text-color, #ffffff)',
      }}
    >
      <h1 className="text-xl font-bold mb-6"></h1>
      <nav className="space-y-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex items-center space-x-4 p-3 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg',
              location.pathname === path
                ? 'bg-green-600 text-white'
                : 'hover:bg-gray-800'
            )}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Recently Played Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock size={20} className="mr-2" />
          Recently Played
        </h3>
        <div className="space-y-3">
          {recentlyPlayed.length > 0 ? (
            recentlyPlayed.map((song) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg group cursor-pointer"
                onClick={() => play(song)}
              >
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-green-500 rounded-full hover:bg-green-600 transition-all"
                >
                  <Play size={16} fill="white" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No recently played tracks</p>
          )}
        </div>
      </div>

      {/* Top Charts Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Top Charts</h3>
        <ul className="space-y-2">
          <li>
            <button
              className="text-sm hover:text-green-500 transition-colors"
              style={{ color: 'var(--text-color, #ffffff)' }}
              onClick={handlePlayTrendingSong}
            >
              #1 Trending Song
            </button>
          </li>
          <li
            className="text-sm"
            style={{ color: 'var(--text-color, #ffffff)' }}
          >
            #2 Trending Song
          </li>
        </ul>
        <div className="mt-4 relative">
          <button
            className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700"
            onClick={() => setLanguageDropdown(!languageDropdown)}
          >
            {selectedLanguage}
          </button>
          {languageDropdown && (
            <ul className="absolute left-0 mt-2 w-full bg-gray-800 rounded shadow-lg">
              {['English', 'Hindi', 'Bhojpuri', 'Odia'].map((language) => (
                <li
                  key={language}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedLanguage(language);
                    setLanguageDropdown(false);
                  }}
                >
                  {language}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {user && (
        <button
          onClick={() => signOut()}
          className="mt-auto flex items-center space-x-4 p-2 hover:text-gray-300"
        >
          <LogOut size={24} />
          <span>Logout</span>
        </button>
      )}
    </div>
  );
};

export default Sidebar;