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
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <div className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
          {getGreeting()} {firstName ? firstName : ""}!
        </div>
        {/* Icons removed as requested */}
      </div>
    </motion.div>
  );
};
