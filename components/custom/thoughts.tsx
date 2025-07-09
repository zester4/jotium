//jotium-thoughts.tsx
// this will display the thoughts of the agent
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import React, { useState } from "react";

import { Markdown } from "./markdown";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
  duration?: number;
}

export function MessageReasoning({
  isLoading,
  reasoning,
  duration,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <Loader2 />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">
            {duration
              ? `Reasoned for ${(duration / 1000).toFixed(2)} seconds`
              : "Reasoned for a few seconds"}
          </div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDown />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
