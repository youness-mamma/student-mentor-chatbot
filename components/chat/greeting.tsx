import { SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <SparklesIcon className="size-6 text-primary" />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        How are you doing today?
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 max-w-md text-center text-muted-foreground/80 text-sm"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Tell me what's on your mind — I'll connect you with the right person to help.
      </motion.div>
    </div>
  );
};
