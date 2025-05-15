-- /*
--   # Initial Schema Setup for Spotify Clone

--   1. Tables
--     - songs
--       - Stores song metadata and URLs
--     - playlists
--       - User-created playlists
--     - playlist_songs
--       - Junction table for playlist-song relationships
--     - liked_songs
--       - Tracks user's liked/favorited songs
--     - users
--       - Stores user details

--   2. Security
--     - RLS policies for all tables
--     - Authenticated users can:
--       - Read all songs
--       - Create and manage their own playlists
--       - Like/unlike songs
--       - Manage their own user data
-- */

-- -- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  duration INTEGER NOT NULL,
  cover_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- -- Create liked_songs table
CREATE TABLE IF NOT EXISTS liked_songs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

-- -- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -- Remove unique constraint on email
-- ALTER TABLE users DROP CONSTRAINT unique_email;

-- -- Remove NOT NULL constraints
-- ALTER TABLE songs
-- ALTER COLUMN title DROP NOT NULL,
-- ALTER COLUMN artist DROP NOT NULL,
-- ALTER COLUMN album DROP NOT NULL,
-- ALTER COLUMN cover_url DROP NOT NULL,
-- ALTER COLUMN audio_url DROP NOT NULL;

-- ALTER TABLE playlists
-- ALTER COLUMN name DROP NOT NULL,
-- ALTER COLUMN user_id DROP NOT NULL;

-- -- Remove foreign key constraints
-- ALTER TABLE liked_songs
-- DROP CONSTRAINT fk_user_id,
-- DROP CONSTRAINT fk_song_id;

-- ALTER TABLE playlist_songs
-- DROP CONSTRAINT fk_playlist_id,
-- DROP CONSTRAINT fk_song_id;

-- -- Remove triggers
-- DROP TRIGGER IF EXISTS set_updated_at ON songs;
-- DROP TRIGGER IF EXISTS set_updated_at ON playlists;

