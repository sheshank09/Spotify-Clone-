import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer'; // Import Footer component
import { useAuthStore } from './store/useAuthStore'; // Import AuthStore

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user } = useAuthStore(); // Access user state
  const [stars, setStars] = useState<{ x: number; y: number; offsetX: number; offsetY: number }[]>([]);

  useEffect(() => {
    if (user) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 3000); // Hide popup after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      setShowWelcome(false); // Ensure popup doesn't show when user is null
    }
  }, [user]); // Trigger only when user state changes

  useEffect(() => {
    const generateStars = () => {
      const starCount = 100; // Increase the number of stars for better visibility
      const newStars = Array.from({ length: starCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        offsetX: 0,
        offsetY: 0,
      }));
      setStars(newStars);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const radius = 150; // Radius within which stars will move
      setStars((prevStars) =>
        prevStars.map((star) => {
          const distance = Math.hypot(clientX - star.x, clientY - star.y);
          if (distance < radius) {
            const factor = (radius - distance) / radius; // Closer stars move more
            return {
              ...star,
              offsetX: (clientX - star.x) * 0.05 * factor,
              offsetY: (clientY - star.y) * 0.05 * factor,
            };
          }
          return { ...star, offsetX: 0, offsetY: 0 }; // Reset offset for stars outside the radius
        })
      );
    };

    generateStars();
    window.addEventListener('resize', generateStars);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', generateStars);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Router>
      <div
        className="flex flex-col h-screen"
        style={{ color: 'var(--text-color, #ffffff)' }}
      >
        <NavigationBar />
        <div className="flex flex-1">
          <Sidebar className="w-64 h-full fixed" /> {/* Sidebar fixed */}
          <main
            className="main-content flex-1 ml-64 mt-16 p-4 overflow-y-auto"
            style={{ backgroundColor: 'var(--main-bg-color, rgba(0, 0, 0, 0.9))' }}
          >
            <div className="constellation">
              {stars.map((star, index) => (
                <div
                  key={index}
                  className="star"
                  style={{
                    left: `${star.x + star.offsetX}px`,
                    top: `${star.y + star.offsetY}px`,
                  }}
                ></div>
              ))}
              {stars.map((star, index) =>
                index < stars.length - 1 ? (
                  <div
                    key={`line-${index}`}
                    className="line"
                    style={{
                      left: `${star.x + star.offsetX}px`,
                      top: `${star.y + star.offsetY}px`,
                      width: `${Math.hypot(
                        stars[index + 1].x - star.x,
                        stars[index + 1].y - star.y
                      )}px`,
                      transform: `rotate(${Math.atan2(
                        stars[index + 1].y - star.y,
                        stars[index + 1].x - star.x
                      )}rad)`,
                    }}
                  ></div>
                ) : null
              )}
            </div>
            <Routes>
              <Route path="/" element={<Home showWelcome={showWelcome} />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            <Footer /> {/* Add Footer component */}
            <footer className="mt-8 text-center text-gray-400">
              © 2023 Musicify. All rights reserved.
            </footer>
          </main>
        </div>
        <Player />
      </div>
    </Router>
  );
}

export default App;