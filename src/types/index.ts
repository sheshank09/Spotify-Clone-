export interface User {
  id: string;
  email: string;
  full_name: string; // Add full_name field
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover_url: string;
  audio_url: string;
  created_at: string;
  likes: number; // Number of likes
  playCount: number; // Number of times the song has been played
  isLiked?: boolean; // Add this property
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  songs?: Song[]; // Made optional
}