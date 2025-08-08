//components/custom/overview.tsx
import { motion } from "framer-motion";
import Link from "next/link";

export const Overview = ({ firstName }: { firstName?: string }) => {
  // Determine greeting based on local time
  const getGreeting = (name?: string) => {
    const greeting = `Let's make some magic${name ? `, ${name}` : ""}.`;
    return greeting;
  };

  return (
    <motion.div
      key="overview"
      className="w-full mt-20 px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {getGreeting(firstName)}
          </div>
          <div className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
          </div>
        </div>
      </div>
    </motion.div>
  );
};
