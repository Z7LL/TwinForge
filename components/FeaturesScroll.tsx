'use client';

import { useEffect, useRef, useState } from 'react';
import { Boxes, Cpu, Gauge, Eye, Scale, Hand } from 'lucide-react';

const FEATURES = [
  {
    icon: Boxes,
    label: 'Modular by Design',
    desc: 'Mix handles, blades, weights, and finishes. Every part is swappable and re-orderable — build something genuinely yours.',
    tag: '01',
  },
  {
    icon: Cpu,
    label: 'CAD-Precise',
    desc: 'Tolerances measured in tenths of a millimeter. Screws seat flush. Blades balance true. Every digital model verified before the first layer is printed.',
    tag: '02',
  },
  {
    icon: Hand,
    label: 'Made for Your Hand',
    desc: 'Ergonomic grips tuned for flipping, EDC, and display. Shape and weight tailored to your personal taste and grip style.',
    tag: '03',
  },
  {
    icon: Gauge,
    label: 'Tune the Feel',
    desc: 'Light, standard, or heavy weights shift the balance point and momentum. Fine-tune the flip exactly how you like it.',
    tag: '04',
  },
  {
    icon: Eye,
    label: 'Studio-Grade Finish',
    desc: 'Matte, brushed, black oxide, or orange-accent edges. Each finish hand-applied and inspected under direct light.',
    tag: '05',
  },
  {
    icon: Scale,
    label: 'Balanced & Tested',
    desc: 'Every unit is flipped, flipped again, and checked for mechanical play before it leaves the bench. No compromises.',
    tag: '06',
  },
];

