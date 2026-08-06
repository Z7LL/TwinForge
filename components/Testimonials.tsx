'use client';

import { motion } from 'framer-motion';

const testimonials = [
  { text: "Amazing quality! The precision is incredible.", author: "Ahmed K.", rating: 5 },
  { text: "Best 3D printed products in Oman. Highly recommend!", author: "Sarah M.", rating: 5 },
  { text: "Fast delivery and perfect finish. Will order again!", author: "Mohammed R.", rating: 5 }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 to-black overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          Customer Reviews
        </motion.h2>

        <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="min-w-[300px] bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-xl border border-gray-800 snap-center"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-orange-600 rounded-full" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
              <div className="text-orange-600 font-semibold">{testimonial.author}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
