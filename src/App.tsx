import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClassRoom, 
  Student, 
  GamePhase, 
  AbductedStudent, 
  OralQuestion 
} from './types';
import { INITIAL_CLASSES, SAMPLE_QUESTIONS } from './utils/sampleData';
import { soundEngine } from './utils/audio';
import { StreetCanvas } from './components/StreetCanvas';
import { HeaderBar } from './components/HeaderBar';
import { TopNoticeCard } from './components/TopNoticeCard';
import { ControlBar } from './components/ControlBar';
import { IntergalacticSummonsModal } from './components/IntergalacticSummonsModal';
import { ClassManagerModal } from './components/ClassManagerModal';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { HistoryDrawer } from './components/HistoryDrawer';

export default function App() {
  // 1. Classes State (persisted to localStorage)
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('ufo_picker_classes');
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => classes[0]?.id || 'class-mau');

  useEffect(() => {
    try {
      localStorage.setItem('ufo_picker_classes', JSON.stringify(classes));
    } catch {
      // ignore
    }
  }, [classes]);

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  // 2. Questions State
  const [questions, setQuestions] = useState<OralQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('ufo_picker_questions');
      return saved ? JSON.parse(saved) : SAMPLE_QUESTIONS;
    } catch {
      return SAMPLE_QUESTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ufo_picker_questions', JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  // 3. Game & UFO State
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  const [targetCount, setTargetCount] = useState<number>(2);
  const [abductedInRound, setAbductedInRound] = useState<AbductedStudent[]>([]);
  const [history, setHistory] = useState<AbductedStudent[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>('Phù... chuyến này thoát rồi! Ai sẽ là người tiếp theo?');

  // Modals
  const [isSummonsModalOpen, setIsSummonsModalOpen] = useState<boolean>(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    soundEngine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const handleStartRound = useCallback(() => {
    if (!activeClass) return;
    const availableStudents = activeClass.students.filter(s => s.isPresent && !s.isCalled);
    if (availableStudents.length === 0) {
      alert('Tất cả học sinh trong danh sách đã được gọi! Vui lòng bấm "Vòng mới" hoặc "Đặt lại lượt gọi" trong phần Cài đặt.');
      return;
    }

    setAbductedInRound([]);
    setPhase('SCANNING');
    setStatusText('Bám chặt nhé! UFO đang dò tín hiệu...');
    soundEngine.startUfoHum();
    soundEngine.playScanBeam();

    setTimeout(() => {
      setStatusText(prev => prev.includes('dò tín hiệu') ? 'Bạn nào sắp tuột tay đây...' : prev);
    }, 2800);
  }, [activeClass]);

  const handleStopRound = useCallback(() => {
    setPhase('IDLE');
    setStatusText('Phù... chuyến này thoát rồi! Ai sẽ là người tiếp theo?');
    soundEngine.stopUfoHum();
  }, []);

  const handleStudentTargeted = useCallback((studentName: string) => {
    setStatusText(`Đã tìm thấy ${studentName}!`);
  }, []);

  const handleStudentAbducted = useCallback((student: Student) => {
    soundEngine.playAbductZap();

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const abductedItem: AbductedStudent = {
      student,
      abductedAt: timeStr
    };

    setAbductedInRound(prev => [...prev, abductedItem]);
    setHistory(prev => [abductedItem, ...prev]);

    setClasses(prev => prev.map(c => {
      if (c.id !== activeClassId) return c;
      return {
        ...c,
        students: c.students.map(s => s.id === student.id ? { ...s, isCalled: true, calledCount: s.calledCount + 1 } : s)
      };
    }));
  }, [activeClassId]);

  const handleAllAbductionsComplete = useCallback(() => {
    setPhase('COMPLETED');
    setStatusText('Đã đón đủ hành khách!');
    soundEngine.stopUfoHum();
    soundEngine.playFanfare();

    setTimeout(() => {
      setIsSummonsModalOpen(true);
    }, 600);
  }, []);

  // Keyboard Space Bar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return;
        }

        e.preventDefault();
        if (phase === 'IDLE' || phase === 'COMPLETED') {
          setIsSummonsModalOpen(false);
          handleStartRound();
        } else {
          handleStopRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleStartRound, handleStopRound]);

  const handleUpdateClass = (updatedClass: ClassRoom) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleCreateClass = (newClass: ClassRoom) => {
    setClasses(prev => [...prev, newClass]);
  };

  const handleDeleteClass = (id: string) => {
    if (classes.length <= 1) return;
    setClasses(prev => prev.filter(c => c.id !== id));
    if (activeClassId === id) {
      setActiveClassId(classes[0].id);
    }
  };

  const handleResetCalledStatus = () => {
    setClasses(prev => prev.map(c => {
      if (c.id !== activeClassId) return c;
      return {
        ...c,
        students: c.students.map(s => ({ ...s, isCalled: false }))
      };
    }));
    setStatusText('Phù... chuyến này thoát rồi! Ai sẽ là người tiếp theo?');
  };

  const isUfoActive = phase === 'SCANNING' || phase === 'TARGETING' || phase === 'ABDUCTING';
  const activeStudentCount = activeClass ? activeClass.students.filter(s => s.isPresent).length : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 font-sans select-none">
      {/* Top Header Bar */}
      <HeaderBar
        classes={classes}
        activeClassId={activeClassId}
        onSelectClass={setActiveClassId}
        onOpenClassManager={() => setIsClassModalOpen(true)}
        onOpenQuestionManager={() => setIsQuestionModalOpen(true)}
      />

      {/* Dynamic Top Notice Card Banner */}
      <TopNoticeCard
        statusText={statusText}
        studentCount={activeStudentCount}
        isUfoActive={isUfoActive}
        onOpenClassManager={() => setIsClassModalOpen(true)}
      />

      {/* Main Street Canvas */}
      <StreetCanvas
        students={activeClass?.students || []}
        phase={phase}
        targetCount={targetCount}
        abductedCount={abductedInRound.length}
        onStudentTargeted={handleStudentTargeted}
        onStatusChange={setStatusText}
        onAbductionComplete={handleStudentAbducted}
        onAllAbductionsComplete={handleAllAbductionsComplete}
      />

      {/* Bottom Control Toolbar */}
      <ControlBar
        phase={phase}
        targetCount={targetCount}
        onSetTargetCount={setTargetCount}
        onStart={handleStartRound}
        onStop={handleStopRound}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenClassManager={() => setIsClassModalOpen(true)}
        onOpenQuestionManager={() => setIsQuestionModalOpen(true)}
        onNewRound={() => {
          setIsSummonsModalOpen(false);
          handleResetCalledStatus();
          handleStartRound();
        }}
      />

      {/* Result Modal & Management Modals */}
      <IntergalacticSummonsModal
        isOpen={isSummonsModalOpen}
        abductedStudents={abductedInRound}
        questions={questions}
        onNewRound={() => {
          setIsSummonsModalOpen(false);
          handleStartRound();
        }}
        onClose={() => {
          setIsSummonsModalOpen(false);
          setStatusText('Phù... chuyến này thoát rồi! Ai sẽ là người tiếp theo?');
        }}
      />

      <ClassManagerModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        activeClassId={activeClassId}
        onSelectClass={setActiveClassId}
        onUpdateClass={handleUpdateClass}
        onCreateClass={handleCreateClass}
        onDeleteClass={handleDeleteClass}
        onResetCalledStatus={handleResetCalledStatus}
      />

      <QuestionManagerModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        questions={questions}
        onUpdateQuestions={setQuestions}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
