import React from 'react';
import { GamePhase } from '../types';
import { 
  RotateCcw, 
  Maximize, 
  SlidersHorizontal,
  HelpCircle,
  MessageSquare,
  Minus,
  Plus
} from 'lucide-react';

interface Props {
  phase: GamePhase;
  targetCount: number;
  onSetTargetCount: (count: number) => void;
  onStart: () => void;
  onStop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenClassManager: () => void;
  onOpenQuestionManager?: () => void;
  onNewRound: () => void;
}

export const ControlBar: React.FC<Props> = ({
  phase,
  targetCount,
  onSetTargetCount,
  onStart,
  onStop,
  onOpenClassManager,
  onOpenQuestionManager,
  onNewRound,
}) => {
  const isRunning = phase !== 'IDLE' && phase !== 'COMPLETED';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      {/* Floating "Góp ý" Feedback pill button (matches video bottom-right!) */}
      <div className="fixed bottom-24 sm:bottom-22 right-4 sm:right-6 z-30 pointer-events-auto">
        <button
          onClick={() => alert('Cảm ơn bạn đã sử dụng UFO Bắt Trả Bài! Chúc thầy cô và các em có tiết học thật hào hứng!')}
          className="px-4 py-2 rounded-2xl bg-[#244e43] hover:bg-[#1a3c33] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg border-2 border-[#16382f] transition-all cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-4 h-4 fill-white/20" />
          <span>Góp ý</span>
        </button>
      </div>

      {/* Main Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl px-3 py-2.5 sm:px-6 sm:py-3 select-none pointer-events-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {/* Row 1: Primary Action & Target Selector */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {/* BIG GREEN START / RUNNING BUTTON */}
            <button
              onClick={isRunning ? onStop : onStart}
              className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 ${
                isRunning
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/30'
                  : 'bg-[#3b8467] hover:bg-[#2f6f55] text-white shadow-[#3b8467]/30'
              }`}
            >
              <span className="text-lg">🛸</span>
              <span>{isRunning ? 'UFO đang gọi tên...' : 'Bắt đầu'}</span>
            </button>

            {/* Target Count Box ("Số bạn được gọi") */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-stone-700 text-right leading-tight">
                Số bạn được<br />gọi
              </span>

              <div className="flex items-center bg-[#fdfbf7] border-2 border-stone-300 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => onSetTargetCount(Math.max(1, targetCount - 1))}
                  disabled={isRunning}
                  className="w-7 h-7 rounded-lg hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer"
                  title="Giảm số lượng"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-8 text-center font-black text-base text-stone-800 font-mono">
                  {targetCount}
                </span>

                <button
                  onClick={() => onSetTargetCount(Math.min(10, targetCount + 1))}
                  disabled={isRunning}
                  className="w-7 h-7 rounded-lg hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer"
                  title="Tăng số lượng"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Buttons (Vòng mới, Toàn màn hình, Cài đặt, ?) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-stone-700 font-medium pt-1">
            <button
              onClick={onNewRound}
              className="px-3.5 py-1.5 rounded-xl bg-[#f7f5f0] hover:bg-[#ede9e0] border border-stone-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
              <span>Vòng mới</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-xl bg-[#f7f5f0] hover:bg-[#ede9e0] border border-stone-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Maximize className="w-3.5 h-3.5 text-stone-600" />
              <span>Toàn màn hình</span>
            </button>

            <button
              onClick={onOpenClassManager}
              className="px-3.5 py-1.5 rounded-xl bg-[#f7f5f0] hover:bg-[#ede9e0] border border-stone-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Quản lý lớp học & Danh sách học sinh"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
              <span>Quản lý lớp</span>
            </button>

            {onOpenQuestionManager && (
              <button
                onClick={onOpenQuestionManager}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ngân hàng câu hỏi kiểm tra & Công thức Toán"
              >
                <span className="text-xs">📐</span>
                <span>Câu hỏi & Toán</span>
              </button>
            )}

            <button
              onClick={() => alert('Hướng dẫn: \n1. Bấm nút Bắt đầu để UFO bay xuống bắt học sinh trả bài.\n2. Bấm vào biểu tượng cây bút (hoặc Cài đặt) để thêm/sửa tên học sinh.\n3. Bấm Vòng mới để gọi lại danh sách từ đầu.')}
              className="p-1.5 px-2.5 rounded-xl bg-[#f7f5f0] hover:bg-[#ede9e0] border border-stone-200/80 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Hướng dẫn"
            >
              <HelpCircle className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
