import { AngleCategoryId, classifyAngle } from './angleMath';

export type ChallengeLevel = 1 | 2 | 3;

export interface ChallengeQuestion {
  id: string;
  level: ChallengeLevel;
  questionType: 'identify_type' | 'estimate_measure' | 'missing_angle' | 'measure_with_protractor';
  promptVi: string;
  angleDeg: number;
  baseRayAngleDeg: number;
  options?: string[];
  correctOptionIndex?: number;
  targetMeasureDeg?: number;
  explanationVi: string;
  planetNameVi: string;
}

export interface PlayerProgress {
  stars: number;
  completedSections: {
    explore: boolean;
    lab: boolean;
    tutorial: boolean;
    library: boolean;
    level1: boolean;
    level2: boolean;
    level3: boolean;
  };
  highScores: {
    level1: number;
    level2: number;
    level3: number;
  };
  badges: string[];
  measuredAnglesCount: number;
}

export const INITIAL_PROGRESS: PlayerProgress = {
  stars: 0,
  completedSections: {
    explore: false,
    lab: false,
    tutorial: false,
    library: false,
    level1: false,
    level2: false,
    level3: false,
  },
  highScores: {
    level1: 0,
    level2: 0,
    level3: 0,
  },
  badges: [],
  measuredAnglesCount: 0,
};

export interface BadgeInfo {
  id: string;
  titleVi: string;
  descVi: string;
  color: string;
  unlocked: (p: PlayerProgress) => boolean;
}

export const BADGE_CATALOG: BadgeInfo[] = [
  {
    id: 'explorer_badge',
    titleVi: 'Nhà Thám Hiểm Góc',
    descVi: 'Khám phá trọn vẹn Bảo tàng các loại góc 3D',
    color: '#FACC15',
    unlocked: (p) => p.completedSections.explore,
  },
  {
    id: 'tutorial_badge',
    titleVi: 'Phi Công Căn Chỉnh',
    descVi: 'Hoàn thành bài học 3 bước đặt thước đo góc chuẩn xác',
    color: '#38BDF8',
    unlocked: (p) => p.completedSections.tutorial,
  },
  {
    id: 'lab_scientist',
    titleVi: 'Chuyên Gia Thí Nghiệm',
    descVi: 'Thực hành đo chính xác ít nhất 3 góc tại Phòng Thí Nghiệm 180°',
    color: '#22C55E',
    unlocked: (p) => p.measuredAnglesCount >= 3 || p.completedSections.lab,
  },
  {
    id: 'planet_1_hero',
    titleVi: 'Nhà Du Hành Tập Sự',
    descVi: 'Vượt qua Cấp độ 1 tại Hành Tinh Sao Thủy',
    color: '#FF2E93',
    unlocked: (p) => p.completedSections.level1,
  },
  {
    id: 'planet_2_hero',
    titleVi: 'Nhà Khoa Học Nhí',
    descVi: 'Vượt qua Cấp độ 2 tại Hành Tinh Sao Mộc',
    color: '#A855F7',
    unlocked: (p) => p.completedSections.level2,
  },
  {
    id: 'master_protractor',
    titleVi: 'Bậc Thầy Đo Góc 180°',
    descVi: 'Chinh phục Cấp độ 3 bằng thước đo góc bán nguyệt',
    color: '#F97316',
    unlocked: (p) => p.completedSections.level3,
  },
];

