//components/custom/overview.tsx
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export const Overview = ({ firstName }: { firstName?: string }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Array of dynamic greeting texts
  const greetingTexts = [
    "Let's make some magic",
    "Ready to create something amazing",
    "Time to build the extraordinary",
    "Let's craft something incredible",
    "Ready to innovate together",
    "Time to make ideas reality",
    "Let's create something beautiful",
    "Ready to push boundaries",
    "Time to bring visions to life",
    "Let's build the future",
    "Ready to transform ideas",
    "Time to make it happen"
  ];

  // Get random or cycling greeting
  const getGreeting = (name?: string, mode: 'random' | 'cycle' = 'cycle') => {
    let selectedText;
    
    if (mode === 'random') {
      selectedText = greetingTexts[Math.floor(Math.random() * greetingTexts.length)];
    } else {
      selectedText = greetingTexts[currentTextIndex];
    }
    
    return `${selectedText}${name ? `, ${name}` : ""}.`;
  };

  // Auto-cycle through texts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        (prevIndex + 1) % greetingTexts.length
      );
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [greetingTexts.length]);

  // Manual function to get random text (can be called on click)
  const getRandomText = () => {
    const randomIndex = Math.floor(Math.random() * greetingTexts.length);
    setCurrentTextIndex(randomIndex);
  };

  return (
    <motion.div
      key="overview"
      className="w-full mt-16 px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg">
        <div className="text-center space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTextIndex}
              className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              onClick={getRandomText}
              title="Click for a new message"
            >
              {getGreeting(firstName, 'cycle')}
            </motion.div>
          </AnimatePresence>
          
          <div className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {/* Optional: Add a subtitle that explains the dynamic text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-muted-foreground/60"
            >
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
