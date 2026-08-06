'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  { number: '01', title: 'Design', description: 'CAD modeling with precision tolerances' },
  { number: '02', title: 'Slice', description: 'Optimized print paths for strength' },
  { number: '03', title: 'Print', description: 'Layer-by-layer fabrication' },
  { number: '04', title: 'Support Removal', description: 'Careful support extraction' },
  { number: '05', title: 'Finishing', description: 'Sanding and smoothing' },
  { number: '06', title: 'QA', description: 'Final inspection and testing' }
];

export default function ForgeProcess() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="py-24 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          The Forge Process
        </motion.h2>

        {/* Progress Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 hidden md:block">
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="w-full bg-gradient-to-b from-orange-600 to-amber-500"
          />
        </div>

        <div className="space-y-12 md:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="text-6xl font-bold text-orange-600 font-mono mb-4">{step.number}</div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-orange-500/25">
                {step.number}
              </div>

              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
