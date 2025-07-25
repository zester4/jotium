//components/custom/overview.tsx
import { motion } from "framer-motion";
import Link from "next/link";

export const Overview = ({ firstName }: { firstName?: string }) => {
  // Determine greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    if (hour >= 21 && hour < 24) return "Happy Late night";
    return "Happy Midnight";
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
      <div className="bg-gradient-to-br from-muted/50 to-muted/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {getGreeting()} {firstName ? firstName : ""}!
          </div>
          <div className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
          </div>
        </div>
      </div>
    </motion.div>
  );
};