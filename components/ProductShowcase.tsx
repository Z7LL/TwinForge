'use client';

import { motion } from 'framer-motion';

const products = [
  { name: 'Butterfly Knife', price: '15 OMR', image: '/products/butterfly-knife.jpg' },
  { name: 'Custom Keycaps', price: '8 OMR', image: '/products/keycaps.jpg' },
  { name: 'Phone Stand', price: '5 OMR', image: '/products/phone-stand.jpg' }
];

export default function ProductShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          Featured Products
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-600/50 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  Product Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <div className="text-orange-600 font-mono text-lg">{product.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
