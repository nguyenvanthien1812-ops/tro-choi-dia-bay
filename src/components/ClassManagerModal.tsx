import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassRoom, Student } from '../types';
import { INITIAL_CLASSES } from '../utils/sampleData';
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  FileText, 
  Check, 
  Users, 
  Sparkles,
  UserCheck,
  UserX,
  Edit2,
  Save,
  BookOpen
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onCreateClass: (newClass: ClassRoom) => void;
  onDeleteClass: (id: string) => void;
  onResetCalledStatus: () => void;
}

export const ClassManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onSelectClass,
  onUpdateClass,
  onCreateClass,
  onDeleteClass,
  onResetCalledStatus,
}) => {
  const [isImportMode, setIsImportMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === activeClassId) || classes[0];

  const handleTogglePresent = (studentId: string) => {
    if (!currentClass) return;
    const updated = {
      ...currentClass,
      students: currentClass.students.map(s => 
        s.id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    };
    onUpdateClass(updated);
  };

  const handleToggleGender = (studentId: string) => {
    if (!currentClass) return;
    const updated = {
      ...currentClass,
      students: currentClass.students.map(s => 
        s.id === studentId ? { ...s, gender: (s.gender === 'female' ? 'male' : 'female') as 'male' | 'female' } : s
      )
    };
    onUpdateClass(updated);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!currentClass) return;
    const updated = {
      ...currentClass,
      students: currentClass.students.filter(s => s.id !== studentId)
    };
    onUpdateClass(updated);
  };

  const handleStartEdit = (st: Student) => {
    setEditingStudentId(st.id);
    setEditingNameValue(st.name);
  };

  const handleSaveEdit = (studentId: string) => {
    if (!currentClass || !editingNameValue.trim()) {
      setEditingStudentId(null);
      return;
    }
    const updated = {
      ...currentClass,
      students: currentClass.students.map(s => 
        s.id === studentId ? { ...s, name: editingNameValue.trim() } : s
      )
    };
    onUpdateClass(updated);
    setEditingStudentId(null);
  };

  const handleAddSingleStudent = () => {
    if (!newStudentName.trim() || !currentClass) return;
    const newStudent: Student = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newStudentName.trim(),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      isPresent: true,
      isCalled: false,
      calledCount: 0
    };

    const updated = {
      ...currentClass,
      students: [...currentClass.students, newStudent]
    };
    onUpdateClass(updated);
    setNewStudentName('');
  };

  const handleImportTextSubmit = () => {
    if (!importText.trim()) return;

    const names = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[\.\-\)\s]+\s*/, '')); // Strip numbers like "1. ", "01 - "

    const newStudents: Student[] = names.map((name, idx) => ({
      id: `st-imp-${Date.now()}-${idx}`,
      name,
      gender: idx % 2 === 0 ? 'male' : 'female',
      isPresent: true,
      isCalled: false,
      calledCount: 0
    }));

    if (currentClass) {
      const updated = {
        ...currentClass,
        students: newStudents
      };
      onUpdateClass(updated);
    }

    setIsImportMode(false);
    setImportText('');
  };

  const handleCreateNewClass = () => {
    const title = newClassName.trim() || `Lớp học Mới (${classes.length + 1})`;
    const newClassObj: ClassRoom = {
      id: `cls-${Date.now()}`,
      name: title,
      students: INITIAL_CLASSES[0].students.map(s => ({ ...s, isCalled: false }))
    };
    onCreateClass(newClassObj);
    onSelectClass(newClassObj.id);
    setNewClassName('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                  Quản lý & Chỉnh sửa danh sách học sinh
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Bấm trực tiếp vào tên để sửa, dán cả lớp từ Excel hoặc thêm bớt học sinh
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Class Tabs Bar */}
          <div className="px-5 py-2.5 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    cls.id === activeClassId
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cls.name} ({cls.students.length})
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateNewClass}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo lớp mới
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <button
                onClick={onResetCalledStatus}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại lượt gọi (Gọi lại từ đầu)
              </button>

              <button
                onClick={() => setIsImportMode(!isImportMode)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                {isImportMode ? 'Quay lại danh sách' : 'Dán danh sách từ Excel / Word'}
              </button>
            </div>

            {/* Mode 1: Paste Multiple Names from Excel / Word */}
            {isImportMode ? (
              <div className="space-y-3 bg-sky-50/60 p-4 rounded-2xl border border-sky-200">
                <h3 className="font-bold text-sm text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Dán nhanh danh sách học sinh từ file Excel hoặc Word
                </h3>
                <p className="text-xs text-sky-700 leading-relaxed">
                  Chỉ cần copy cả cột họ và tên từ bảng Excel rồi Ctrl+V vào đây (mỗi học sinh 1 dòng). Hệ thống sẽ tự động lọc số thứ tự và tạo nhân vật tương ứng.
                </p>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder={`1. Nguyễn Văn An\n2. Trần Thị Bình\n3. Lê Hoàng Cường\n4. Phạm Thu Dung...`}
                  className="w-full p-3 bg-white border border-stone-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsImportMode(false)}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleImportTextSubmit}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Lưu danh sách lớp
                  </button>
                </div>
              </div>
            ) : (
              /* Mode 2: Student List with Inline Edit */
              <div className="space-y-3">
                {/* Single Add Student Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSingleStudent()}
                    placeholder="Nhập tên học sinh mới..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    onClick={handleAddSingleStudent}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>

                {/* Table / List */}
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto bg-white">
                  {currentClass?.students.map((st, idx) => (
                    <div
                      key={st.id}
                      className={`p-2.5 px-3 flex items-center justify-between gap-3 text-sm transition-colors ${
                        st.isCalled ? 'bg-amber-50/60' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-6 text-xs text-stone-400 font-mono font-bold shrink-0">
                          {idx + 1}.
                        </span>

                        {/* Inline Name Edit */}
                        {editingStudentId === st.id ? (
                          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                            <input
                              type="text"
                              value={editingNameValue}
                              onChange={e => setEditingNameValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEdit(st.id);
                                if (e.key === 'Escape') setEditingStudentId(null);
                              }}
                              autoFocus
                              className="px-2 py-1 text-sm font-semibold border-2 border-emerald-500 rounded-lg focus:outline-none w-full"
                            />
                            <button
                              onClick={() => handleSaveEdit(st.id)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Lưu"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-1.5 cursor-pointer group flex-1"
                            onClick={() => handleStartEdit(st)}
                            title="Bấm để đổi tên học sinh"
                          >
                            <span className={`font-semibold ${st.isCalled ? 'line-through text-amber-800' : 'text-stone-900'}`}>
                              {st.name}
                            </span>
                            <Edit2 className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {st.isCalled && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                                Đã bị bắt 🛸
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Gender Toggle (Boy / Girl) */}
                        <button
                          onClick={() => handleToggleGender(st.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            st.gender === 'female'
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          title="Đổi giới tính hình tượng (Nam / Nữ)"
                        >
                          {st.gender === 'female' ? 'Nữ 👧' : 'Nam 👦'}
                        </button>

                        {/* Attendance Toggle */}
                        <button
                          onClick={() => handleTogglePresent(st.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            st.isPresent
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                          title="Đổi trạng thái Có mặt / Vắng mặt"
                        >
                          {st.isPresent ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {st.isPresent ? 'Có mặt' : 'Vắng'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveStudent(st.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa học sinh này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              Tổng số: {currentClass?.students.length || 0} học sinh ({currentClass?.students.filter(s => s.isPresent).length || 0} có mặt)
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
