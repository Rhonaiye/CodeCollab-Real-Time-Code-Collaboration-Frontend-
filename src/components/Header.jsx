import React from 'react';
import Navbar from './Navbar';

const Header = () => {
  return (
    <div className="min-h-screen mb-4 bg-cover bg-center flex flex-col items-center w-full overflow-hidden" style={{ backgroundImage: 'url("/header_img.png")' }}>
      <Navbar />
      <div className="container text-center mx-auto py-4 px-6 md:px-12 lg:px-20 text-white flex-1 flex flex-col justify-center items-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-[82px] font-semibold max-w-3xl leading-tight pt-16 sm:pt-20">Explore homes that fit your dreams</h2>
        <div className="space-x-4 mt-10 sm:mt-16 flex flex-wrap justify-center">
          <a href="#Projects" className="border border-white px-6 py-2 sm:px-8 sm:py-3 rounded hover:py-3 hover:bg-gray-100 hover:text-gray-900 transition duration-300">Projects</a>
          <a href="#Contact" className="bg-blue-600 px-6 py-2 sm:px-8 sm:py-3 rounded hover:bg-blue-500 hover:text-gray-200 hover:py-3 transition duration-300">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default Header;