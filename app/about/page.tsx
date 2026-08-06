'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="container mx-auto px-6 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-12 text-center"
        >
          About TwinForge
        </motion.h1>

        <div className="max-w-3xl mx-auto space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            TwinForge is a premium 3D printing service based in Oman, specializing in custom, hand-finished products with precision engineering and artisan craftsmanship.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            We use safe PLA plastic and build every product to order, ensuring quality and customization for each customer.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
