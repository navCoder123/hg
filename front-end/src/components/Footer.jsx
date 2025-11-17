import React from "react";
import { InstagramIcon, FacebookIcon } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-2xl font-extrabold text-white mb-2">
          Halla <span className="text-purple-500">Entry</span>
        </div>
        <p className="text-gray-400 mb-6">
          Your premier destination for concert tickets.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6">
          <a
            href="#"
            className="text-gray-400 hover:text-purple-500 transition"
          >
            <InstagramIcon color="red" size={40}/>
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-purple-500 transition rounded-b-full"
          >
            <FacebookIcon color="blue" size={40}/>
          </a>
        </div>

        <p className="text-gray-500 text-sm">
          &copy; 2025 Halla Entry. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
