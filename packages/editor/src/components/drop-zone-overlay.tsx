import { FileUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneOverlayProps {
  visible: boolean;
}

export function DropZoneOverlay({ visible }: DropZoneOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-75 bg-background/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-6 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.8,
            }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary/30"
            >
              <FileUp className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.8,
              delay: 0.1,
            }}
            className="text-center px-6 py-4"
          >
            <p className="text-3xl font-semibold text-foreground">
              Drop PDF files here
            </p>
            <p className="text-base text-muted-foreground mt-2">
              Release to add them to your document
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