export function FeaturesScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0→1 as user scrolls through
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress: 0 when top of section is at bottom of viewport, 1 when section scrolled past
      const raw = (viewH - rect.top) / (rect.height + viewH);
      const clamped = Math.max(0, Math.min(1, raw));
      setProgress(clamped);
      // active feature index: split progress across features
      const idx = Math.min(FEATURES.length - 1, Math.floor(clamped * FEATURES.length * 1.1));
      setActiveIndex(Math.max(0, idx));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Illoca-style: panel expands upward from a closed bar, left/right text wings slide in
  // scaleY: 0.06 → 1 as progress goes 0 → 0.15
  const panelScale = Math.min(1, progress / 0.15);
  // Left/right panel width: 0 → 100% as progress 0.1 → 0.35
  const wingProgress = Math.max(0, Math.min(1, (progress - 0.1) / 0.25));
  // Text fade in after wings open
  const textOpacity = Math.max(0, Math.min(1, (progress - 0.28) / 0.1));

  return (
    <section
      ref={containerRef}
      className="features-scroll-section"
      id="features"
    >
      {/* Sticky animation wrapper */}
      <div className="features-sticky">
        {/* Background decorative floating tag texts */}
        <div
          className="features-bg-tags"
          style={{
            opacity: Math.min(0.07, progress * 0.5),
            transform: `translateY(${(1 - panelScale) * 30}px)`,
          }}
        >
          {['CUSTOM', 'FORGE', 'MODULAR', 'PRECISE', 'BALANCE', 'FINISH', 'TUNE', 'MADE IN OMAN'].map((t, i) => (
            <span
              key={t}
              className="features-bg-tag"
              style={{
                fontSize: `${1.5 + (i % 3) * 0.8}rem`,
                top: `${10 + (i * 11) % 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                transform: `rotate(${-15 + (i * 7) % 30}deg)`,
                color: i % 3 === 1 ? '#A94732' : '#111',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Main expanding panel */}
        <div
          className="features-panel"
          style={{
            transform: `scaleY(${0.06 + panelScale * 0.94})`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Left wing — slides in from left */}
          <div
            className="features-wing features-wing-left"
            style={{
              clipPath: `inset(0 ${100 - wingProgress * 100}% 0 0)`,
              transition: 'clip-path 0.05s linear',
            }}
          >
            <div className="features-wing-inner" style={{ opacity: textOpacity }}>
              {FEATURES.slice(0, 3).map((feat, i) => (
                <div
                  key={feat.tag}
                  className={`feature-item ${
                    activeIndex === i ? 'feature-item--active' : ''
                  }`}
                  style={{
                    transform: `translateY(${
                      activeIndex === i ? 0 : activeIndex > i ? -8 : 12
                    }px)`,
                    opacity: textOpacity * (activeIndex >= i ? 1 : 0.3),
                    transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease',
                    transitionDelay: `${i * 0.06}s`,
                  }}
                >
                  <div className="feature-tag">{feat.tag}</div>
                  <div className="feature-label">{feat.label}</div>
                  <p className="feature-desc">{feat.desc}</p>
                  <div
                    className="feature-bar"
                    style={{
                      width: activeIndex === i ? '100%' : activeIndex > i ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Center — sun/circle icon + active label */}
          <div
            className="features-center"
            style={{ opacity: Math.min(1, panelScale * 2) }}
          >
            <div
              className="features-sun"
              style={{
                transform: `scale(${0.5 + panelScale * 0.5}) rotate(${progress * 120}deg)`,
              }}
            >
              <svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true">
                {/* Sun rays */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i / 16) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 100 + Math.cos(rad) * 68;
                  const y1 = 100 + Math.sin(rad) * 68;
                  const x2 = 100 + Math.cos(rad) * 88;
                  const y2 = 100 + Math.sin(rad) * 88;
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#111"
                      strokeWidth={i % 2 === 0 ? 2 : 1}
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Outer circle */}
                <circle cx="100" cy="100" r="60" fill="#FFF1C7" stroke="#111" strokeWidth="2" />
                {/* Inner details */}
                <circle cx="100" cy="100" r="40" fill="none" stroke="#A94732" strokeWidth="1" strokeDasharray="4 3" />
                <circle cx="100" cy="100" r="22" fill="#F9733E" stroke="#111" strokeWidth="2" />
                <text
                  x="100" y="106"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="'Archivo', sans-serif"
                  fill="#fff"
                  letterSpacing="1"
                >
                  FORGE
                </text>
              </svg>
            </div>
            <div
              className="features-active-label"
              style={{ opacity: textOpacity }}
            >
              <span
                key={activeIndex}
                className="features-active-name"
              >
                {FEATURES[activeIndex]?.label}
              </span>
              <div className="features-dots">
                {FEATURES.map((_, i) => (
                  <div
                    key={i}
                    className={`features-dot ${
                      i === activeIndex ? 'features-dot--active' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right wing — slides in from right */}
          <div
            className="features-wing features-wing-right"
            style={{
              clipPath: `inset(0 0 0 ${100 - wingProgress * 100}%)`,
              transition: 'clip-path 0.05s linear',
            }}
          >
            <div className="features-wing-inner" style={{ opacity: textOpacity }}>
              {FEATURES.slice(3).map((feat, i) => (
                <div
                  key={feat.tag}
                  className={`feature-item ${
                    activeIndex === i + 3 ? 'feature-item--active' : ''
                  }`}
                  style={{
                    transform: `translateY(${
                      activeIndex === i + 3 ? 0 : activeIndex > i + 3 ? -8 : 12
                    }px)`,
                    opacity: textOpacity * (activeIndex >= i + 3 ? 1 : 0.3),
                    transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease',
                    transitionDelay: `${i * 0.06}s`,
                  }}
                >
                  <div className="feature-tag">{feat.tag}</div>
                  <div className="feature-label">{feat.label}</div>
                  <p className="feature-desc">{feat.desc}</p>
                  <div
                    className="feature-bar"
                    style={{
                      width: activeIndex === i + 3 ? '100%' : activeIndex > i + 3 ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section label — visible before panel opens */}
        <div
          className="features-teaser"
          style={{ opacity: Math.max(0, 1 - panelScale * 4), pointerEvents: 'none' }}
        >
          <span className="features-teaser-label">SCROLL TO EXPLORE FEATURES</span>
          <div className="features-teaser-line" />
        </div>
      </div>
    </section>
  );
}
