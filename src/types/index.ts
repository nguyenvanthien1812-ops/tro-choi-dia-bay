export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  isPresent: boolean;
  isCalled: boolean;
  calledCount: number;
  lastScore?: number;
  lastNote?: string;
  avatarUrl?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
}

export interface OralQuestion {
  id: string;
  subject: string;
  question: string;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó';
}

export interface AbductedStudent {
  student: Student;
  assignedQuestion?: OralQuestion;
  score?: number;
  note?: string;
  abductedAt: string;
}

export type GamePhase = 'IDLE' | 'SCANNING' | 'TARGETING' | 'ABDUCTING' | 'COMPLETED';
