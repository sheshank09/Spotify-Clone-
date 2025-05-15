import React, { useEffect, useState } from 'react';
import { Play, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Song } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface HomeProps {
  showWelcome: boolean; // Add prop type for showWelcome
}

const Home: React.FC<HomeProps> = ({ showWelcome }) => {
  const navigate = useNavigate();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [weRollinSongs, setWeRollinSongs] = useState<Song[]>([]); // State for "We Rollin" songs
  const [showWeRollinSongs, setShowWeRollinSongs] = useState(false); // State to toggle song list
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const { play } = usePlayerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchSongs = async () => {
      const { data: recent } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: featured } = await supabase
        .from('songs')
        .select('*')
        .limit(10);

      const { data: weRollin } = await supabase
        .from('songs')
        .select('*')
        .eq('album', 'We Rollin'); // Fetch songs of "We Rollin"

      if (recent) setRecentSongs(recent);
      if (featured) setFeaturedSongs(featured);
      if (weRollin) setWeRollinSongs(weRollin);
    };

    fetchSongs();
  }, []);

  const fetchWeRollinSong = async () => {
    const song = {
      id: 'we-rollin',
      title: 'We Rollin',
      artist: 'Shubh',
      album: 'We Rollin',
      duration: 189,
      cover_url: '/images/shubh.jpeg',
      audio_url: '/Songs/We Rollin.mp3', // Corrected path to match the actual file location
      created_at: new Date().toISOString(),
    };

    console.log('Playing song:', song.audio_url); // Debug log
    play(song); // Play the song directly
  };

  const playBlueEyes = () => {
    const song = {
      id: 'blue-eyes',
      title: 'Blue Eyes',
      artist: 'Yo Yo Honey Singh',
      album: 'International Villager',
      duration: 240,
      cover_url: '/images/honeysing.jpeg',
      // Remove leading slash to make path relative
      audio_url: 'Songs/Blue Eyes Yo Yo Honey Singh 128 Kbps.mp3',
      created_at: new Date().toISOString(),
    };
    console.log('Playing Blue Eyes:', song.audio_url);
    play(song);
  };

  const playGlorySong = () => {
    const song = {
      id: 'millionaire',
      title: 'Millionaire',
      artist: 'Yo Yo Honey Singh',
      album: 'Glory',
      duration: 240,
      cover_url: 'public/images/glory.png',
      audio_url: 'Songs/Millionaire - Glory 320 Kbps.mp3',
      created_at: new Date().toISOString(),
    };
    console.log('Playing Millionaire from Glory:', song.audio_url);
    play(song);
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
        localStorage.setItem(`liked_songs_${user.id}`, JSON.stringify([...likedIds]));
      }
    } catch (error) {
      console.error('Error fetching liked songs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const storedLikes = localStorage.getItem(`liked_songs_${user.id}`);
      if (storedLikes) {
        setLikedSongs(new Set(JSON.parse(storedLikes)));
      }
      fetchLikedSongs();
    }
  }, [user]);

  const handleLike = async (songId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const isCurrentlyLiked = likedSongs.has(songId);
      const newLikedSongs = new Set(likedSongs);
      
      if (isCurrentlyLiked) {
        await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', songId);
        
        newLikedSongs.delete(songId);
      } else {
        await supabase
          .from('liked_songs')
          .insert({ user_id: user.id, song_id: songId });
        
        newLikedSongs.add(songId);
      }

      setLikedSongs(newLikedSongs);
      localStorage.setItem(`liked_songs_${user.id}`, JSON.stringify([...newLikedSongs]));

      // Update the song's like count in the database and local state
      const { data: song } = await supabase
        .from('songs')
        .select('likes')
        .eq('id', songId)
        .single();

      if (song) {
        const newLikes = (song.likes || 0) + (isCurrentlyLiked ? -1 : 1);
        
        await supabase
          .from('songs')
          .update({ likes: newLikes })
          .eq('id', songId);

        // Update local state for any affected songs
        setRecentSongs(prev => 
          prev.map(s => s.id === songId ? { ...s, likes: newLikes } : s)
        );
        setFeaturedSongs(prev => 
          prev.map(s => s.id === songId ? { ...s, likes: newLikes } : s)
        );
      }

    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const SongCard = ({ song }: { song: Song }) => (
    <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer card-starlight">
      <div className="relative">
        <img
          src={song.cover_url}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md mb-4"
        />
        <button
          className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            play(song);
          }}
        >
          <Play fill="white" size={16} />
        </button>
      </div>
      <h3 className="font-semibold truncate group-hover:whitespace-normal text-gray-300">
        {song.title}
      </h3>
      <p className="text-sm text-gray-400 truncate group-hover:whitespace-normal">
        {song.artist}
      </p>
      <div className="flex items-center justify-between mt-2">
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
        <span className="text-xs text-gray-400">{song.playCount || 0} plays</span>
      </div>
    </div>
  );

  const ArtistCard = ({ name, image }: { name: string; image: string }) => (
    <div
      className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer card-starlight"
      onClick={() => {
        if (name === 'Yo Yo Honey Singh') {
          navigate('/search?artist=Yo Yo Honey Singh');
        } else {
          navigate(`/search?artist=${encodeURIComponent(name)}`);
        }
      }}
    >
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
        />
        <button
          className="absolute bottom-0 right-0 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (name === 'Yo Yo Honey Singh') {
              playBlueEyes(); // Play Blue Eyes when clicking play button
            }
          }}
        >
          <Play fill="white" size={16} />
        </button>
      </div>
      <h3 className="font-semibold truncate group-hover:whitespace-normal text-gray-300 text-center">
        {name}
      </h3>
      <p className="text-sm text-gray-400 truncate group-hover:whitespace-normal text-center">
        Artist
      </p>
    </div>
  );

  const AlbumCard = ({ album, image, artist }: { album: string; image: string; artist: string }) => (
    <div
      className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer card-starlight"
      onClick={() => {
        if (album === 'We Rollin') {
          fetchWeRollinSong();
        } else if (album === 'Glory') {
          playGlorySong(); // Add handler for Glory album
        } else {
          console.log(`Play songs from album ${album}`);
        }
      }}
    >
      <div className="relative">
        <img
          src={image}
          alt={album}
          className="w-full aspect-square object-cover rounded-md mb-4"
        />
        <button
          className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            if (album === 'We Rollin') {
              fetchWeRollinSong();
            } else if (album === 'Glory') {
              playGlorySong(); // Add handler for Glory album
            } else {
              console.log(`Play songs from album ${album}`);
            }
          }}
        >
          <Play fill="white" size={16} />
        </button>
      </div>
      <h3 className="font-semibold truncate group-hover:whitespace-normal text-gray-300">
        {album}
      </h3>
      <p className="text-sm text-gray-400 truncate group-hover:whitespace-normal">
        {artist}
      </p>
    </div>
  );

  const PlaylistCard = ({ playlist, image, description }: { playlist: string; image: string; description: string }) => (
    <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer card-starlight">
      <div className="relative">
        <img
          src={image}
          alt={playlist}
          className="w-full aspect-square object-cover rounded-md mb-4"
        />
        <button
          className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            console.log(`Play playlist ${playlist}`);
          }}
        >
          <Play fill="white" size={16} />
        </button>
      </div>
      <h3 className="font-semibold truncate group-hover:whitespace-normal text-gray-300">
        {playlist}
      </h3>
      <p className="text-sm text-gray-400 truncate group-hover:whitespace-normal">
        {description}
      </p>
    </div>
  );

  return (
    <div className="p-5 mt-6"> {/* Reduced mt-16 to mt-12 */}
      {showWelcome && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
          😊 Welcome back!
        </div>
      )}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Trending Songs</h2> {/* Updated section title */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
          <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl card-starlight">
            <div className="relative">
              <img src="public/images/reel.png" alt="Placeholder" className="w-full aspect-square object-cover rounded-md mb-4" />
              <button
                className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  console.log('Play Reel');
                }}
              >
                <Play fill="white" size={16} />
              </button>
            </div>
            <h3 className="font-semibold truncate text-gray-300">Reel</h3>
            <p className="text-sm text-gray-400 truncate">Hanumankind</p>
          </div>
          <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl card-starlight">
            <div className="relative">
              <img src="public/images/aao.png" alt="Placeholder" className="w-full aspect-square object-cover rounded-md mb-4" />
              <button
                className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  console.log('Play Aaho Raja');
                }}
              >
                <Play fill="white" size={16} />
              </button>
            </div>
            <h3 className="font-semibold truncate text-gray-300">Aaho Raja</h3>
            <p className="text-sm text-gray-400 truncate">Pawan Singh</p>
          </div>
          <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl card-starlight">
            <div className="relative">
              <img src="public/images/maniac.png" alt="Placeholder" className="w-full aspect-square object-cover rounded-md mb-4" />
              <button
                className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  console.log('Play Maniac');
                }}
              >
                <Play fill="white" size={16} />
              </button>
            </div>
            <h3 className="font-semibold truncate text-gray-300">Maniac</h3>
            <p className="text-sm text-gray-400 truncate">Yo Yo Honey Singh</p>
          </div>
          <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl card-starlight">
            <div className="relative">
              <img src="public/images/mix.png" alt="Placeholder" className="w-full aspect-square object-cover rounded-md mb-4" />
              <button
                className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  console.log('Play Pahin Ke Cahli Bikani');
                }}
              >
                <Play fill="white" size={16} />
              </button>
            </div>
            <h3 className="font-semibold truncate text-gray-300">Pahin Ke Cahli Bikani</h3>
            <p className="text-sm text-gray-400 truncate">Hanumankind</p>
          </div>
          <div className="group relative bg-black p-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl card-starlight">
            <div className="relative">
              <img src="public/images/od.png" alt="Placeholder" className="w-full aspect-square object-cover rounded-md mb-4" />
              <button
                className="absolute bottom-2 right-2 p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  console.log('Play Babu Sona Jaan');
                }}
              >
                <Play fill="white" size={16} />
              </button>
            </div>
            <h3 className="font-semibold truncate text-gray-300">Babu Sona Jaan</h3>
            <p className="text-sm text-gray-400 truncate">Humane Sagar & Aseema Panda</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AlbumCard album="We Rollin" image="/images/shubh.jpeg" artist="Shubh" />
          <AlbumCard album="Glory" image="public/images/glory.png" artist="Yo Yo Honey Singh" />
          <AlbumCard album="Sanam Teri Kasam" image="public/images/sanam.png" artist="Ankit Tiwari and Palak Muchhal" />
          <AlbumCard album="Pawan Singh Album" image="public/images/pawan.png" artist="Pawan Singh" />
          <AlbumCard album="ONE" image="public/images/badshah.png" artist="Badshah" />
        </div>
      </section>

      {showWeRollinSongs && ( // Display "We Rollin" songs
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">We Rollin - Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {weRollinSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2> {/* Updated section title */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
          <PlaylistCard playlist="Glory" image="public/images/glory.png" description="Yo Yo Honey Singh" />
          <PlaylistCard playlist="Pawan Singh Album" image="public/images/pawan.png" description="Pawan Singh" />
          <PlaylistCard playlist="Goat" image="public/images/diljit.png" description="Diljit Dosanjh" />
        </div>
      </section>

      <div className="my-8"></div> {/* Added spacing between sections */}

      <section>
        <h2 className="text-2xl font-bold mb-4">Popular Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ArtistCard name="Yo Yo Honey Singh" image="public/images/image.jpeg" />
          <ArtistCard name="Ap Dhillon" image="public/images/ap.png" />
          <ArtistCard name="Arijit Singh" image="public/images/arijit.png" />
          <ArtistCard name="Sidhu Moose Wala" image="public/images/sidhu.png" />
          <ArtistCard name="Shubh" image="public/images/shubh1.png" />
        </div>
      </section>
    </div>
  );
};

export default Home;
