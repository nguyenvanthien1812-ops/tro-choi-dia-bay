import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Edit3, QrCode } from 'lucide-react';

interface Props {
  statusText: string;
  studentCount: number;
  isUfoActive: boolean;
  onOpenClassManager: () => void;
}

export const TopNoticeCard: React.FC<Props> = ({
  statusText,
  studentCount,
  isUfoActive,
  onOpenClassManager,
}) => {
  return (
    <div className="fixed top-14 sm:top-15 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-sm sm:max-w-md pointer-events-auto">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`backdrop-blur-md rounded-2xl px-4 py-2 shadow-md border transition-all duration-500 text-center space-y-1.5 select-none ${
          isUfoActive
            ? 'bg-[#122826]/85 border-teal-500/30 text-teal-100 shadow-teal-950/20'
            : 'bg-white/90 border-stone-200/90 text-stone-800 shadow-stone-300/30'
        }`}
      >
        {/* Status Message Line */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className={isUfoActive ? 'text-teal-200' : 'text-stone-700'}>
              {statusText}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Student Count Badge & Edit Buttons */}
        <div className="flex items-center justify-center gap-2">
          {/* Student count pill */}
          <button
            onClick={onOpenClassManager}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              isUfoActive
                ? 'bg-teal-950/70 hover:bg-teal-900/80 text-teal-200 border border-teal-700/50'
                : 'bg-[#f5f0e8] hover:bg-[#eae2d5] text-stone-800 border border-stone-300'
            }`}
            title="Bấm để chỉnh sửa danh sách học sinh"
          >
            <span>{studentCount} học sinh</span>
          </button>

          {/* Pencil Edit Icon Button */}
          <button
            onClick={onOpenClassManager}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isUfoActive
                ? 'hover:bg-teal-900/70 text-teal-300'
                : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
            }`}
            title="Đổi tên / sửa danh sách"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* QR Code icon */}
          <button
            onClick={onOpenClassManager}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isUfoActive
                ? 'hover:bg-teal-900/70 text-teal-300'
                : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
            }`}
            title="Mã lớp"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
