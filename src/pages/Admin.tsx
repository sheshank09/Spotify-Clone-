import React, { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Song } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const Admin = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    cover_url: '',
    audio_url: '',
    duration: 0,
  });
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSongs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('songs')
      .insert([{
        ...formData,
        duration: parseInt(formData.duration.toString(), 10) || 0,
      }]);

    if (!error) {
      setFormData({
        title: '',
        artist: '',
        album: '',
        cover_url: '',
        audio_url: '',
        duration: 0,
      });
      fetchSongs();
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchSongs();
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Please log in to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Add New Song</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Artist</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Album</label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Cover URL</label>
              <input
                type="url"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Audio URL</label>
              <input
                type="url"
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Song'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Manage Songs</h3>
          <div className="space-y-2">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 bg-gray-900 rounded"
              >
                <div className="flex items-center space-x-3">
                  <img src={song.cover_url} alt={song.title} className="w-12 h-12 rounded" />
                  <div>
                    <h4 className="font-medium">{song.title}</h4>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                    <p className="text-xs text-gray-500">
                      {song.likes || 0} likes • {song.playCount || 0} plays
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="p-2 text-red-500 hover:bg-gray-800 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;