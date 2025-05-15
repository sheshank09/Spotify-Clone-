import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Song } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

const Search = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { play } = usePlayerStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isArtistView, setIsArtistView] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  const honeySinghData = {
    name: 'Yo Yo Honey Singh',
    genres: 'Rap • Hip Hop • Punjabi • Pop',
    description: 'One of India\'s most influential hip-hop artists',
    monthlyListeners: '10M+ monthly listeners',
    image: 'public/images/image.jpeg',
    songs: [
      {
        id: 'blue-eyes',
        title: 'Blue Eyes',
        artist: 'Yo Yo Honey Singh',
        album: 'International Villager',
        duration: 240,
        cover_url: 'public/images/image.jpeg',
        audio_url: 'Songs/Blue Eyes Yo Yo Honey Singh 128 Kbps.mp3',
        created_at: new Date().toISOString()
      },
      {
        id: 'brown-rang',
        title: 'Brown Rang',
        artist: 'Yo Yo Honey Singh',
        album: 'International Villager',
        duration: 234,
        cover_url: 'public/images/image.jpeg',
        audio_url: 'Songs/Brown Rang International Villager 128 Kbps.mp3',
        created_at: new Date().toISOString()
      },
      {
        id: 'desi-kalakaar',
        title: 'Desi Kalakaar', 
        artist: 'Yo Yo Honey Singh',
        album: 'Desi Kalakaar',
        duration: 255,
        cover_url: 'public/images/image.jpeg',
        audio_url: 'Songs/Desi Kalakaar Yo Yo Honey Singh 128 Kbps.mp3',
        created_at: new Date().toISOString()
      },
      {
        id: 'love-dose',
        title: 'Love Dose',
        artist: 'Yo Yo Honey Singh',
        album: 'Desi Kalakaar',
        duration: 228,
        cover_url: 'public/images/image.jpeg',
        audio_url: 'Songs/Love Dose Desi Kalakaar 128 Kbps.mp3',
        created_at: new Date().toISOString()
      },
      {
        id: 'millionaire',
        title: 'Millionaire',
        artist: 'Yo Yo Honey Singh',
        album: 'Glory',
        duration: 240,
        cover_url: 'public/images/glory.png',
        audio_url: 'Songs/Millionaire - Glory 320 Kbps.mp3',
        created_at: new Date().toISOString()
      }
    ]
  };

  useEffect(() => {
    const artistParam = searchParams.get('artist');
    if (artistParam) {
      setQuery(artistParam);
      setIsArtistView(true);
      setSelectedArtist(artistParam);

      if (artistParam === 'Yo Yo Honey Singh') {
        setArtists(new Set([artistParam]));
        setSongs([]);
        setLoading(false);
      } else {
        const searchArtist = async () => {
          setLoading(true);
          const { data } = await supabase
            .from('songs')
            .select('*')
            .eq('artist', artistParam);

          if (data) {
            setSongs(data);
            setArtists(new Set([artistParam]));
          }
          setLoading(false);
        };
        searchArtist();
      }
    } else {
      setIsArtistView(false);
      setSelectedArtist(null);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,album.ilike.%${searchQuery}%`);

      if (error) {
        console.error('Search error:', error.message);
        setSongs([]);
        setArtists(new Set());
      } else if (data) {
        setSongs(data);
        const uniqueArtists = new Set(data.map(song => song.artist));
        setArtists(uniqueArtists);
      }
      setLoading(false);
    } else {
      setSongs([]);
      setArtists(new Set());
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      performSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchLikedSongs = async () => {
    if (!user) return;
    
    try {
      const { data: liked } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', user.id);

      if (liked) {
        const likedIds = new Set(liked.map(item => item.song_id));
        setLikedSongs(likedIds);
        // Store in localStorage for persistence
        localStorage.setItem(`liked_songs_${user.id}`, JSON.stringify([...likedIds]));
      }
    } catch (error) {
      console.error('Error fetching liked songs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // First try to get from localStorage
      const storedLikes = localStorage.getItem(`liked_songs_${user.id}`);
      if (storedLikes) {
        setLikedSongs(new Set(JSON.parse(storedLikes)));
      }
      fetchLikedSongs();
    }
  }, [user]);

  const handleLike = async (songId: string, song?: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
  
    try {
      const isCurrentlyLiked = likedSongs.has(songId);
      const newLikedSongs = new Set(likedSongs);
  
      if (isCurrentlyLiked) {
        // Remove like
        await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', songId);
        
        newLikedSongs.delete(songId);
        
        // Update likes count
        await supabase.rpc('decrement_likes', { song_id: songId });
      } else {
        // Add like
        await supabase
          .from('liked_songs')
          .insert({ 
            user_id: user.id, 
            song_id: songId
          });
        
        newLikedSongs.add(songId);
        
        // Update likes count
        await supabase.rpc('increment_likes', { song_id: songId });
      }
  
      setLikedSongs(newLikedSongs);
      localStorage.setItem(`liked_songs_${user.id}`, JSON.stringify([...newLikedSongs]));
  
      // Refresh the songs data to get updated likes count
      if (selectedArtist === 'Yo Yo Honey Singh') {
        const { data: updatedSong } = await supabase
          .from('songs')
          .select('likes')
          .eq('id', songId)
          .single();
        
        if (updatedSong) {
          // Update the likes count in the UI
          const updatedSongs = honeySinghData.songs.map(s => 
            s.id === songId ? { ...s, likes: updatedSong.likes } : s
          );
          honeySinghData.songs = updatedSongs;
        }
      }
  
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const ArtistCard = ({ name }: { name: string }) => {
    const [isImageFullScreen, setIsImageFullScreen] = useState(false);
    const isHoneySingh = name === 'Yo Yo Honey Singh';

    if (isHoneySingh) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg hover:shadow-xl transition-all w-full h-full relative overflow-hidden flex flex-col">
          {isImageFullScreen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
              onClick={() => setIsImageFullScreen(false)}
            >
              <img
                src={honeySinghData.image}
                alt={name}
                className="w-auto h-auto max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <div 
            className="mb-6 flex flex-col items-center cursor-pointer"
            onClick={() => setIsImageFullScreen(true)}
          >
            <img
              src={honeySinghData.image}
              alt={name}
              className="w-48 h-48 rounded-full object-cover border-4 border-green-500 shadow-xl hover:scale-105 transition-transform"
            />
            <h3 className="text-3xl font-bold text-center mt-6 mb-2">{name}</h3>
            <div className="text-center text-gray-300 space-y-2 mb-8">
              <p className="text-green-400 font-semibold">{honeySinghData.genres}</p>
              <p className="text-lg">{honeySinghData.description}</p>
              <p className="text-sm text-green-400">{honeySinghData.monthlyListeners}</p>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-xl font-bold mb-4 text-green-400">Popular Songs</h4>
            <div className="space-y-2">
              {honeySinghData.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-700 rounded-lg group transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 w-6">{index + 1}</span>
                    <div>
                      <h4
                        className="font-medium group-hover:text-green-400 transition-colors cursor-pointer"
                        onClick={() => {
                          console.log('Attempting to play:', song.title);
                          console.log('Audio URL:', song.audio_url);
                          play(song);
                        }}
                      >
                        {song.title}
                      </h4>
                      <p className="text-sm text-gray-400">{song.album}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card click
                        handleLike(song.id, song); // Pass the full song object
                      }}
                      className={`flex items-center space-x-1 ${
                        likedSongs.has(song.id) ? 'text-green-500' : 'text-gray-400'
                      } hover:text-green-500`}
                    >
                      <Heart
                        size={16}
                        fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
                      />
                      {song.likes > 0 && <span>{song.likes}</span>}
                    </button>
                    <span className="text-gray-400 text-sm">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const artistSongs = songs.filter(song => song.artist === name);

    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg hover:shadow-xl transition-all w-full">
        <div 
          className="mb-6 flex flex-col items-center cursor-pointer"
          onClick={() => setSelectedArtist(selectedArtist === name ? null : name)}
        >
          <img
            src={artistSongs[0]?.cover_url}
            alt={name}
            className="w-48 h-48 rounded-full object-cover border-4 border-green-500 shadow-xl hover:scale-105 transition-transform"
          />
          <h3 className="text-3xl font-bold text-center mt-6 mb-2">{name}</h3>
        </div>

        {selectedArtist === name && (
          <div className="mt-8">
            <h4 className="text-xl font-bold mb-4 text-green-400">Popular Songs</h4>
            {artistSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 hover:bg-gray-700 rounded-lg cursor-pointer group transition-all"
                onClick={() => play(song)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 w-6">{index + 1}</span>
                  <img src={song.cover_url} alt={song.title} className="w-12 h-12 rounded shadow-md group-hover:shadow-lg transition-all" />
                  <div>
                    <h4 className="font-medium group-hover:text-green-400 transition-colors">{song.title}</h4>
                    <p className="text-sm text-gray-400">{song.album}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(song.id);
                    }}
                    className={`flex items-center space-x-1 ${
                      likedSongs.has(song.id) ? 'text-green-500' : 'text-gray-400'
                    } hover:text-green-500`}
                  >
                    <Heart
                      size={16}
                      fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
                    />
                    {song.likes > 0 && <span>{song.likes}</span>}
                  </button>
                  <p className="text-sm">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {!isArtistView && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <SearchIcon 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
              size={20}
              onClick={handleSearch}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search for artists, songs, or podcasts"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400">Searching...</div>
      ) : (
        <>
          {artists.size > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Artists</h2>
              <div className={`gap-6 ${artists.size === 1 ? 'w-full' : 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
                {Array.from(artists).map((artist) => (
                  <div key={artist} className={artists.size === 1 ? 'w-full' : ''}>
                    <ArtistCard name={artist} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isArtistView && songs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Songs</h2>
              <div className="space-y-2">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
                    onClick={() => play(song)}
                  >
                    <img src={song.cover_url} alt={song.title} className="w-12 h-12 rounded" />
                    <div>
                      <h3 className="font-medium">{song.title}</h3>
                      <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(song.id);
                      }}
                      className={`flex items-center space-x-1 ${
                        likedSongs.has(song.id) ? 'text-green-500' : 'text-gray-400'
                      } hover:text-green-500`}
                    >
                      <Heart
                        size={16}
                        fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
                      />
                      {song.likes > 0 && <span>{song.likes}</span>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length > 2 && songs.length === 0 && !loading && !isArtistView && (
            <div className="text-center text-gray-400">No matches found</div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
