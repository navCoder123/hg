import React from "react";
import { motion } from "framer-motion";
import sampleImage from "../assets/hglogo2.jpg";

const About = () => {
  return (
    <section className="bg-black text-white py-20" id="about">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          About Us
        </h1>

        {/* Content */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Text (Left Side) */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col justify-center gap-6 text-center md:text-left"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 70, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-500">
              Exciting Events Await!
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
              Join us for an unforgettable experience filled with amazing events,
              interactive sessions, and incredible moments. Don’t miss the chance
              to be part of something truly special!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                Learn More
              </button>
              <button className="bg-transparent border border-purple-600 hover:bg-purple-600 hover:text-white transition text-purple-500 px-6 py-3 rounded-full font-semibold shadow-lg">
                Register
              </button>
            </div>
          </motion.div>

          {/* Image (Right Side) */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 70, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <img
              src={sampleImage}
              alt="About"
              className="rounded-full border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] w-64 h-64 sm:w-80 sm:h-80 object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
