"use client";

import { motion } from "framer-motion";

/**
 * Base document component used by multiple visuals
 */
function DocumentBase({
  children,
  rotate = -2,
  glowColor = "rgba(99, 102, 241, 0.15)"
}: {
  children: React.ReactNode;
  rotate?: number;
  glowColor?: string;
}) {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect behind the document */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Main document container */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: rotate }}
        animate={{ opacity: 1, y: 0, rotate: rotate }}
        transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
        className="relative w-full h-full"
      >
        {/* Document shadow */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5), 0 30px 60px -30px rgba(0, 0, 0, 0.4)',
          }}
        />

        {/* Document */}
        <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Browser header with traffic lights
 */
function BrowserHeader() {
  return (
    <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-4">
        <div className="h-5 bg-gray-200 rounded-md w-48 mx-auto" />
      </div>
    </div>
  );
}

/**
 * Text lines placeholder
 */
function TextLines({ count = 3, delay = 0.5 }: { count?: number; delay?: number }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-5/6", "w-3/4", "w-full"];
  return (
    <div className="space-y-2.5">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.05 }}
          className={`h-3 bg-gray-300 rounded ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/**
 * Edit PDF Hero Visual
 */
export function EditPdfHeroVisual() {
  return (
    <DocumentBase>
      <BrowserHeader />

      {/* Toolbar */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className="w-8 h-8 rounded-lg bg-gray-200"
          />
        ))}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-8 h-8 rounded-lg bg-amber-400"
        />
      </div>

      {/* Document content */}
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-5 bg-gray-800 rounded w-2/3"
        />

        <TextLines count={3} delay={0.55} />

        {/* Highlighted text */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="relative"
          style={{ transformOrigin: 'left' }}
        >
          <div className="h-6 bg-amber-300/70 rounded-sm w-3/4 flex items-center px-2">
            <div className="h-3 bg-gray-700 rounded w-full" />
          </div>
        </motion.div>

        <TextLines count={2} delay={0.7} />

        {/* Added text annotation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="inline-block px-3 py-1.5 bg-blue-100 border-2 border-blue-400 rounded text-blue-700 text-sm font-medium"
        >
          Added text here
        </motion.div>

        {/* Signature area */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-gray-400 mb-2"
          >
            Signature
          </motion.div>
          <motion.svg
            viewBox="0 0 150 40"
            className="w-32 h-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.path
              d="M5 30 Q 20 10, 40 25 T 70 20 T 100 28 T 130 15 T 145 25"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>
      </div>
    </DocumentBase>
  );
}

/**
 * Sign PDF Hero Visual - Focused on signature
 */
export function SignPdfHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(59, 130, 246, 0.15)">
      <BrowserHeader />

      {/* Document content - contract style */}
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="h-5 bg-gray-800 rounded w-1/2 mx-auto mb-2" />
          <div className="h-3 bg-gray-300 rounded w-1/3 mx-auto" />
        </motion.div>

        <div className="pt-4">
          <TextLines count={4} delay={0.55} />
        </div>

        <TextLines count={3} delay={0.7} />

        {/* Signature line with animated signature */}
        <div className="pt-8 mt-4">
          <div className="flex items-end gap-8">
            <div className="flex-1">
              <motion.svg
                viewBox="0 0 200 60"
                className="w-full h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.path
                  d="M10 45 Q 30 15, 60 35 T 100 25 T 140 40 T 180 20"
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.0, duration: 1, ease: "easeInOut" }}
                />
              </motion.svg>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className="h-0.5 bg-gray-400"
                style={{ transformOrigin: 'left' }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-gray-400 mt-1"
              >
                Your Signature
              </motion.p>
            </div>
            <div className="flex-1">
              <div className="h-16" />
              <div className="h-0.5 bg-gray-300" />
              <p className="text-xs text-gray-400 mt-1">Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating pen cursor */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="absolute bottom-32 right-16"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="rotate-[-30deg]">
          <path d="M12 20h9" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5"/>
        </svg>
      </motion.div>
    </DocumentBase>
  );
}

/**
 * Highlight PDF Hero Visual
 */
export function HighlightPdfHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(251, 191, 36, 0.2)">
      <BrowserHeader />

      {/* Toolbar with highlight tool active */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className="w-8 h-8 rounded-lg bg-gray-200"
          />
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-8 h-8 rounded-lg bg-amber-400 ring-2 ring-amber-500 ring-offset-1"
        />
        <div className="flex gap-1 ml-2">
          {["bg-yellow-300", "bg-green-300", "bg-blue-300", "bg-pink-300"].map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.05 }}
              className={`w-5 h-5 rounded ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Document content with highlights */}
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-5 bg-gray-800 rounded w-3/4"
        />

        <div className="space-y-2.5 pt-2">
          <div className="h-3 bg-gray-300 rounded w-full" />
          {/* Yellow highlight */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            style={{ transformOrigin: 'left' }}
          >
            <div className="h-5 bg-yellow-300/70 rounded-sm w-4/5 flex items-center px-1">
              <div className="h-3 bg-gray-600 rounded w-full" />
            </div>
          </motion.div>
          <div className="h-3 bg-gray-300 rounded w-11/12" />
        </div>

        <div className="space-y-2.5">
          {/* Green highlight */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            style={{ transformOrigin: 'left' }}
          >
            <div className="h-5 bg-green-300/70 rounded-sm w-2/3 flex items-center px-1">
              <div className="h-3 bg-gray-600 rounded w-full" />
            </div>
          </motion.div>
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-5/6" />
        </div>

        <div className="space-y-2.5">
          <div className="h-3 bg-gray-300 rounded w-full" />
          {/* Pink highlight */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            style={{ transformOrigin: 'left' }}
          >
            <div className="h-5 bg-pink-300/70 rounded-sm w-1/2 flex items-center px-1">
              <div className="h-3 bg-gray-600 rounded w-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Highlighter cursor */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.3 }}
        className="absolute bottom-24 right-20"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="rotate-[-45deg]">
          <rect x="3" y="10" width="6" height="12" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
          <path d="M6 10V6l3-3h0l3 3v4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        </svg>
      </motion.div>
    </DocumentBase>
  );
}

/**
 * Merge PDF Hero Visual - Multiple documents combining
 */
export function MergePdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15), transparent 70%)',
        }}
      />

      {/* Left document */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -8 }}
        animate={{ opacity: 1, x: 0, rotate: -8 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        className="absolute left-4 top-8 w-[45%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-3/4" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-5/6" />
          <div className="h-2 bg-gray-300 rounded w-4/5" />
          <div className="h-8 bg-blue-100 rounded mt-3" />
        </div>
      </motion.div>

      {/* Right document */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotate: 8 }}
        animate={{ opacity: 1, x: 0, rotate: 8 }}
        transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        className="absolute right-4 top-8 w-[45%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-2/3" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-4/5" />
          <div className="h-2 bg-gray-300 rounded w-5/6" />
          <div className="h-8 bg-green-100 rounded mt-3" />
        </div>
      </motion.div>

      {/* Merged document (center, appears after) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
        className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[55%] aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden z-10"
      >
        <div className="h-7 bg-gray-100 border-b border-gray-200 flex items-center px-2.5 gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-3/4" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-5/6" />
          <div className="h-6 bg-blue-100 rounded mt-2" />
          <div className="h-0.5 bg-gray-200 my-2" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-6 bg-green-100 rounded mt-2" />
        </div>
      </motion.div>

      {/* Merge arrows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="absolute left-1/2 -translate-x-1/2 top-1/3"
      >
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <motion.path
            d="M5 10 L25 30"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          />
          <motion.path
            d="M55 10 L35 30"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * Split PDF Hero Visual - One document becoming multiple
 */
export function SplitPdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.15), transparent 70%)',
        }}
      />

      {/* Original document (top) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute left-1/2 -translate-x-1/2 top-4 w-[50%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-2 bg-gray-800 rounded w-2/3" />
          <div className="h-1.5 bg-gray-300 rounded w-full" />
          <div className="h-1.5 bg-gray-300 rounded w-4/5" />
          <div className="h-0.5 bg-purple-300 my-1.5" />
          <div className="h-2 bg-gray-700 rounded w-1/2" />
          <div className="h-1.5 bg-gray-300 rounded w-full" />
          <div className="h-0.5 bg-purple-300 my-1.5" />
          <div className="h-2 bg-gray-700 rounded w-3/5" />
          <div className="h-1.5 bg-gray-300 rounded w-5/6" />
        </div>
      </motion.div>

      {/* Scissors icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="absolute left-1/2 -translate-x-1/2 top-[42%]"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="6" r="3" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="6" cy="18" r="3" stroke="#a855f7" strokeWidth="2"/>
          <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.div>

      {/* Split documents (bottom) */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
        className="absolute left-6 bottom-4 w-[40%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
        style={{ rotate: -5 }}
      >
        <div className="h-5 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-2 bg-gray-800 rounded w-2/3" />
          <div className="h-1.5 bg-gray-300 rounded w-full" />
          <div className="h-1.5 bg-gray-300 rounded w-4/5" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-2 right-2 text-xs font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded"
        >
          1/3
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
        className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[40%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden z-10"
      >
        <div className="h-5 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-2 bg-gray-700 rounded w-1/2" />
          <div className="h-1.5 bg-gray-300 rounded w-full" />
          <div className="h-1.5 bg-gray-300 rounded w-5/6" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="absolute bottom-2 right-2 text-xs font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded"
        >
          2/3
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
        className="absolute right-6 bottom-4 w-[40%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
        style={{ rotate: 5 }}
      >
        <div className="h-5 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-2 bg-gray-700 rounded w-3/5" />
          <div className="h-1.5 bg-gray-300 rounded w-5/6" />
          <div className="h-1.5 bg-gray-300 rounded w-full" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-2 right-2 text-xs font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded"
        >
          3/3
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Rotate PDF Hero Visual
 */
export function RotatePdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15), transparent 70%)',
        }}
      />

      {/* Rotating document */}
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 90 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] aspect-[3/4] bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-5/6" />
          <div className="h-3 bg-gray-300 rounded w-4/5" />
          <div className="h-12 bg-sky-100 rounded mt-4" />
        </div>
      </motion.div>

      {/* Rotation arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] pointer-events-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.path
            d="M 80 50 A 30 30 0 1 1 50 20"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
          <motion.polygon
            points="48,12 56,20 48,28"
            fill="#0ea5e9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          />
        </svg>
      </motion.div>

      {/* 90° label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        className="absolute top-6 right-6 px-3 py-1.5 bg-sky-500 text-white text-sm font-bold rounded-full"
      >
        90°
      </motion.div>
    </div>
  );
}

/**
 * Compress PDF Hero Visual
 */
export function CompressPdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.15), transparent 70%)',
        }}
      />

      {/* Before - Large document */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[45%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-2/3" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-4/5" />
          <div className="h-16 bg-orange-100 rounded mt-2" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-2 left-2 right-2 text-center"
        >
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            12.4 MB
          </span>
        </motion.div>
      </motion.div>

      {/* Compression arrows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <motion.path
            d="M12 24h24"
            stroke="#ea580c"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          />
          <motion.path
            d="M28 16l8 8-8 8"
            stroke="#ea580c"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.0, duration: 0.3 }}
          />
        </svg>
      </motion.div>

      {/* After - Smaller document */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 0.85 }}
        transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-[45%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden origin-center"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-2/3" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-4/5" />
          <div className="h-16 bg-orange-100 rounded mt-2" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-2 left-2 right-2 text-center"
        >
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
            2.1 MB (-83%)
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Fill PDF Hero Visual - Form filling
 */
export function FillPdfHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(16, 185, 129, 0.15)">
      <BrowserHeader />

      {/* Form content */}
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-5 bg-gray-800 rounded w-1/2"
        />

        {/* Form fields */}
        <div className="space-y-4 pt-2">
          {/* Name field */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-xs text-gray-500 mb-1"
            >
              Full Name
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="h-8 bg-emerald-50 border-2 border-emerald-400 rounded flex items-center px-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm text-gray-700"
              >
                John Smith
              </motion.span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                className="w-0.5 h-4 bg-emerald-500 ml-0.5"
              />
            </motion.div>
          </div>

          {/* Email field */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-xs text-gray-500 mb-1"
            >
              Email Address
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="h-8 bg-gray-50 border border-gray-300 rounded flex items-center px-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-gray-700"
              >
                john@example.com
              </motion.span>
            </motion.div>
          </div>

          {/* Checkbox */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, type: "spring" }}
              className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="text-xs text-gray-600">I agree to the terms</span>
          </motion.div>

          {/* Date field */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-xs text-gray-500 mb-1"
            >
              Date
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="h-8 bg-gray-50 border border-gray-300 rounded flex items-center px-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-sm text-gray-700"
              >
                Dec 3, 2025
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </DocumentBase>
  );
}

/**
 * Annotate PDF Hero Visual
 */
export function AnnotatePdfHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(239, 68, 68, 0.15)">
      <BrowserHeader />

      {/* Toolbar */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2">
        {["bg-gray-200", "bg-gray-200", "bg-red-400", "bg-gray-200"].map((color, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className={`w-7 h-7 rounded-md ${color}`}
          />
        ))}
      </div>

      {/* Document content with annotations */}
      <div className="p-5 space-y-3 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-4 bg-gray-800 rounded w-3/4"
        />

        <TextLines count={3} delay={0.55} />

        {/* Comment annotation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.9, type: "spring" }}
          className="absolute top-16 right-4 w-36 bg-yellow-100 border border-yellow-300 rounded-lg p-2 shadow-md"
        >
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] text-white font-bold">JS</span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-700">Comment</p>
              <p className="text-[9px] text-gray-500">Check this section</p>
            </div>
          </div>
        </motion.div>

        <TextLines count={2} delay={0.65} />

        {/* Strikethrough */}
        <div className="relative">
          <div className="h-3 bg-gray-300 rounded w-4/5" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
            className="absolute inset-0 flex items-center"
            style={{ transformOrigin: 'left' }}
          >
            <div className="h-0.5 bg-red-500 w-full" />
          </motion.div>
        </div>

        {/* Underline */}
        <div className="relative pt-2">
          <div className="h-3 bg-gray-300 rounded w-2/3" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.3 }}
            className="absolute bottom-0 left-0 w-2/3 h-0.5 bg-blue-500"
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {/* Drawing annotation */}
        <motion.svg
          className="absolute bottom-8 left-8 w-24 h-16"
          viewBox="0 0 100 60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <motion.ellipse
            cx="50"
            cy="30"
            rx="45"
            ry="25"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          />
        </motion.svg>
      </div>
    </DocumentBase>
  );
}

