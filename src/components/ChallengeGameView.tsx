import React, { useEffect, useState } from 'react';
import {
  classifyAngle,
  evaluateProtractorAlignment,
  polarToSvgCartesian,
  ProtractorState,
} from '../utils/angleMath';
import {
  calculateStarReward,
  ChallengeLevel,
  ChallengeQuestion,
  generateChallengeQuestions,
} from '../utils/challengeGenerator';
import { soundFX } from '../utils/soundEffects';
import { SemicircleProtractorSVG } from './SemicircleProtractorSVG';

interface ChallengeGameViewProps {
  onFinishChallengeLevel: (level: ChallengeLevel, score: number, starsEarned: number) => void;
  onAngleChangeFor3D: (deg: number) => void;
  onBackHome: () => void;
}

export const ChallengeGameView: React.FC<ChallengeGameViewProps> = ({
  onFinishChallengeLevel,
  onAngleChangeFor3D,
  onBackHome,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(180);

  const [questions, setQuestions] = useState<ChallengeQuestion[]>(() =>
    generateChallengeQuestions(1)
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredState, setAnsweredState] = useState<{
    isCorrect: boolean;
    selectedIdx?: number;
    submittedDeg?: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Level 3 interactive protractor state
  const [lvl3Protractor, setLvl3Protractor] = useState<ProtractorState>({
    x: 280,
    y: 230,
    rotationDeg: -10,
  });
  const [lvl3InputDeg, setLvl3InputDeg] = useState<string>('');

  const currentQuestion = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (isPlaying && currentQuestion) {
      onAngleChangeFor3D(currentQuestion.angleDeg);
    }
  }, [isPlaying, currentQuestion, onAngleChangeFor3D]);

  // Optional countdown timer
  useEffect(() => {
    if (!isPlaying || !useTimer || isGameOver) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, useTimer, isGameOver]);

  const startLevel = (lvl: ChallengeLevel) => {
    soundFX.playClick(1.15);
    const qList = generateChallengeQuestions(lvl);
    setSelectedLevel(lvl);
    setQuestions(qList);
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setAnsweredState(null);
    setIsGameOver(false);
    setSecondsLeft(180);
    setLvl3Protractor({ x: 280, y: 230, rotationDeg: -10 });
    setLvl3InputDeg('');
    setIsPlaying(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (answeredState) return;
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;
    if (isCorrect) {
      soundFX.playSuccess();
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    } else {
      soundFX.playWrong();
    }
    setAnsweredState({ isCorrect, selectedIdx: optionIndex });
  };

  const handleSubmitLevel3Measurement = () => {
    if (answeredState) return;
    const target = currentQuestion.targetMeasureDeg ?? currentQuestion.angleDeg;
    const val = Number(lvl3InputDeg.trim());
    if (!lvl3InputDeg.trim() || Number.isNaN(val)) {
      soundFX.playWrong();
      return;
    }
    const isCorrect = Math.abs(val - target) <= 1;
    if (isCorrect) {
      soundFX.playSuccess();
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    } else {
      soundFX.playWrong();
    }
    setAnsweredState({ isCorrect, submittedDeg: val });
  };

  const handleNextQuestion = () => {
    soundFX.playClick();
    if (currentIdx + 1 >= questions.length) {
      const finalStars = calculateStarReward(correctCount, questions.length);
      onFinishChallengeLevel(selectedLevel, score, finalStars);
      setIsGameOver(true);
      soundFX.playSuccess();
    } else {
      setCurrentIdx((idx) => idx + 1);
      setAnsweredState(null);
      setLvl3InputDeg('');
      setLvl3Protractor({ x: 260, y: 220, rotationDeg: 0 });
    }
  };

  // Level Selection Hub
  if (!isPlaying) {
    const levelCards: Array<{
      lvl: ChallengeLevel;
      planetVi: string;
      titleVi: string;
      descVi: string;
      colorClass: string;
      badgeText: string;
    }> = [
      {
        lvl: 1,
        planetVi: 'HÀNH TINH 1 · TRẠM SAO THỦY',
        titleVi: 'CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ',
        descVi: 'Nhận diện Góc nhọn, Góc vuông, Góc tù và Góc bẹt qua mô hình trực quan.',
        colorClass: 'border-yellow-400',
        badgeText: '10 câu hỏi hình ảnh',
      },
      {
        lvl: 2,
        planetVi: 'HÀNH TINH 2 · VÀNH ĐAI SAO MỘC',
        titleVi: 'CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ',
        descVi: 'Nhận biết số đo góc, đơn vị độ (°), điền số đo còn thiếu và phân biệt chiều đọc.',
        colorClass: 'border-pink-500',
        badgeText: '10 câu hỏi tư duy số đo',
      },
      {
        lvl: 3,
        planetVi: 'HÀNH TINH 3 · TINH VÂN THƯỚC ĐO 180°',
        titleVi: 'CẤP ĐỘ 3 – BẬC THẦY ĐO GÓC',
        descVi: 'Trực tiếp kéo tâm thước bán nguyệt 180°, xoay vạch 0° và đo chính xác 10 góc!',
        colorClass: 'border-emerald-400',
        badgeText: '10 thử thách đo thực tế',
      },
    ];

    return (
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              THỬ THÁCH NHÀ TOÁN HỌC VŨ TRỤ
            </h1>
            <p className="text-sm text-indigo-200">
              Vượt qua 3 hành tinh thử thách (10 câu/lượt) để sưu tập Sao Vàng và Huy Hiệu!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-yellow-300 bg-indigo-950/90 px-3.5 py-2 rounded-xl border border-indigo-500/40 cursor-pointer">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="accent-pink-500 w-4 h-4"
              />
              <span>⏱️ Bật đồng hồ đếm ngược (3 phút)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onBackHome();
              }}
              className="btn-3d-cobalt px-4 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
            >
              ← Trang chủ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levelCards.map((c) => (
            <div
              key={c.lvl}
              className={`card-3d-cosmic rounded-2xl p-5 flex flex-col justify-between gap-4 border-2 ${c.colorClass}`}
            >
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-indigo-300">{c.planetVi}</div>
                <h2 className="text-xl font-extrabold text-white">{c.titleVi}</h2>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">{c.descVi}</p>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-yellow-300">
                  ⭐ Phần thưởng tối đa: 3 Sao Vàng · {c.badgeText}
                </div>
                <button
                  type="button"
                  onClick={() => startLevel(c.lvl)}
                  className="btn-3d-pink w-full py-3 rounded-xl font-extrabold text-sm text-white cursor-pointer"
                >
                  🚀 Bắt đầu Cấp độ {c.lvl}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Summary Modal when all 10 questions are completed
  if (isGameOver) {
    const starsEarned = calculateStarReward(correctCount, questions.length);
    return (
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="card-3d-cosmic rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-5 border-2 border-yellow-400">
          <div className="text-xs font-extrabold text-indigo-300">
            BẢNG TỔNG KẾT HÀNH TRÌNH · CẤP ĐỘ {selectedLevel}
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            {starsEarned >= 2 ? '🎉 CHÚC MỪNG NHÀ TOÁN HỌC NHÍ!' : '💪 CỐ GẮNG LÊN NHÉ!'}
          </h2>

          {/* 3D Star Display */}
          <div className="flex items-center justify-center gap-3 text-5xl py-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={s <= starsEarned ? 'text-yellow-400 drop-shadow-lg' : 'text-slate-700'}
              >
                ★
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">ĐIỂM SỐ</div>
              <div className="text-2xl font-extrabold font-mono-num text-yellow-300">
                {score} / 100
              </div>
            </div>
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">SỐ CÂU ĐÚNG</div>
              <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                {correctCount} / {questions.length}
              </div>
            </div>
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">SAO THƯỞNG</div>
              <div className="text-2xl font-extrabold font-mono-num text-pink-400">
                +{starsEarned} ★
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="btn-3d-pink flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white cursor-pointer"
            >
              ⟲ Chơi lại Cấp độ {selectedLevel}
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="btn-3d-gold flex-1 py-3 px-5 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🪐 Chọn Cấp độ khác
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-cobalt py-3 px-5 rounded-xl font-bold text-sm text-white cursor-pointer"
            >
              ← Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question Rendering
  const cx = 200;
  const cy = 155;
  const r = 115;
  const ray1 = polarToSvgCartesian(cx, cy, r, currentQuestion.baseRayAngleDeg);
  const ray2 = polarToSvgCartesian(
    cx,
    cy,
    r,
    currentQuestion.baseRayAngleDeg + currentQuestion.angleDeg
  );
  const arcR = 45;
  const arcStart = polarToSvgCartesian(cx, cy, arcR, currentQuestion.baseRayAngleDeg);
  const arcEnd = polarToSvgCartesian(
    cx,
    cy,
    arcR,
    currentQuestion.baseRayAngleDeg + currentQuestion.angleDeg
  );
  const cls = classifyAngle(currentQuestion.angleDeg);

  const lvl3AngleModel = {
    vertexX: 430,
    vertexY: 360,
    baseRayAngleDeg: currentQuestion.baseRayAngleDeg,
    measureDeg: currentQuestion.angleDeg,
  };
  const lvl3Alignment = evaluateProtractorAlignment(lvl3Protractor, lvl3AngleModel);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-4">
      {/* Top Status HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-yellow-300 text-sm sm:text-base">
            {currentQuestion.planetNameVi}
          </span>
          <span className="text-indigo-300">·</span>
          <span className="font-mono-num text-sm font-bold text-white">
            Câu {currentIdx + 1} / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {useTimer && (
            <span className="font-mono-num text-sm font-extrabold text-pink-300">
              ⏱️ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          )}
          <span className="font-mono-num text-sm font-extrabold text-emerald-300">
            Điểm: {score}
          </span>
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="btn-3d-cobalt px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            Đổi cấp độ
          </button>
        </div>
      </div>

      {/* Question Content */}
      {selectedLevel === 3 ? (
        /* LEVEL 3: Interactive 180° Protractor Measurement */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8">
            <SemicircleProtractorSVG
              angleState={lvl3AngleModel}
              protractorState={lvl3Protractor}
              alignment={lvl3Alignment}
              showMeasureValue={Boolean(answeredState)}
              allowDragRay={false}
              allowDragProtractor={true}
              onChangeProtractor={setLvl3Protractor}
            />
          </div>

          <div className="lg:col-span-4 card-3d-cosmic rounded-2xl p-4 flex flex-col gap-3.5">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {currentQuestion.promptVi}
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setLvl3Protractor({
                    x: lvl3AngleModel.vertexX,
                    y: lvl3AngleModel.vertexY,
                    rotationDeg: lvl3AngleModel.baseRayAngleDeg,
                  });
                }}
                className="btn-3d-gold flex-1 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                🎯 Đặt tâm O & Khớp vạch 0°
              </button>
              <button
                type="button"
                onClick={() =>
                  setLvl3Protractor((p) => ({ ...p, rotationDeg: p.rotationDeg + 5 }))
                }
                className="btn-3d-cobalt px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                ↺ +5°
              </button>
              <button
                type="button"
                onClick={() =>
                  setLvl3Protractor((p) => ({ ...p, rotationDeg: p.rotationDeg - 5 }))
                }
                className="btn-3d-cobalt px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                ↻ -5°
              </button>
            </div>

            <div className="bg-[#090621] p-3.5 rounded-xl border border-indigo-500/40 flex flex-col gap-2">
              <label htmlFor="lvl3-answer-input" className="text-xs font-bold text-indigo-200">
                Số đo góc AOB em đo được là (°):
              </label>
              <div className="flex gap-2">
                <input
                  id="lvl3-answer-input"
                  type="number"
                  min={0}
                  max={180}
                  disabled={Boolean(answeredState)}
                  value={lvl3InputDeg}
                  onChange={(e) => setLvl3InputDeg(e.target.value)}
                  placeholder="Nhập số độ..."
                  className="w-full rounded-lg bg-slate-900 border border-indigo-400/50 px-3 py-2 text-sm font-mono-num text-white"
                />
                {!answeredState && (
                  <button
                    type="button"
                    onClick={handleSubmitLevel3Measurement}
                    className="btn-3d-emerald px-4 py-2 rounded-lg text-xs font-extrabold text-white cursor-pointer whitespace-nowrap"
                  >
                    Chốt đáp án
                  </button>
                )}
              </div>
            </div>

            {answeredState && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  answeredState.isCorrect
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-rose-950/90 border-rose-400 text-rose-100'
                }`}
              >
                <div className="font-extrabold text-sm">
                  {answeredState.isCorrect
                    ? '🎆 CHÍNH XÁC! Pháo hoa chúc mừng bạn!'
                    : `❌ Chưa chính xác (Bạn nhập ${answeredState.submittedDeg}°)`}
                </div>
                <p>{currentQuestion.explanationVi}</p>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-3d-pink w-full py-2.5 rounded-xl font-extrabold text-xs text-white cursor-pointer mt-2"
                >
                  {currentIdx + 1 >= questions.length ? 'Xem Bảng Tổng Kết →' : 'Câu tiếp theo →'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LEVEL 1 & LEVEL 2: Visual Angle Model + Multiple Choice */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center card-3d-cosmic rounded-2xl p-5">
          {/* Left Angle Diagram */}
          <div className="md:col-span-5 bg-[#090621] rounded-2xl border border-indigo-500/40 p-3">
            <svg viewBox="0 0 380 230" className="w-full h-56 select-none">
              <defs>
                <pattern id="challengeGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path
                    d="M 25 0 L 0 0 0 25"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.14)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect x="0" y="0" width="380" height="230" fill="url(#challengeGrid)" />

              {currentQuestion.angleDeg === 90 ? (
                <rect
                  x={cx}
                  y={cy - 24}
                  width={24}
                  height={24}
                  fill="rgba(34, 197, 94, 0.3)"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                />
              ) : (
                <path
                  d={`M ${cx} ${cy} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y} Z`}
                  fill={cls.colorHex}
                  fillOpacity={0.28}
                  stroke={cls.colorHex}
                  strokeWidth={2.5}
                />
              )}

              <line
                x1={cx}
                y1={cy}
                x2={ray1.x}
                y2={ray1.y}
                stroke="#38BDF8"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <line
                x1={cx}
                y1={cy}
                x2={ray2.x}
                y2={ray2.y}
                stroke={cls.colorHex}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <circle cx={cx} cy={cy} r={6} fill="#FACC15" />
              <text x={cx - 12} y={cy + 22} fill="#FACC15" fontSize="13" fontWeight="800">
                O
              </text>
            </svg>
          </div>

          {/* Right Prompt & Options */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {currentQuestion.promptVi}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = answeredState?.selectedIdx === idx;
                const isRightOption = idx === currentQuestion.correctOptionIndex;

                let btnStyle =
                  'bg-[#171142] hover:bg-indigo-900/90 border-indigo-500/40 text-white';
                if (answeredState) {
                  if (isRightOption) {
                    btnStyle = 'bg-emerald-600 border-emerald-300 text-white';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-600 border-rose-300 text-white';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={Boolean(answeredState)}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 rounded-xl font-extrabold text-sm text-left border-2 transition-transform cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answeredState && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  answeredState.isCorrect
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-rose-950/90 border-rose-400 text-rose-100'
                }`}
              >
                <div>
                  <div className="font-extrabold mb-1">
                    {answeredState.isCorrect
                      ? '🎆 CHÍNH XÁC! +10 Điểm & Pháo Hoa Vũ Trụ!'
                      : '💡 Giải thích kiến thức:'}
                  </div>
                  <p>{currentQuestion.explanationVi}</p>
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-3d-pink px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  {currentIdx + 1 >= questions.length ? 'Xem Tổng Kết →' : 'Câu tiếp theo →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
