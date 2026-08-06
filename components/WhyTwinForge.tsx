'use client';

import { motion } from 'framer-motion';
import { Wrench, Package, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Wrench,
    title: 'Precision Engineering',
    description: 'CAD-designed with tolerances down to 0.1mm for perfect fit and function'
  },
  {
    icon: Package,
    title: 'Hand-Finished Quality',
    description: 'Every piece is post-processed, sanded, and inspected before shipping'
  },
  {
    icon: CheckCircle,
    title: 'Built to Last',
    description: 'Engineered for durability with reinforced stress points and premium materials'
  }
];

export default function WhyTwinForge() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Twin Forge</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Where precision engineering meets artisan craftsmanship
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-xl border border-gray-800 hover:border-orange-600/50 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
