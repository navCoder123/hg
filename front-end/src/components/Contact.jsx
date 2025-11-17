import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  return (
    <section
      id="contact"
      className="py-20 bg-black text-white flex flex-col items-center justify-center px-6"
    >
      {/* Section Header */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        viewport={{ once: true }}
      >
        Contact Us
      </motion.h2>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Address Card */}
        <motion.div
          className="bg-neutral-900 border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] p-8 flex flex-col items-center text-center hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-shadow duration-300"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, type: 'spring', delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full mb-4">
            <MapPin className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Address</h3>
          <p className="text-gray-400">
            123 Bypass Road, Gangtok, Sikkim 737101
          </p>
        </motion.div>

        {/* Email Card */}
        <motion.div
          className="bg-neutral-900 border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] p-8 flex flex-col items-center text-center hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-shadow duration-300"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, type: 'spring', delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
          <p className="text-gray-400">contact@hallaghar.com</p>
        </motion.div>

        {/* Phone Card */}
        <motion.div
          className="bg-neutral-900 border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] p-8 flex flex-col items-center text-center hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-shadow duration-300"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, type: 'spring', delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full mb-4">
            <Phone className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
          <p className="text-gray-400">+91 98765 43210</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
