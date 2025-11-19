import React from "react";
import { motion } from "framer-motion";
import sampleImage from "../assets/hglogo2.jpg";
import { useState } from "react";

const About = () => {

  const [openModal, setOpenModal] = useState(false)

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
              <button
                onClick={() => setOpenModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition text-white px-6 py-3 rounded-full font-semibold shadow-lg">
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
      {openModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-40"
          onClick={() => setOpenModal(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="bg-black/80 border border-purple-500/50 rounded-2xl 
            max-w-lg w-full p-8 mx-4 shadow-[0_0_30px_rgba(168,85,247,0.6)]
            backdrop-blur-xl"
          >
            <h2 className="text-3xl font-bold mb-4 
              bg-gradient-to-r from-purple-300 to-cyan-300 
              bg-clip-text text-transparent">
              More About Our Event
            </h2>

            <p className="text-gray-300 leading-relaxed mb-6">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A nostrum, aliquam nemo, debitis et beatae suscipit inventore eius ipsum molestias tempore cum accusamus dicta nulla? Quis maxime delectus quaerat eligendi?
            </p>

            <button
              onClick={() => setOpenModal(false)}
              className="mt-4 px-6 py-2 rounded-full 
              text-white border border-purple-400 hover:bg-purple-600/30 transition
              shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default About;
