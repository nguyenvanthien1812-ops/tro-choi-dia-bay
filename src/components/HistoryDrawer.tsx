import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AbductedStudent } from '../types';
import { X, Trash2, Download, History, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: AbductedStudent[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  history,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const handleExportText = () => {
    const text = history
      .map((item, idx) => `${idx + 1}. ${item.student.name} (${item.abductedAt}) ${item.score !== undefined ? `- Điểm: ${item.score}` : ''}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lich_su_tra_bai_UFO_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 text-slate-800"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-black text-slate-900">
                Lịch sử gọi tên hôm nay
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-medium">Chưa có ai bị đĩa bay UFO bắt hôm nay!</p>
                <p className="text-xs">Bấm "Bắt đầu" để khởi động đĩa bay.</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={`${item.student.id}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.student.name}</h4>
                      <p className="text-[11px] text-slate-400">{item.abductedAt}</p>
                    </div>
                  </div>

                  {item.score !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                      {item.score} điểm
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {history.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={onClearHistory}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Xóa lịch sử
              </button>

              <button
                onClick={handleExportText}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Download className="w-4 h-4" /> Tải báo cáo (.txt)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