/**
 * Redact PDF Hero Visual
 */
export function RedactPdfHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(0, 0, 0, 0.15)">
      <BrowserHeader />

      {/* Toolbar */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-7 h-7 rounded-md bg-gray-900 ring-2 ring-gray-400"
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 + i * 0.05 }}
            className="w-7 h-7 rounded-md bg-gray-200"
          />
        ))}
      </div>

      {/* Document content with redactions */}
      <div className="p-5 space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-4 bg-gray-800 rounded w-2/3"
        />

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">Name:</span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="h-4 bg-black rounded w-32"
              style={{ transformOrigin: 'left' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">SSN:</span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              className="h-4 bg-black rounded w-24"
              style={{ transformOrigin: 'left' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">Address:</span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              className="h-4 bg-black rounded w-40"
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </div>

        <TextLines count={3} delay={0.6} />

        {/* Redacted paragraph */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="h-12 bg-black rounded w-full"
          style={{ transformOrigin: 'left' }}
        />

        <TextLines count={2} delay={0.7} />
      </div>

      {/* Shield icon overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6, type: "spring" }}
        className="absolute bottom-16 right-8"
      >
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </motion.div>
    </DocumentBase>
  );
}

/**
 * Flatten PDF Hero Visual
 */
export function FlattenPdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), transparent 70%)',
        }}
      />

      {/* Stacked layers (before) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.5, duration: 0.3 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-[45%]"
      >
        {/* Layer 3 - back */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: -16 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute inset-0 aspect-[3/4] bg-indigo-200 rounded-lg shadow-md"
          style={{ transform: 'translateY(-16px)' }}
        />
        {/* Layer 2 - middle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: -8 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute inset-0 aspect-[3/4] bg-indigo-300 rounded-lg shadow-md"
          style={{ transform: 'translateY(-8px)' }}
        />
        {/* Layer 1 - front */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="h-6 bg-gray-100 border-b border-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-indigo-100 rounded mt-2 flex items-center justify-center">
              <span className="text-[8px] text-indigo-600">Form Field</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 20 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M12 24h24M28 16l8 8-8 8" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>

      {/* Flattened document (after) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-[45%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-3/4" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-5/6" />
          <div className="h-6 bg-gray-200 rounded mt-2 flex items-center px-2">
            <span className="text-[8px] text-gray-600">John Smith</span>
          </div>
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-2 bg-gray-300 rounded w-4/5" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: "spring" }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Unlock PDF Hero Visual
 */
export function UnlockPdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15), transparent 70%)',
        }}
      />

      {/* Document with lock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[55%] aspect-[3/4] bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-5/6" />
          <div className="h-3 bg-gray-300 rounded w-4/5" />
          <div className="h-12 bg-gray-100 rounded mt-2" />
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-3/4" />
        </div>
      </motion.div>

      {/* Lock icon - animates to unlocked */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute left-1/2 -translate-x-1/2 top-8"
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -8 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="relative"
        >
          {/* Lock shackle */}
          <motion.svg
            width="48"
            height="32"
            viewBox="0 0 48 32"
            className="absolute -top-6 left-1/2 -translate-x-1/2"
          >
            <motion.path
              d="M12 28V16a12 12 0 1 1 24 0v12"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 1 }}
            />
            <motion.path
              d="M12 28V16a12 12 0 1 1 24 0"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ rotate: 0 }}
              animate={{ rotate: -30 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              style={{ transformOrigin: '36px 28px' }}
            />
          </motion.svg>
          {/* Lock body */}
          <div className="w-16 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg mt-2">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: 1.4, duration: 0.3 }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Success checkmark */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6, type: "spring" }}
        className="absolute bottom-12 right-12"
      >
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * OCR PDF Hero Visual
 */
