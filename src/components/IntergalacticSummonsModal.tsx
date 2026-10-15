import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AbductedStudent, OralQuestion, Student } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Volume2, 
  Sparkles, 
  X,
  Share2,
  Copy,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface Props {
  isOpen: boolean;
  abductedStudents: AbductedStudent[];
  questions: OralQuestion[];
  onNewRound: () => void;
  onClose: () => void;
}

const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => {
  const isFemale = student.gender === 'female';
  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-stone-200/80 shadow-xs overflow-hidden ${
      isFemale ? 'bg-[#faeee4]' : 'bg-[#e7f0fa]'
    }`}>
      <svg viewBox="0 0 40 40" className="w-12 h-12">
        {/* Torso / Uniform Collar */}
        <path d="M11 36 L29 36 L27 26 L13 26 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <path d="M17 26 L20 30 L23 26" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="18" y="21" width="4" height="6" fill="#fcd3b6" />
        {/* Head */}
        <ellipse cx="20" cy="17" rx="6.5" ry="7.5" fill="#fcd3b6" />
        {/* Hair */}
        {isFemale ? (
          <>
            <path d="M12 18 C12 8, 28 8, 28 18 C29 25, 29 27, 27 27 C26 24, 26 18, 25 15 C20 13, 16 16, 15 27 C13 27, 12 25, 12 18 Z" fill="#1c1917" />
            <circle cx="12" cy="11" r="2.5" fill="#ea580c" />
          </>
        ) : (
          <path d="M12 17 C12 9, 28 9, 28 17 C27 13, 24 11.5, 20 11.5 C16 11.5, 14 13.5, 12 17 Z" fill="#1c1917" />
        )}
        {/* Eyes & Smile */}
        <circle cx="17.5" cy="17" r="0.9" fill="#0f172a" />
        <circle cx="22.5" cy="17" r="0.9" fill="#0f172a" />
        <path d="M18.5 20 Q20 21.8 21.5 20" stroke="#0f172a" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const IntergalacticSummonsModal: React.FC<Props> = ({
  isOpen,
  abductedStudents,
  questions,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [assignedQuestions, setAssignedQuestions] = useState<Record<string, OralQuestion>>({});

  if (!isOpen) return null;

  const handleCopyList = () => {
    const text = abductedStudents
      .map((item, idx) => `${idx + 1}. ${item.student.name}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundEngine.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakNames = () => {
    soundEngine.playClick();
    const namesText = abductedStudents.map(a => a.student.name).join(', ');
    soundEngine.speakVietnamese(`Lệnh triệu tập liên hành tinh! Trạm vũ trụ đang chờ câu trả lời từ các bạn ${namesText}!`);
  };

  const handleAssignRandomQuestion = (studentId: string) => {
    soundEngine.playClick();
    if (questions.length === 0) return;
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setAssignedQuestions(prev => ({ ...prev, [studentId]: randomQ }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800"
        >
          {/* Top Banner Accent */}
          <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* RED "ĐÃ BẮT" ROTATED STAMP (Exact feature from kromaphone video!) */}
          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -18 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
            className="absolute top-5 right-14 pointer-events-none z-10"
          >
            <div className="px-3.5 py-1 border-3 border-dashed border-red-600 rounded-xl bg-red-600/10 text-red-600 font-extrabold text-sm sm:text-base tracking-wider shadow-sm uppercase">
              ĐÃ BẮT 🛸
            </div>
          </motion.div>

          {/* Card Header */}
          <div className="p-5 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Lệnh triệu tập liên hành tinh
            </div>

            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Trạm vũ trụ đang chờ<br />câu trả lời!
              </h2>

              {/* Action Icons Top Right */}
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button
                  onClick={handleSpeakNames}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Đọc tên học sinh"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                </button>
                <button
                  onClick={handleCopyList}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Sao chép"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-stone-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Abducted Students List */}
          <div className="px-5 py-2 space-y-3 max-h-[300px] overflow-y-auto">
            {abductedStudents.map((item, idx) => {
              const st = item.student;
              const assignedQ = assignedQuestions[st.id];

              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200 hover:border-emerald-300 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Illustrated Student Avatar */}
                      <StudentAvatar student={st} />

                      {/* Name */}
                      <div className="min-w-0">
                        <h3 className="font-black text-stone-900 text-xl leading-tight truncate">
                          {st.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          Học sinh thứ #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignRandomQuestion(st.id)}
                      className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                      title="Rút ngẫu nhiên 1 câu hỏi kiểm tra bài cũ"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Câu hỏi</span>
                    </button>
                  </div>

                  {assignedQ && (
                    <div className="mt-2.5 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-800">
                      <span className="font-bold text-blue-800 block mb-0.5">
                        Môn {assignedQ.subject}:
                      </span>
                      <MathRenderer text={assignedQ.question} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer Close Button */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyList}
              className="px-4 py-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Copy className="w-4 h-4 text-stone-500" />
              {copied ? 'Đã sao chép!' : 'Sao chép kết quả'}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
