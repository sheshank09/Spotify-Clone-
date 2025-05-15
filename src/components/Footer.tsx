import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react'; // Import icons

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 py-8">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 gap-4"> {/* Reduced gap */}
        <div>
          <h3 className="text-white font-bold mb-4">Company</h3>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:underline">About</a></li>
            <li><a href="#jobs" className="hover:underline">Jobs</a></li>
            <li><a href="#record" className="hover:underline">For the Record</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Communities</h3>
          <ul className="space-y-2">
            <li><a href="#artists" className="hover:underline">For Artists</a></li>
            <li><a href="#developers" className="hover:underline">Developers</a></li>
            <li><a href="#advertising" className="hover:underline">Advertising</a></li>
            <li><a href="#investors" className="hover:underline">Investors</a></li>
            <li><a href="#vendors" className="hover:underline">Vendors</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Useful Links</h3>
          <ul className="space-y-2">
            <li><a href="#support" className="hover:underline">Support</a></li>
            <li><a href="#mobile" className="hover:underline">Free Mobile App</a></li>
          </ul>
          <div className="flex space-x-4 mt-4"> {/* Added icons next to Useful Links */}
            <a href="#instagram" className="hover:text-white">
              <Instagram size={20} />
            </a>
            <a href="#twitter" className="hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="#facebook" className="hover:text-white">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
