import React, { useEffect, useState } from 'react';
import { Plus, Play, Heart, Music, HeadphonesIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Playlist, Song } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';

const Library = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { user } = useAuthStore();
  const { play } = usePlayerStore();
  const [selectedSection, setSelectedSection] = useState<'playlists' | 'liked'>('playlists');
  const [isLikedSongsExpanded, setIsLikedSongsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchLikedSongs();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*, songs:playlist_songs(song:songs(*))')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching playlists:', error);
        return;
      }

      if (data) {
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Error in fetchPlaylists:', error);
    }
  };

  const fetchLikedSongs = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          liked_songs!inner(*)
        `)
        .eq('liked_songs.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked songs:', error);
        return;
      }

      if (data) {
        setLikedSongs(data.map(song => ({
          ...song,
          isLiked: true
        })));
      }
    } catch (error) {
      console.error('Error in fetchLikedSongs:', error);
    }
  };

  const handleUnlike = async (songId: string) => {
    if (!user) return;

    try {
      // Remove from liked_songs table
      await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId);

      // Update likes count in songs table
      const { data: song } = await supabase
        .from('songs')
        .select('likes')
        .eq('id', songId)
        .single();

      if (song) {
        await supabase
          .from('songs')
          .update({ likes: Math.max(0, (song.likes || 1) - 1) })
          .eq('id', songId);
      }

      // Refresh liked songs list
      fetchLikedSongs();
    } catch (error) {
      console.error('Error unliking song:', error);
    }
  };

  const createPlaylist = async () => {
    if (!user?.id || !newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      const newPlaylist = {
        name: newPlaylistName.trim(),
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('playlists')
        .insert([newPlaylist])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating playlist:', error);
        alert(error.message);
        return;
      }

      if (data) {
        // Add the new playlist to the existing playlists array
        setPlaylists(prev => [...prev, { ...data, songs: [] }]);
        setNewPlaylistName('');
        setShowCreateModal(false);
        
        // Show success message
        alert('Playlist created successfully!');
      }
    } catch (error) {
      console.error('Error in createPlaylist:', error);
      alert('Failed to create playlist. Please try again.');
    }
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlaylist();
  };

  const renderCreatePlaylistModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-xl">
        <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          createPlaylist();
        }}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="w-full p-3 mb-4 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white"
            required
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={!newPlaylistName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Library</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedSection('playlists')}
            className={`flex items-center px-4 py-2 rounded-full ${
              selectedSection === 'playlists' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <HeadphonesIcon className="mr-2" size={20} />
            Playlists
          </button>
          <button
            onClick={() => setSelectedSection('liked')}
            className={`flex items-center px-4 py-2 rounded-full ${
              selectedSection === 'liked' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Heart className="mr-2" size={20} />
            Liked Songs
          </button>
          {selectedSection === 'playlists' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-full hover:bg-green-600"
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          )}
        </div>
      </div>

      {selectedSection === 'liked' && (
        <div>
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 p-8 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-4xl font-bold mb-2">Liked Songs</h3>
                <p className="text-gray-300">{likedSongs.length} songs</p>
              </div>
              {likedSongs.length > 0 && (
                <button
                  onClick={() => play(likedSongs[0])}
                  className="p-4 bg-green-500 rounded-full hover:bg-green-600 transition-all"
                >
                  <Play fill="white" size={24} />
                </button>
              )}
            </div>
          </div>

          {likedSongs.length > 0 ? (
            <div className="space-y-2">
              {likedSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 w-6">{index + 1}</span>
                    <img src={song.cover_url} alt={song.title} className="w-12 h-12 rounded shadow-md" />
                    <div>
                      <h4 className="font-medium group-hover:text-white">{song.title}</h4>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => play(song)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play size={20} className="text-green-500" />
                    </button>
                    <button
                      onClick={() => handleUnlike(song.id)}
                      className="text-green-500 hover:scale-110 transition-transform"
                    >
                      <Heart size={20} fill="currentColor" />
                    </button>
                    <span className="text-sm text-gray-400">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Songs you like will appear here</h3>
              <p className="text-gray-400">Save songs by tapping the heart icon</p>
            </div>
          )}
        </div>
      )}

      {selectedSection === 'playlists' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-gray-900 p-4 rounded-lg transform transition-transform hover:scale-105 hover:shadow-lg card-starlight">
              <h3 className="font-semibold mb-2">{playlist.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{playlist.songs?.length || 0} songs</p>
              {playlist.songs?.[0] && (
                <button
                  onClick={() => play(playlist.songs[0])}
                  className="p-3 bg-green-500 rounded-full hover:bg-green-600"
                >
                  <Play fill="white" size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && renderCreatePlaylistModal()}
    </div>
  );
};

export default Library;