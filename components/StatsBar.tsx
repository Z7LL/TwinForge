'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
}

function Stat({ value, label, suffix = '' }: StatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-orange-600 font-mono">
        {count}{suffix}
      </div>
      <div className="text-gray-400 text-sm mt-2">{label}</div>
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-950 via-black to-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={100} label="Made in Oman" suffix="%" />
          <Stat value={100} label="Safe PLA Plastic" suffix="%" />
          <Stat value={100} label="Built to Order" suffix="%" />
          <Stat value={24} label="Hour Delivery" suffix="h" />
        </div>
      </div>
    </section>
  );
}