export function OcrPdfHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15), transparent 70%)',
        }}
      />

      {/* Scanned document (left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[42%] aspect-[3/4] bg-gray-100 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-200 border-b border-gray-300" />
        <div className="p-3">
          {/* Blurry/scanned text simulation */}
          <div className="space-y-2 opacity-60">
            <div className="h-3 bg-gray-400 rounded w-3/4 blur-[0.5px]" />
            <div className="h-2 bg-gray-400 rounded w-full blur-[0.5px]" />
            <div className="h-2 bg-gray-400 rounded w-5/6 blur-[0.5px]" />
            <div className="h-2 bg-gray-400 rounded w-4/5 blur-[0.5px]" />
            <div className="h-8 bg-gray-300 rounded mt-3" />
            <div className="h-2 bg-gray-400 rounded w-full blur-[0.5px]" />
            <div className="h-2 bg-gray-400 rounded w-3/4 blur-[0.5px]" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <span className="text-[10px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            Scanned Image
          </span>
        </div>
      </motion.div>

      {/* Scanning animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute left-[18%] top-1/2 -translate-y-1/2 w-[42%] aspect-[3/4] pointer-events-none overflow-hidden rounded-lg"
      >
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ delay: 0.8, duration: 1.5, ease: "linear" }}
          className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.5)]"
        />
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <motion.path
            d="M8 20h24M24 12l8 8-8 8"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          />
        </svg>
      </motion.div>

      {/* Extracted text (right) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-[42%] aspect-[3/4] bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-3 space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="h-3 bg-gray-800 rounded w-3/4"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="h-2 bg-gray-300 rounded w-full"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="h-2 bg-gray-300 rounded w-5/6"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="h-2 bg-gray-300 rounded w-4/5"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="h-8 bg-blue-50 rounded mt-3 flex items-center justify-center"
          >
            <span className="text-[8px] text-blue-600">Selectable Text</span>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, type: "spring" }}
          className="absolute bottom-2 right-2"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Default Hero Visual - Uses the lark background image
 */
export function DefaultHeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
        style={{ backgroundImage: "url('/lark.png')" }}
      />
    </div>
  );
}

/**
 * Homepage Hero Visual - Clean, simple document with subtle animations
 */
export function HomepageHeroVisual() {
  return (
    <DocumentBase glowColor="rgba(99, 102, 241, 0.15)">
      <BrowserHeader />

      {/* Document content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-5 bg-gray-800 rounded w-2/3"
        />

        <TextLines count={3} delay={0.55} />

        {/* Highlighted text */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          style={{ transformOrigin: 'left' }}
        >
          <div className="h-6 bg-amber-300/70 rounded-sm w-3/4 flex items-center px-2">
            <div className="h-3 bg-gray-700 rounded w-full" />
          </div>
        </motion.div>

        <TextLines count={2} delay={0.7} />

        {/* Signature */}
        <div className="pt-4 mt-2 border-t border-gray-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-gray-400 mb-2"
          >
            Signature
          </motion.div>
          <motion.svg
            viewBox="0 0 150 40"
            className="w-32 h-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.path
              d="M5 30 Q 20 10, 40 25 T 70 20 T 100 28 T 130 15 T 145 25"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>
      </div>
    </DocumentBase>
  );
}
