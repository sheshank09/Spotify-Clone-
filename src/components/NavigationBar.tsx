import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Home as HomeIcon, Globe as BrowseIcon, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; // Add this import

const NavigationBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true); // State for dark mode
  const navigate = useNavigate(); // Initialize useNavigate

  const { user } = useAuthStore(); // Add this line to get user state

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (searchQuery.trim().toLowerCase() === 'yo yo honey singh') {
        navigate(`/search?artist=Yo%20Yo%20Honey%20Singh`); // Navigate to search page with Yo Yo Honey Singh's query
      } else {
        navigate(`/search?artist=${encodeURIComponent(searchQuery.trim())}`); // Navigate to search page with artist query
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode); // Toggle dark mode class
    const root = document.documentElement;
    if (!darkMode) {
      root.style.setProperty('--nav-bg-color', '#87CEEB'); // Sky color
      root.style.setProperty('--sidebar-bg-color', '#87CEEB'); // Sky color
      root.style.setProperty('--main-bg-color', '#ffffff'); // White
      root.style.setProperty('--text-color', '#000000'); // Black text
    } else {
      root.style.setProperty('--nav-bg-color', '#1a202c'); // Default dark color
      root.style.setProperty('--sidebar-bg-color', '#1a202c'); // Default dark color
      root.style.setProperty('--main-bg-color', '#000000'); // Black
      root.style.setProperty('--text-color', '#ffffff'); // White text
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50"
      style={{
        backgroundColor: 'var(--nav-bg-color, #1a202c)',
      }}
    >
      <div className="flex items-center space-x-6 nav-text">
      <Link to="/" className="text-3xl font-bold text-green-500 hover:text-white transition-colors duration-200">
        Muski
        </Link>

        <div className="relative group">
          <Link to="/" className="hover:text-green-500">
            <HomeIcon size={20} />
          </Link>
          <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Home
          </span>
        </div>
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
            onClick={handleSearch} // Trigger search on icon click
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Trigger search on Enter key
            placeholder="Search for songs, artists, or albums"
            className="pl-10 pr-10 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 w-72"
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 group"
            onClick={() => console.log('Browse button clicked')}
          >
            <BrowseIcon size={20} />
            <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Browse
            </span>
          </button>
        </div>
        <a href="#premium" className="hover:text-green-500">Upgrade</a>
        <a href="#support" className="hover:text-green-500">Support</a>
        <a href="#download" className="hover:text-green-500">Download</a>
      </div>
      <div className="flex items-center space-x-2 nav-text">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition relative group"
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {darkMode ? 'Dark ' : 'Light '}
          </span>
        </button>
        
        {!user ? (
          <>
            <Link to="/auth" className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Log In
            </Link>
            <Link to="/auth?signup=true" className="px-4 py-2 rounded-full text-white hover:bg-white hover:text-black transition">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="px-4 py-2 text-sm text-white">
            {user.email?.split('@')[0]} {/* Display just the username part of the email */}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
