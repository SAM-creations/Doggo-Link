/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

// --- Components ---

const FloatingFlowers = () => {
  const flowers = useMemo(() => {
    const types = ['🌸', '🌼', '🌺', '💐'];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: `${1.5 + Math.random() * 2}rem`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 hidden sm:block">
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute animate-float"
          style={{
            left: f.left,
            top: f.top,
            animationDelay: f.delay,
            animationDuration: f.duration,
            fontSize: f.size,
          }}
        >
          {f.type}
        </div>
      ))}
    </div>
  );
};

// --- Sound Utility ---
const playSound = (type: 'bark' | 'pop' | 'sparkle' | 'transition') => {
  const sounds = {
    bark: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    sparkle: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    transition: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.4;
  audio.play().catch(() => {
    // Ignore errors if browser blocks autoplay
  });
};

const Page1 = ({ onNext }: { onNext: () => void }) => {
  const [step, setStep] = useState(0); // 0: Initial message, 1: Puppy walking, 2: Puppy arrived, 3: Second message
  const [isJumping, setIsJumping] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [barks, setBarks] = useState<number[]>([]);

  useEffect(() => {
    // Initial message pops up first
    const timer = setTimeout(() => {
      setStep(1); // Start puppy walk after 1s
      playSound('transition');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 1) {
      // Slow cartoon walk (8s)
      const timer = setTimeout(() => {
        setStep(2); // Puppy arrived
        playSound('bark');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handlePuppyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step >= 2) {
      const now = Date.now();
      const timeDiff = now - lastClickTime;
      
      // Update click count for dance
      let newCount = 1;
      if (timeDiff < 2000) {
        newCount = clickCount + 1;
      }
      setClickCount(newCount);
      setLastClickTime(now);

      if (newCount >= 3 && !isDancing) {
        setIsDancing(true);
        playSound('sparkle');
        setBarks(prev => [...prev, Date.now()]);
        setTimeout(() => {
          setIsDancing(false);
          setClickCount(0);
        }, 1500);
      } else if (!isDancing) {
        setIsJumping(true);
        setBarks(prev => [...prev, Date.now()]);
        playSound('bark');
        setTimeout(() => setIsJumping(false), 500);
      }
    }
  };

  const handleClick = () => {
    if (step === 2) {
      setStep(3);
      playSound('pop');
    } else if (step === 3) {
      playSound('transition');
      onNext();
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center cursor-pointer select-none"
      onClick={handleClick}
    >
      <div className="relative z-10 w-full max-w-md">
        {/* Puppy Container */}
        <div className={`flex flex-col items-center transition-all duration-1000 ${step === 0 ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
          <div 
            className={`text-8xl sm:text-9xl relative transition-transform 
              ${step === 1 ? 'animate-walk-slow' : ''} 
              ${isDancing ? 'animate-dance' : isJumping ? 'animate-jump' : ''}`}
            onClick={handlePuppyClick}
          >
            <div className={step === 1 ? 'animate-walk-bob animate-bounce-custom' : ''}>
              <div className={step === 1 ? 'animate-sniff-cartoon' : ''}>
                🐕
              </div>
            </div>
            {step >= 2 && (
              <div className={`absolute -right-4 bottom-4 text-4xl origin-left ${isDancing ? 'animate-vigorous-wag' : 'animate-wag'}`}>
                🦴
              </div>
            )}
            {/* Bark Text */}
            {barks.map(id => (
              <div key={id} className="bark-text">{isDancing ? 'Woooof! ✨' : 'Bark! 🐾'}</div>
            ))}
          </div>
          
          <div className="mt-8 h-12">
            <AnimatePresence>
              {step >= 2 && (
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl sm:text-4xl font-handwriting text-primary-pink"
                >
                  Hiii there! 👋
                </motion.h1>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Bubble */}
        <div className="mt-12 mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 || step === 1 ? (
              <motion.div
                key="bubble0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl shadow-xl relative border-2 border-pink-100"
              >
                <p className="text-lg font-medium text-gray-700">
                  I have a special visitor for you... 💖
                </p>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b-2 border-r-2 border-pink-100 rotate-45"></div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="bubble1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl shadow-xl relative border-2 border-pink-100"
              >
                <p className="text-lg font-medium text-gray-700">
                  I heard you're having a tough time... 💔
                </p>
                <div className="mt-4 text-sm text-primary-pink animate-pulse-custom font-bold">
                  Tap the puppy or anywhere to say hi! 👋
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-pink-100 rotate-45"></div>
              </motion.div>
            ) : (
              <motion.div
                key="bubble2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl shadow-xl relative border-2 border-pink-100"
              >
                <p className="text-lg font-medium text-gray-700">
                  But wait... I have something special for you! 🎁
                </p>
                <div className="mt-4 text-sm text-secondary-orange animate-pulse-custom font-bold">
                  Keep tapping! 👇
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-pink-100 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Page2 = ({ onNext }: { onNext: () => void }) => {
  const messages = [
    { emoji: '💛', title: "You're Stronger Than You Think", text: "What happened isn't about your worth. You're absolutely amazing, and that hasn't changed. Not even a little bit." },
    { emoji: '🌟', title: "This Is Not The End", text: "This is just one chapter closing. Your best story is still being written, and it's going to be so beautiful you won't even believe it." },
    { emoji: '🐕', title: "Like Me, You Bounce Back", text: "I come back wagging my tail even on hard days. You have that same magic inside you. It might not be today, but you will too." },
    { emoji: '✨', title: "Your Future Is Bright", text: "Someone worthy of your smile is out there. For now, focus on healing, being kind to yourself, and remembering you're loved exactly as you are." },
    { emoji: '🎀', title: "Take Your Time", text: "Healing isn't linear. Some days will be harder, and that's okay. Cry when you need to, laugh when you can, and trust yourself to get through this." },
  ];

  const handleNext = () => {
    playSound('transition');
    onNext();
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center z-10 relative">
      <div className="text-center mb-12">
        <div className="text-7xl mb-4 animate-bounce-custom">🥟 🥟 🥟</div>
        <h2 className="text-4xl font-handwriting text-primary-pink mb-2">But look what I have for you!</h2>
        <p className="text-secondary-orange font-medium">Special comfort momos & some truth bombs 💕</p>
      </div>

      <div className="max-w-2xl w-full space-y-6">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-primary-pink slide-left"
            style={{ animationDelay: `${0.6 + i * 0.15}s` }}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{msg.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{msg.title}</h3>
                <p className="text-gray-600 leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="mt-12 px-8 py-4 bg-linear-to-r from-primary-pink to-pink-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in"
        style={{ animationDelay: '1.5s' }}
      >
        See One More Thing 💕
      </button>
    </div>
  );
};

const Page3 = () => {
  const flowers = ['🌸', '🌼', '🌺', '🌹', '🌸'];

  useEffect(() => {
    // Play sparkle sound when flowers bloom
    const timer = setTimeout(() => playSound('sparkle'), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen py-16 px-6 flex flex-col items-center z-10 relative max-w-3xl mx-auto pb-24 sm:pb-16">
      <div className="flex gap-4 mb-12">
        {flowers.map((f, i) => (
          <div 
            key={i} 
            className="text-4xl sm:text-5xl animate-bloom"
            style={{ animationDelay: `${0.1 + i * 0.2}s` }}
          >
            {f}
          </div>
        ))}
      </div>

      <h1 className="text-5xl sm:text-6xl font-serif text-primary-pink text-center mb-12 fade-in" style={{ animationDelay: '1.2s' }}>
        Don't Stop Smiling
      </h1>

      <div className="space-y-8 text-gray-700 text-lg sm:text-xl leading-relaxed text-center fade-in" style={{ animationDelay: '1.5s' }}>
        <p>
          Your smile is a reflection of the beautiful soul inside you. It's a light that brightens not just your own world, but everyone lucky enough to be around you. Yes, today feels heavy. Yes, the pain is real. But your smile? That's your superpower, and no one—absolutely no one—gets to take that away from you.
        </p>
        
        <p>
          Every time you smile despite the hurt, you're proving to yourself just how resilient and strong you are. You're teaching the world that you refuse to let this moment define you. That's not just courage—that's <span className="text-primary-pink font-bold">extraordinary</span>.
        </p>

        <p>
          So keep smiling. Not because everything is okay right now, but because you <span className="text-primary-pink font-bold">will be okay</span>. Because you deserve joy. Because your smile is a promise to yourself that the best is still coming.
        </p>

        <p>
          The storm will pass. Your smile will shine brighter than ever. And one day, you'll look back and realize that this heartbreak was just making room for something beautiful.
        </p>

        <div className="pt-8">
          <p className="font-handwriting text-3xl text-primary-pink">With all my paws and heart 🐾💕</p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex justify-center gap-4 text-3xl animate-pulse-custom">
              <span>💕</span>
              <span>🌸</span>
              <span>💕</span>
            </div>
            <p className="text-2xl font-bold text-primary-pink animate-pulse-custom mt-4">Keep smiling Shiv 😊✨</p>
          </div>
        </div>
      </div>

      {/* Credit */}
      <div className="mt-16 sm:mt-24 w-full flex justify-end fade-in pb-[env(safe-area-inset-bottom)]" style={{ animationDelay: '2s' }}>
        <p className="text-gray-400 text-sm font-medium italic pr-4">
          created by SagartheMotaBhalu 🐻😂
        </p>
      </div>
    </div>
  );
};

const StartScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-linear-to-br from-bg-pink to-bg-cream">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-pink-100 max-w-sm w-full"
      >
        <div className="text-6xl mb-6 animate-bounce-custom">🎁</div>
        <h1 className="text-3xl font-handwriting text-primary-pink mb-4">A surprise for you!</h1>
        <p className="text-gray-600 mb-8">I have something special to cheer you up. Ready to see it?</p>
        <button
          onClick={() => {
            playSound('pop');
            onStart();
          }}
          className="w-full py-4 bg-linear-to-r from-primary-pink to-pink-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
        >
          Open Surprise ✨
        </button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.8,
  ease: "easeInOut",
};

export default function App() {
  const [page, setPage] = useState(0); // 0: StartScreen, 1: Page1, 2: Page2, 3: Page3

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="relative min-h-screen">
      <FloatingFlowers />
      
      <AnimatePresence mode="wait">
        {page === 0 && (
          <motion.div
            key="start"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <StartScreen onStart={() => setPage(1)} />
          </motion.div>
        )}

        {page === 1 && (
          <motion.div
            key="page1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <Page1 onNext={() => setPage(2)} />
          </motion.div>
        )}

        {page === 2 && (
          <motion.div
            key="page2"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <Page2 onNext={() => setPage(3)} />
          </motion.div>
        )}

        {page === 3 && (
          <motion.div
            key="page3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <Page3 />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Sparkles */}
      <div className="fixed top-4 right-4 text-accent-yellow animate-pulse-custom opacity-50">
        <Sparkles size={32} />
      </div>
      <div className="fixed bottom-4 left-4 text-primary-pink animate-pulse-custom opacity-50">
        <Heart size={32} />
      </div>
    </div>
  );
}
