import React from 'react';

interface Props {
  className: string;
  remainingStudents: number;
  totalStudents: number;
}

export const Header: React.FC<Props> = ({ className, remainingStudents, totalStudents }) => {
  return (
    <div className="fixed top-3 left-3 z-30 pointer-events-none select-none">
      <div className="bg-white/80 border border-slate-200/60 backdrop-blur-xs px-3 py-1 rounded-full shadow-2xs flex items-center gap-2 text-slate-700 text-xs font-medium">
        <span className="text-sm">🛸</span>
        <span className="font-semibold text-slate-800">{className}</span>
        <span className="text-slate-400 text-[10px]">•</span>
        <span className="text-[11px] text-slate-500">Còn {remainingStudents}/{totalStudents} bạn</span>
      </div>
    </div>
  );
};