export function calculateStarReward(correctCount: number, totalQuestions = 10): number {
  if (totalQuestions <= 0) return 0;
  const ratio = correctCount / totalQuestions;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

export function computeOverallProgressPercent(p: PlayerProgress): number {
  const keys = Object.keys(p.completedSections) as Array<keyof PlayerProgress['completedSections']>;
  const doneCount = keys.filter((k) => p.completedSections[k]).length;
  return Math.round((doneCount / keys.length) * 100);
}

const LEVEL1_BANK: Omit<ChallengeQuestion, 'id'>[] = [
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát mô hình hai tia bên dưới. Đây là loại góc gì?',
    angleDeg: 45,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 0,
    explanationVi: 'Góc có độ mở 45° nhỏ hơn góc vuông (90°) nên là Góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Góc có ký hiệu ô vuông nhỏ ở đỉnh O và số đo 90° được gọi là góc gì?',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 1,
    explanationVi: 'Góc có số đo đúng bằng 90° luôn là Góc vuông.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Góc mở rộng hơn góc vuông nhưng chưa tạo thành đường thẳng (120°) là góc gì?',
    angleDeg: 120,
    baseRayAngleDeg: 10,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: 'Góc 120° lớn hơn 90° và nhỏ hơn 180° nên là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Hai tia đối nhau tạo thành một đường thẳng qua đỉnh O (180°) là góc gì?',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 3,
    explanationVi: 'Góc có số đo bằng 180° (hai cạnh tạo thành đường thẳng) là Góc bẹt.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Cánh quạt năng lượng mặt trời đang mở một góc 30°. Đó là loại góc nào?',
    angleDeg: 30,
    baseRayAngleDeg: 15,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 0,
    explanationVi: 'Vì 30° < 90° nên đây là Góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Ăng-ten radar trạm vũ trụ mở một góc 150°. Đây là loại góc nào?',
    angleDeg: 150,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: 'Vì 90° < 150° < 180° nên đây là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Tia laser định vị tạo góc 60° so với mặt sàn tàu. Đó là góc gì?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 0,
    explanationVi: 'Số đo 60° nhỏ hơn 90° nên là Góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Góc tạo bởi kim giờ và kim phút lúc 3 giờ đúng (90°) là góc gì?',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 1,
    explanationVi: 'Lúc 3 giờ đúng, hai kim đồng hồ vuông góc với nhau tạo thành Góc vuông 90°.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Góc tạo bởi kim giờ và kim phút lúc 6 giờ đúng (180°) là góc gì?',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 3,
    explanationVi: 'Lúc 6 giờ đúng, hai kim thẳng hàng tạo thành Góc bẹt 180°.',
    planetNameVi: 'Trạm Sao Thủy',
  },
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Cánh tay Robot Toán học mở góc 135°. Em hãy phân loại góc này!',
    angleDeg: 135,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: '135° lớn hơn 90° và nhỏ hơn 180° nên là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
  },
];

