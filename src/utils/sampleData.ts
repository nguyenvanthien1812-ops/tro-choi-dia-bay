import { ClassRoom, OralQuestion } from '../types';

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class-mau',
    name: 'Lớp mẫu',
    students: [
      { id: 'st-1', name: 'Minh Anh', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-2', name: 'Anh Khoa', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-3', name: 'Minh Khang', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-4', name: 'Hà My', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-5', name: 'Đình Phong', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-6', name: 'Bảo An', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-7', name: 'Hồng Nhung', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-8', name: 'Yến Nhi', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-9', name: 'Khánh Ngân', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-10', name: 'Bảo Ngọc', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-11', name: 'Đức Huy', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-12', name: 'Hoàng Nam', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-13', name: 'Gia Bảo', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-14', name: 'Thanh Trúc', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-15', name: 'Quốc Bảo', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-16', name: 'Nhật Minh', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-17', name: 'Hải Đăng', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-18', name: 'Thanh Tâm', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-19', name: 'Thành Đạt', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-20', name: 'Khánh Vy', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-21', name: 'Thu Hà', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-22', name: 'Tuấn Kiệt', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-23', name: 'Ngọc Linh', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-24', name: 'Thiên Phúc', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-25', name: 'Trọng Nhân', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-26', name: 'Đức Anh', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-27', name: 'Đăng Khoa', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-28', name: 'Ngọc Mai', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-29', name: 'Phương Linh', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-30', name: 'Tiến Dũng', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-31', name: 'Thùy Dương', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-32', name: 'Văn Hậu', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 }
    ]
  },
  {
    id: 'class-12a1',
    name: 'Lớp 12A1 (Toán & KHTN)',
    students: [
      { id: 'st-101', name: 'Đoàn Minh Đức', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-102', name: 'Nguyễn Bùi Gia Huy', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-103', name: 'Lê Phương Linh', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-104', name: 'Phạm Quỳnh Anh', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-105', name: 'Trần Đức Trung', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-106', name: 'Vũ Hải Khánh', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-107', name: 'Nguyễn Hoàng Nam', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-108', name: 'Mai Bảo Ngọc', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-109', name: 'Phan Minh Khoa', gender: 'male', isPresent: true, isCalled: false, calledCount: 0 },
      { id: 'st-110', name: 'Đào Bích Phương', gender: 'female', isPresent: true, isCalled: false, calledCount: 0 }
    ]
  }
];

export const FUNNY_QUOTES = [
  "Chuông reo là cả lớp tỉnh hẳn!",
  "Đôi giày mới chạy êm ghê.",
  "Hôm nay ai lên bảng ta?",
  "Bác xe ôm chờ khách nãy giờ kìa.",
  "Bánh mì nóng giòn thơm nức mũi luôn!",
  "Hy vọng chuyến này UFO tha cho mình..."
];

export const PANIC_QUOTES = [
  "Thầy ơi cứu em!",
  "Em thuộc bài rồi mà!",
  "Bám chặt không buông!",
  "Chuyến này xong rồi...",
  "Sắp tuột tay rồi!",
  "Đừng bắt em đi mà!",
  "Ai cứu tui với!"
];

export const SAMPLE_QUESTIONS: OralQuestion[] = [
  {
    id: 'q-1',
    subject: 'Toán học',
    question: 'Nêu công thức tính thể tích khối chóp $V = \\frac{1}{3} S_{đáy} \\cdot h$ và áp dụng tính khi cạnh đáy $a = 4\\text{ cm}, h = 6\\text{ cm}$?',
    difficulty: 'Dễ'
  },
  {
    id: 'q-2',
    subject: 'Toán học',
    question: 'Tìm nghiệm của phương trình bậc hai: $2x^2 - 5x + 2 = 0$ và tính biệt thức $\\Delta$?',
    difficulty: 'Trung bình'
  },
  {
    id: 'q-3',
    subject: 'Toán học',
    question: 'Tính đạo hàm của hàm số phân thức: $y = \\frac{2x - 1}{x + 3}$ tại điểm $x_0 = 1$?',
    difficulty: 'Trung bình'
  },
  {
    id: 'q-4',
    subject: 'Vật lý',
    question: 'Viết công thức tính chu kì dao động của con lắc đơn $T = 2\\pi \\sqrt{\\frac{l}{g}}$ và giải thích các đại lượng?',
    difficulty: 'Dễ'
  },
  {
    id: 'q-5',
    subject: 'Hóa học',
    question: 'Cân bằng phản ứng oxi hóa - khử sau: $\\text{Fe}_3\\text{O}_4 + \\text{HNO}_3 \\rightarrow \\text{Fe}(\\text{NO}_3)_3 + \\text{NO} \\uparrow + \\text{H}_2\\text{O}$?',
    difficulty: 'Khó'
  },
  {
    id: 'q-6',
    subject: 'Ngữ văn',
    question: 'Trình bày ngắn gọn hoàn cảnh sáng tác và cảm hứng lãng mạn, bi tráng của bài thơ Tây Tiến (Quang Dũng)?',
    difficulty: 'Trung bình'
  },
  {
    id: 'q-7',
    subject: 'Tiếng Anh',
    question: 'State the rule and write an example of Conditional Sentence Type 2 (Câu điều kiện loại 2)?',
    difficulty: 'Dễ'
  }
];
