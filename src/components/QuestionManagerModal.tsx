import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OralQuestion } from '../types';
import { MathRenderer } from './MathRenderer';
import { SAMPLE_QUESTIONS } from '../utils/sampleData';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Calculator,
  HelpCircle,
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: OralQuestion[];
  onUpdateQuestions: (questions: OralQuestion[]) => void;
}

export const QuestionManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [newSubject, setNewSubject] = useState<string>('Toán học');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isBatchImport, setIsBatchImport] = useState<boolean>(false);
  const [batchText, setBatchText] = useState<string>('');

  if (!isOpen) return null;

  // Subjects extracted from questions
  const subjects = ['Tất cả', ...Array.from(new Set(questions.map(q => q.subject)))];

  const filteredQuestions = selectedSubject === 'Tất cả'
    ? questions
    : questions.filter(q => q.subject === selectedSubject);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: OralQuestion = {
      id: `q-${Date.now()}`,
      subject: newSubject.trim() || 'Toán học',
      question: newQuestionText.trim(),
      difficulty: newDifficulty
    };
    onUpdateQuestions([newQ, ...questions]);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (id: string) => {
    onUpdateQuestions(questions.filter(q => q.id !== id));
  };

  const handleStartEdit = (q: OralQuestion) => {
    setEditingId(q.id);
    setEditingText(q.question);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    onUpdateQuestions(
      questions.map(q => q.id === id ? { ...q, question: editingText.trim() } : q)
    );
    setEditingId(null);
  };

  const handleResetSampleQuestions = () => {
    if (window.confirm('Khôi phục danh sách câu hỏi mẫu chuẩn công thức Toán, Lý, Hóa?')) {
      onUpdateQuestions(SAMPLE_QUESTIONS);
    }
  };

  const handleBatchImport = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split('\n').map(l => l.trim()).filter(Boolean);
    const imported: OralQuestion[] = lines.map((line, idx) => ({
      id: `q-import-${Date.now()}-${idx}`,
      subject: newSubject,
      question: line,
      difficulty: 'Trung bình'
    }));
    onUpdateQuestions([...imported, ...questions]);
    setBatchText('');
    setIsBatchImport(false);
  };

  // Quick Math Snippet Helper
  const insertMathSnippet = (snippet: string) => {
    setNewQuestionText(prev => prev + snippet);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Ngân hàng câu hỏi kiểm tra
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Hỗ trợ đầy đủ công thức Toán (LaTeX: <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono text-[11px]">$...$</code>)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader / Tabs */}
          <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsBatchImport(!isBatchImport)}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                {isBatchImport ? 'Thêm từng câu' : 'Dán nhiều câu'}
              </button>

              <button
                onClick={handleResetSampleQuestions}
                className="p-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 cursor-pointer"
                title="Khôi phục danh sách mẫu chuẩn"
              >
                <RotateCcw className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Form: Add Question or Batch Import */}
            {isBatchImport ? (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">
                    Dán danh sách câu hỏi (Mỗi câu 1 dòng):
                  </span>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="text-xs font-bold px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-slate-800"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="KHTN">KHTN</option>
                  </select>
                </div>
                <textarea
                  value={batchText}
                  onChange={e => setBatchText(e.target.value)}
                  placeholder="Dán câu hỏi vào đây, mỗi dòng là một câu... Có thể gõ công thức Toán như $x^2 - 4x + 3 = 0$"
                  rows={4}
                  className="w-full p-3 rounded-xl bg-white border border-blue-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBatchImport}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Xác nhận thêm danh sách
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    Thêm câu hỏi mới:
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="text-xs font-bold px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-slate-800"
                    >
                      <option value="Toán học">Toán học</option>
                      <option value="Vật lý">Vật lý</option>
                      <option value="Hóa học">Hóa học</option>
                      <option value="Ngữ văn">Ngữ văn</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                      <option value="Lịch sử">Lịch sử</option>
                      <option value="Địa lý">Địa lý</option>
                      <option value="Sinh học">Sinh học</option>
                    </select>

                    <select
                      value={newDifficulty}
                      onChange={e => setNewDifficulty(e.target.value as any)}
                      className="text-xs font-bold px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-slate-800"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                </div>

                {/* Math Formula Quick Snippets Toolbar */}
                <div className="flex items-center gap-1 overflow-x-auto py-1 text-[11px] text-stone-600">
                  <span className="text-stone-400 font-semibold shrink-0">Chèn nhanh:</span>
                  {[
                    { label: 'Phân số a/b', code: '$\\frac{a}{b}$' },
                    { label: 'Căn bậc 2', code: '$\\sqrt{x}$' },
                    { label: 'Mũ x²', code: '$x^2$' },
                    { label: 'Tích phân', code: '$\\int_{a}^{b} f(x)dx$' },
                    { label: 'Vector', code: '$\\vec{v}$' },
                    { label: 'Delta Δ', code: '$\\Delta$' },
                    { label: 'Pi π', code: '$\\pi$' },
                    { label: 'Giới hạn lim', code: '$\\lim_{x \\to 0}$' }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => insertMathSnippet(item.code)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-emerald-100 border border-stone-200 text-stone-700 whitespace-nowrap font-mono text-[10px] cursor-pointer"
                      title={item.code}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi... Đặt công thức Toán giữa hai dấu $ như $f(x) = x^2 - 4x + 3$"
                    rows={2}
                    className="w-full p-3 rounded-xl bg-white border border-emerald-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Live Formula Preview Box (Shows real KaTeX math as teacher types!) */}
                {newQuestionText && newQuestionText.includes('$') && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                      Xem trước công thức hiển thị:
                    </span>
                    <div className="text-sm text-slate-900">
                      <MathRenderer text={newQuestionText} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestionText.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào ngân hàng
                  </button>
                </div>
              </div>
            )}

            {/* List of Questions */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Danh sách câu hỏi hiện tại ({filteredQuestions.length}):
              </span>

              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Chưa có câu hỏi nào trong danh mục này. Hãy thêm câu hỏi mới ở trên!
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isEditing = editingId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            {q.subject}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                            q.difficulty === 'Khó'
                              ? 'bg-rose-100 text-rose-800'
                              : q.difficulty === 'Trung bình'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {q.difficulty || 'Trung bình'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(q.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Lưu"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(q)}
                              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 cursor-pointer"
                              title="Sửa câu hỏi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-600 cursor-pointer"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text / Editor */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            rows={2}
                            className="w-full p-2.5 rounded-xl bg-white border border-emerald-400 text-xs text-slate-800 focus:outline-none"
                          />
                          {editingText.includes('$') && (
                            <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                              <MathRenderer text={editingText} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                          <MathRenderer text={q.question} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              💡 Mẹo: Gõ <code className="text-emerald-700 font-bold">$công thức$</code> để tự động biến thành công thức Toán chuẩn SGK.
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