const LEVEL2_BANK: Omit<ChallengeQuestion, 'id'>[] = [
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Góc nhọn trong hình dưới đây có số đo phù hợp nhất là bao nhiêu?',
    angleDeg: 45,
    baseRayAngleDeg: 0,
    options: ['45°', '90°', '135°', '180°'],
    correctOptionIndex: 0,
    explanationVi: 'Đây là góc nhọn nằm chính giữa 0° và 90°, nên số đo đúng là 45°.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Đơn vị chuẩn dùng để đo góc trong Toán học tiểu học là gì?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['Độ (°)', 'Xăng-ti-mét (cm)', 'Ki-lô-gam (kg)', 'Lít (l)'],
    correctOptionIndex: 0,
    explanationVi: 'Đơn vị đo góc là Độ, ký hiệu là dấu tròn nhỏ ở góc trên bên phải (°).',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Một góc vuông (90°) được chia làm 2 góc nhỏ. Biết góc thứ nhất bằng 30°, góc còn lại bằng bao nhiêu độ?',
    angleDeg: 60,
    baseRayAngleDeg: 30,
    options: ['50°', '60°', '70°', '150°'],
    correctOptionIndex: 1,
    explanationVi: 'Vì tổng hai góc là góc vuông 90°, nên góc còn lại là 90° - 30° = 60°.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Trong các số đo sau: 35°, 90°, 120°, 180°, số đo nào là của một Góc tù?',
    angleDeg: 120,
    baseRayAngleDeg: 0,
    options: ['35°', '90°', '120°', '180°'],
    correctOptionIndex: 2,
    explanationVi: 'Góc tù lớn hơn 90° và nhỏ hơn 180°, nên 120° là đáp án chính xác.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Góc bẹt có số đo gấp mấy lần số đo của một góc vuông?',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: ['Gấp 2 lần (180° = 2 × 90°)', 'Gấp 3 lần', 'Bằng nhau', 'Gấp 4 lần'],
    correctOptionIndex: 0,
    explanationVi: 'Góc bẹt bằng 180°, góc vuông bằng 90°. Vậy 180° : 90° = 2 lần.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Quan sát góc tù rộng 150° dưới đây. Chọn số đo đúng của góc!',
    angleDeg: 150,
    baseRayAngleDeg: 0,
    options: ['30°', '60°', '90°', '150°'],
    correctOptionIndex: 3,
    explanationVi: 'Góc mở rất rộng gần tới góc bẹt 180° (nhiều bạn đọc nhầm vòng số ngược thành 30°), đáp án đúng là 150°.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Hai góc kề nhau tạo thành một góc bẹt (180°). Biết góc thứ nhất là 110°, góc thứ hai là bao nhiêu?',
    angleDeg: 70,
    baseRayAngleDeg: 0,
    options: ['60°', '70°', '80°', '90°'],
    correctOptionIndex: 1,
    explanationVi: 'Ta lấy số đo góc bẹt trừ đi góc đã biết: 180° - 110° = 70°.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Sắp xếp các loại góc theo thứ tự số đo TĂNG DẦN (từ bé đến lớn):',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: [
      'Góc nhọn → Góc vuông → Góc tù → Góc bẹt',
      'Góc vuông → Góc nhọn → Góc tù → Góc bẹt',
      'Góc nhọn → Góc tù → Góc vuông → Góc bẹt',
      'Góc bẹt → Góc tù → Góc vuông → Góc nhọn',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Thứ tự tăng dần đúng là: Góc nhọn (<90°) → Góc vuông (90°) → Góc tù (90°..180°) → Góc bẹt (180°).',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Góc trong hình lớn hơn góc vuông 45° (90° + 45°). Số đo của góc này là bao nhiêu?',
    angleDeg: 135,
    baseRayAngleDeg: 0,
    options: ['45°', '115°', '135°', '165°'],
    correctOptionIndex: 2,
    explanationVi: '90° + 45° = 135° (Góc tù).',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Khi tia gốc trùng với vạch 0° bên trái của thước đo góc bán nguyệt, cạnh thứ hai đi qua vạch 60° (dãy ngoài) và 120° (dãy trong). Góc đó bằng bao nhiêu độ?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['60°', '120°', '180°', '30°'],
    correctOptionIndex: 0,
    explanationVi: 'Vì tia gốc đặt ở vạch 0° dãy ngoài (bên trái), ta phải đọc theo dãy số bắt đầu từ 0° đó, nên kết quả là 60°.',
    planetNameVi: 'Vành Đai Sao Mộc',
  },
];

const LEVEL3_ANGLES = [30, 45, 60, 75, 90, 105, 120, 135, 150, 180];

/**
 * Generate a 10-question set for the requested challenge level
 */
export function generateChallengeQuestions(level: ChallengeLevel): ChallengeQuestion[] {
  if (level === 1) {
    return LEVEL1_BANK.map((q, idx) => ({
      ...q,
      id: `l1_q_${idx + 1}`,
    }));
  }

  if (level === 2) {
    return LEVEL2_BANK.map((q, idx) => ({
      ...q,
      id: `l2_q_${idx + 1}`,
    }));
  }

  // Level 3: Bậc Thầy Đo Góc (interactive 180° protractor measurement tasks)
  return LEVEL3_ANGLES.map((deg, idx) => {
    const baseRotations = [0, 15, 0, -15, 0, 10, 0, 20, 0, 0];
    const baseRay = baseRotations[idx % baseRotations.length];
    const cls = classifyAngle(deg);
    return {
      id: `l3_q_${idx + 1}`,
      level: 3,
      questionType: 'measure_with_protractor',
      promptVi: `Câu ${idx + 1}: Hãy kéo tâm thước trùng đỉnh O, xoay vạch 0° trùng tia OA và nhập chính xác số đo góc AOB!`,
      angleDeg: deg,
      baseRayAngleDeg: baseRay,
      targetMeasureDeg: deg,
      explanationVi: `Khi đặt tâm thước tại O và vạch 0° trùng tia OA, tia OB đi qua vạch ${deg}°. Đây là ${cls.nameVi} (${deg}°).`,
      planetNameVi: 'Tinh Vân Thước Đo 180°',
    };
  });
}
