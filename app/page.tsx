/* Atelier Flipbook: editorial paper chapters, asymmetric type, and a tactile build story that sends customers into the live configurator. */
'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, CircleDot, Cuboid, PenTool, Sparkles } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { ScrollingSequence } from '@/components/ScrollingSequence';

const principles = [
  ['01', 'Choose the feeling', 'Start with proportion, colour, finish, and balance — not a stock product page.'],
  ['02', 'Watch it take shape', 'Every decision becomes a tangible build in the configurator before it reaches the bench.'],
  ['03', 'Made, not manufactured', 'Small-batch 3D printing, careful finishing, and a final human check in Oman.'],
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="tf-page">
        <div className="tf-paper-grain" aria-hidden="true" />

        <section className="tf-hero" aria-labelledby="hero-title">
          <div className="tf-hero__rail" aria-hidden="true"><span>TF / 26</span><i /><span>MADE IN OMAN</span></div>
          <div className="tf-hero__copy">
            <p className="tf-kicker tf-enter-left"><Sparkles size={13} /> CUSTOM OBJECTS / SMALL BATCH / REAL PEOPLE</p>
            <h1 id="hero-title" className="tf-hero__title">
              <span className="tf-word tf-enter-left">YOUR IDEA,</span>
              <span className="tf-word tf-word--orange tf-enter-right">TUNED</span>
              <span className="tf-word tf-word--outline tf-enter-left">BY HAND.</span>
            </h1>
            <div className="tf-hero__foot tf-enter-right">
              <p>Customizable 3D-printed pieces with a build process you can see, shape, and make your own.</p>
              <Link href="/configurator" className="tf-ink-button">OPEN THE BUILD SHEET <ArrowUpRight size={17} /></Link>
            </div>
          </div>
          <div className="tf-hero__visual tf-enter-right">
            <img src="/assets/editorial/twinforge-hero-atelier.png" alt="TwinForge concept object on a paper workbench" />
            <span className="tf-hero__stamp">ONE OF ONE<br />STARTS HERE</span>
            <span className="tf-hero__scribble" aria-hidden="true">→</span>
          </div>
          <a href="#process" className="tf-scroll-cue" aria-label="Scroll to the TwinForge process"><span>SCROLL TO SHAPE</span><ArrowDown size={16} /></a>
        </section>

        <section className="tf-ticker" aria-label="TwinForge capabilities"><div>DESIGN IT <i>✦</i> TUNE IT <i>✦</i> HOLD IT <i>✦</i> DESIGN IT <i>✦</i> TUNE IT <i>✦</i> HOLD IT <i>✦</i></div></section>

        <section className="tf-intro" id="process">
          <div className="tf-chapter tf-enter-left"><span>CHAPTER 01</span><i /></div>
          <div className="tf-intro__statement">
            <p className="tf-kicker">NOT A CATALOG. A CONVERSATION.</p>
            <h2><span>Bring the rough</span><em>sketch.</em><span>We’ll forge the</span><strong>feeling.</strong></h2>
          </div>
          <aside className="tf-margin-note tf-enter-right"><PenTool size={20} /><p>Colour can change the mood. Weight can change the rhythm. Details are where an object becomes yours.</p></aside>
        </section>

        <section className="tf-sequence-intro">
          <div className="tf-chapter"><span>CHAPTER 02</span><i /></div>
          <div><p className="tf-kicker">THE WORKBENCH WINDOW</p><h2>One scroll.<br /><em>Every decision.</em></h2></div>
          <p className="tf-sequence-intro__copy">Move through the build like a flipbook. The story runs from first line to final object — honest materials, evolving form, nothing hidden behind a generic product card.</p>
        </section>

        <ScrollingSequence fallbackSrc="/assets/editorial/twinforge-build-sheet.png" />

        <section className="tf-principles">
          <div className="tf-principles__image"><img src="/assets/editorial/twinforge-material-swatch.png" alt="TwinForge material and colour study" /></div>
          <div className="tf-principles__content">
            <p className="tf-kicker">THE WAY WE WORK</p>
            <h2>Precision lives<br />in the <em>small stuff.</em></h2>
            <div className="tf-principles__list">
              {principles.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="tf-product-split">
          <div className="tf-product-split__copy">
            <div className="tf-chapter"><span>CHAPTER 03</span><i /></div>
            <h2>Less clicking.<br /><em>More making.</em></h2>
            <p>The TwinForge configurator turns preferences into a clear build: shape, handle texture, colour, hardware, and balance — with a live visual preview and transparent order summary.</p>
            <ul><li><Check size={16} /> Adjustable colours and component options</li><li><Check size={16} /> Live build preview and shareable configuration</li><li><Check size={16} /> Inventory-aware filament choices</li></ul>
            <Link href="/configurator" className="tf-ink-button">MAKE A CUSTOM BUILD <ArrowUpRight size={17} /></Link>
          </div>
          <div className="tf-product-split__image">
            <img src="/assets/editorial/twinforge-forge-detail.png" alt="Precision printing detail at the TwinForge workbench" />
            <span className="tf-product-split__label"><Cuboid size={17} /> BUILD STATUS<br /><strong>YOURS TO TUNE</strong></span>
            <span className="tf-cross tf-cross--a" aria-hidden="true">+</span><span className="tf-cross tf-cross--b" aria-hidden="true">+</span>
          </div>
        </section>

        <section className="tf-close">
          <div className="tf-close__ring" aria-hidden="true"><CircleDot /></div>
          <p className="tf-kicker">TWINFO RGE / CUSTOM OBJECT STUDIO</p>
          <h2>Start with an idea.<br /><em>Leave with your thing.</em></h2>
          <p className="tf-close__copy">Every TwinForge order begins as a personal spec and ends as a made-to-order object, prepared in Oman for the way you use it.</p>
          <div className="tf-close__actions"><Link href="/configurator" className="tf-paper-button">OPEN THE CONFIGURATOR <ArrowUpRight size={17} /></Link><Link href="/shop" className="tf-text-link">VIEW THE SHOP <ArrowUpRight size={15} /></Link></div>
        </section>

        <footer className="tf-footer"><span>© 2026 TWINFORGE</span><span>MADE TO BE <em>YOURS</em></span><Link href="/contact">START A CONVERSATION <ArrowUpRight size={14} /></Link></footer>
      </main>
    </>
  );
}
