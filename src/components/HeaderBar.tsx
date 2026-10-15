import React from 'react';
import { Plus, User, ChevronDown, BookOpen } from 'lucide-react';
import { ClassRoom } from '../types';

interface Props {
  classes: ClassRoom[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onOpenClassManager: () => void;
  onOpenQuestionManager?: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  classes,
  activeClassId,
  onSelectClass,
  onOpenClassManager,
  onOpenQuestionManager,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-5 flex items-center justify-between gap-2 shadow-xs select-none">
      {/* Left: Branding in a single sleek line */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-base sm:text-lg">🛸</span>
        <span className="font-black text-xs sm:text-sm text-stone-900 tracking-tight whitespace-nowrap">
          UFO BẮT TRẢ BÀI
        </span>

        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
          <span>🇻🇳</span>
          <span>VI</span>
        </div>

        <span className="text-[11px] font-semibold text-stone-400 hidden sm:inline">
          by KROMA
        </span>
      </div>

      {/* Right: Class Dropdown Selector & Plus & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex items-center bg-[#f7f5f0] border border-stone-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-stone-600 mr-1.5 shrink-0" />
          <select
            value={activeClassId}
            onChange={(e) => onSelectClass(e.target.value)}
            className="bg-transparent pr-4 focus:outline-none cursor-pointer text-xs font-bold text-slate-800 appearance-none max-w-[120px] sm:max-w-[160px] truncate"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-stone-500 absolute right-2 pointer-events-none" />
        </div>

        {/* Question Bank & Math button */}
        {onOpenQuestionManager && (
          <button
            onClick={onOpenQuestionManager}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Ngân hàng câu hỏi & Công thức Toán"
          >
            <span className="text-xs">📐</span>
            <span className="hidden sm:inline">Câu hỏi & Toán</span>
          </button>
        )}

        {/* Plus button to add class */}
        <button
          onClick={onOpenClassManager}
          className="p-1.5 rounded-xl bg-[#eef7ee] hover:bg-[#d8eed8] text-[#1b6b28] border border-emerald-200/60 transition-colors cursor-pointer shadow-xs"
          title="Tạo lớp mới / Sửa danh sách học sinh"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Profile icon */}
        <button
          onClick={onOpenClassManager}
          className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 border border-transparent hover:border-stone-200 transition-colors cursor-pointer"
          title="Quản lý danh sách học sinh"
        >
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