-- -- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- -- RLS Policies
-- CREATE POLICY "Songs are viewable by everyone"
--   ON songs FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Users can create and manage their playlists"
--   ON playlists FOR ALL
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can manage songs in their playlists"
--   ON playlist_songs FOR ALL
--   TO authenticated
--   USING (
--     playlist_id IN (
--       SELECT id FROM playlists WHERE user_id = auth.uid()
--     )
--   )
--   WITH CHECK (
--     playlist_id IN (
--       SELECT id FROM playlists WHERE user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can manage their liked songs"
--   ON liked_songs FOR ALL
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Authenticated users can manage their own data"
--   ON users FOR ALL
--   TO authenticated
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read/write their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -- Trigger for songs table
-- CREATE OR REPLACE FUNCTION update_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Add seed data for Yo Yo Honey Singh
-- INSERT INTO songs (title, artist, album, duration, cover_url, audio_url) VALUES
-- ('Blue Eyes', 'Yo Yo Honey Singh', 'International Villager', 240, 'https://images.unsplash.com/photo-1516280440429-4c0b674d1e4f?w=500', 'https://example.com/blue-eyes.mp3'),
-- ('Brown Rang', 'Yo Yo Honey Singh', 'International Villager', 234, 'https://images.unsplash.com/photo-1516280440429-4c0b674d1e4f?w=500', 'https://example.com/brown-rang.mp3'),
-- ('Desi Kalakaar', 'Yo Yo Honey Singh', 'Desi Kalakaar', 255, 'https://images.unsplash.com/photo-1516280440429-4c0b674d1e4f?w=500', 'https://example.com/desi-kalakaar.mp3'),
-- ('Love Dose', 'Yo Yo Honey Singh', 'Desi Kalakaar', 228, 'https://images.unsplash.com/photo-1516280440429-4c0b674d1e4f?w=500', 'https://example.com/love-dose.mp3'),
-- ('We Rollin', 'Shubh', 'We Rollin', 189, '/images/shubh.jpeg', '/Songs/We Rollin.mp3');

-- Add likes and playCount columns to songs table
ALTER TABLE songs
DROP COLUMN likes,
ADD COLUMN likes integer DEFAULT NULL,
ADD COLUMN playCount integer DEFAULT 0;

-- Create RLS policies
CREATE POLICY "Public songs are viewable by everyone" 
  ON songs FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their playlists" 
  ON playlists 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their playlist songs" 
  ON playlist_songs 
  FOR ALL 
  USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their liked songs" 
  ON liked_songs 
  FOR ALL 
  USING (user_id = auth.uid());

-- Drop existing liked_songs table if exists
DROP TABLE IF EXISTS liked_songs;

-- Recreate liked_songs table with proper constraints
CREATE TABLE liked_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- Enable RLS
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for liked_songs
CREATE POLICY "Enable read access for users" ON liked_songs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users" ON liked_songs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users" ON liked_songs
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some test data (optional)
INSERT INTO songs (id, title, artist, album, duration, cover_url, audio_url, likes) VALUES
    ('test-song-1', 'Test Song 1', 'Test Artist', 'Test Album', 180, '/images/test1.jpg', '/songs/test1.mp3', 0),
    ('test-song-2', 'Test Song 2', 'Test Artist', 'Test Album', 200, '/images/test2.jpg', '/songs/test2.mp3', 0)
ON CONFLICT DO NOTHING;

-- Add Honey Singh songs to the database
INSERT INTO songs (id, title, artist, album, duration, cover_url, audio_url, likes, created_at) 
VALUES 
    ('blue-eyes', 'Blue Eyes', 'Yo Yo Honey Singh', 'International Villager', 240, 'public/images/image.jpeg', 'Songs/Blue Eyes Yo Yo Honey Singh 128 Kbps.mp3', 0, NOW()),
    ('brown-rang', 'Brown Rang', 'Yo Yo Honey Singh', 'International Villager', 234, 'public/images/image.jpeg', 'Songs/Brown Rang International Villager 128 Kbps.mp3', 0, NOW()),
    ('desi-kalakaar', 'Desi Kalakaar', 'Yo Yo Honey Singh', 'Desi Kalakaar', 255, 'public/images/image.jpeg', 'Songs/Desi Kalakaar Yo Yo Honey Singh 128 Kbps.mp3', 0, NOW()),
    ('love-dose', 'Love Dose', 'Yo Yo Honey Singh', 'Desi Kalakaar', 228, 'public/images/image.jpeg', 'Songs/Love Dose Desi Kalakaar 128 Kbps.mp3', 0, NOW()),
    ('millionaire', 'Millionaire', 'Yo Yo Honey Singh', 'Glory', 240, 'public/images/glory.png', 'Songs/Millionaire - Glory 320 Kbps.mp3', 0, NOW())
ON CONFLICT (id) DO UPDATE 
SET 
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    album = EXCLUDED.album,
    duration = EXCLUDED.duration,
    cover_url = EXCLUDED.cover_url,
    audio_url = EXCLUDED.audio_url;

-- Add user profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add email verification requirement
ALTER TABLE auth.users 
  ADD CONSTRAINT email_verified 
  CHECK (email_confirmed_at IS NOT NULL)
  NOT VALID; -- Add NOT VALID to prevent issues with existing users

-- Enable RLS on all tables
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Playlist policies
CREATE POLICY "Users can manage own playlists" ON public.playlists
  FOR ALL USING (auth.uid() = user_id);

-- Add policies for playlist management
CREATE POLICY "Enable all access for playlist owners"
ON playlists
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure playlist songs can be added by playlist owners
CREATE POLICY "Enable playlist song management for owners"
ON playlist_songs
FOR ALL
USING (
  playlist_id IN (
    SELECT id FROM playlists
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  playlist_id IN (
    SELECT id FROM playlists
    WHERE user_id = auth.uid()
  )
);

-- Songs policies  
CREATE POLICY "Anyone can view songs" ON public.songs
  FOR SELECT USING (true);

-- Playlist songs policies
CREATE POLICY "Users can manage songs in own playlists" ON public.playlist_songs
  FOR ALL USING (
    playlist_id IN (
      SELECT id FROM public.playlists WHERE user_id = auth.uid()
    )
  );

-- Liked songs policies  
CREATE POLICY "Users can manage own liked songs" ON public.liked_songs
  FOR ALL USING (user_id = auth.uid());

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Users can manage own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Enable all access for playlist owners" ON public.playlists;
DROP POLICY IF EXISTS "Users can manage their playlists" ON playlists;

-- Create single comprehensive playlist policy
CREATE POLICY "Users can manage their own playlists"
ON public.playlists
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly allow INSERT on playlists
CREATE POLICY "Users can create playlists"
ON public.playlists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);