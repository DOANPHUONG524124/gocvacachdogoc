import React, { useState } from 'react';
import {
  BADGE_CATALOG,
  computeOverallProgressPercent,
  PlayerProgress,
} from '../utils/challengeGenerator';
import { soundFX } from '../utils/soundEffects';

interface KnowledgeLibraryViewProps {
  progress: PlayerProgress;
  onMarkLibraryRead: () => void;
  onOpenTutorial: () => void;
  onOpenLab: () => void;
  onBackHome: () => void;
}

export const KnowledgeLibraryView: React.FC<KnowledgeLibraryViewProps> = ({
  progress,
  onMarkLibraryRead,
  onOpenTutorial,
  onOpenLab,
  onBackHome,
}) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'mistakes' | 'rewards' | 'video'>('knowledge');

  // State for Animate Images into Video (gemini-omni-1.2-flash)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string>('');
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState<string>(
    'Robot Toán học và các tia sáng góc học 3D lấp lánh chuyển động trong vũ trụ'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string>('');

  const handleTabSwitch = (tab: 'knowledge' | 'mistakes' | 'rewards' | 'video') => {
    soundFX.playClick();
    setActiveTab(tab);
    onMarkLibraryRead();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError('');
    setGeneratedVideoUrl('');
    setUploadedMimeType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setImagePreviewUrl(dataUrl);
      const base64Part = dataUrl.split(',')[1] || '';
      setUploadedImageBase64(base64Part);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSampleAngleImage = () => {
    soundFX.playClick();
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0B0726';
      ctx.fillRect(0, 0, 640, 360);
      // Draw stars
      ctx.fillStyle = '#FACC15';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc((i * 73) % 640, (i * 41) % 360, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Draw 60° angle
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(180, 260);
      ctx.lineTo(480, 260);
      ctx.stroke();

      ctx.strokeStyle = '#FF2E93';
      ctx.beginPath();
      ctx.moveTo(180, 260);
      ctx.lineTo(330, 60);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('VŨ TRỤ GÓC HỌC 3D - GÓC NHỌN 60°', 90, 45);
    }
    const dataUrl = canvas.toDataURL('image/png');
    setImagePreviewUrl(dataUrl);
    setUploadedMimeType('image/png');
    setUploadedImageBase64(dataUrl.split(',')[1] || '');
    setVideoError('');
  };

  const handleAnimateImageToVideo = async () => {
    if (!uploadedImageBase64) {
      soundFX.playWrong();
      setVideoError('Vui lòng tải lên một bức ảnh hoặc chọn "Dùng ảnh mẫu Góc 3D" trước khi tạo video!');
      return;
    }

    soundFX.playClick(1.1);
    setIsGeneratingVideo(true);
    setVideoError('');
    setGeneratedVideoUrl('');

    try {
      const response = await fetch('/api/animate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImageBase64,
          mimeType: uploadedMimeType,
          prompt: videoPrompt,
          aspectRatio,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setVideoError(
          data.error || 'Không thể tạo video lúc này. Vui lòng kiểm tra cấu hình GEMINI_API_KEY.'
        );
      } else if (data.videoDataUrl) {
        setGeneratedVideoUrl(data.videoDataUrl);
        soundFX.playSuccess();
      }
    } catch (err: unknown) {
      setVideoError(
        err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi tạo video.'
      );
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const overallPercent = computeOverallProgressPercent(progress);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-3.5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            THƯ VIỆN KIẾN THỨC & BẢNG THÀNH TÍCH
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Cẩm nang đơn vị đo góc, cấu tạo thước bán nguyệt 180°, các lỗi thường gặp và Huy hiệu Vũ trụ
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onBackHome();
          }}
          className="btn-3d-cobalt px-4 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
        >
          ← Quay lại Trang chủ
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => handleTabSwitch('knowledge')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'knowledge'
              ? 'bg-yellow-400 text-slate-950 border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          📚 1. Kiến Thức & Cấu Tạo Thước
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('mistakes')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'mistakes'
              ? 'bg-pink-500 text-white border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          ⚠️ 2. Lỗi Thường Gặp (Đúng/Sai)
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('rewards')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'rewards'
              ? 'bg-emerald-500 text-white border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          🏆 3. Huy Hiệu & Tiến Độ ({overallPercent}%)
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('video')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'video'
              ? 'bg-sky-500 text-white border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          🎬 4. Tạo Video Từ Ảnh Góc
        </button>
      </div>

      {/* TAB 1: KNOWLEDGE CARDS */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 6.1: Đơn vị đo góc */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-yellow-400/60">
            <div className="text-xs font-extrabold text-yellow-300">MỤC 1 · ĐƠN VỊ ĐO LƯỜNG</div>
            <h2 className="text-xl font-extrabold text-white">Đơn Vị Đo Góc Là Độ (°)</h2>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Để đo độ mở rộng giữa hai cạnh của một góc, các nhà Toán học sử dụng đơn vị là{' '}
              <strong className="text-yellow-300">Độ</strong>, ký hiệu là dấu tròn nhỏ{' '}
              <strong className="text-yellow-300 font-mono-num">°</strong> viết ở phía trên bên phải con số.
            </p>
            <div className="bg-[#090621] rounded-xl p-3.5 border border-indigo-500/30 space-y-2 text-xs font-mono-num">
              <div className="flex justify-between">
                <span className="text-yellow-300 font-bold">45° (Bốn mươi lăm độ)</span>
                <span className="text-slate-300">Góc nhọn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400 font-bold">90° (Chín mươi độ)</span>
                <span className="text-slate-300">Góc vuông</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-400 font-bold">120° (Một trăm hai mươi độ)</span>
                <span className="text-slate-300">Góc tù</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-400 font-bold">180° (Một trăm tám mươi độ)</span>
                <span className="text-slate-300">Góc bẹt</span>
              </div>
            </div>
          </div>

          {/* Card 6.2: Cấu tạo thước đo góc */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-sky-400/60">
            <div className="text-xs font-extrabold text-sky-300">MỤC 2 · DỤNG CỤ HỌC TẬP</div>
            <h2 className="text-xl font-extrabold text-white">Thước Đo Góc Bán Nguyệt 180°</h2>
            <ul className="text-xs sm:text-sm text-indigo-100 space-y-2 leading-relaxed">
              <li>
                • <strong>Hình dạng bán nguyệt:</strong> Nửa hình tròn chia thành 180 phần bằng nhau từ{' '}
                <span className="font-mono-num text-yellow-300">0° đến 180°</span>.
              </li>
              <li>
                • <strong>Tâm thước:</strong> Điểm chính giữa nằm trên đường thẳng đáy của thước.
              </li>
              <li>
                • <strong>Đường chuẩn 0°–180°:</strong> Đường thẳng nối vạch 0° và vạch 180° đi qua tâm thước.
              </li>
              <li>
                • <strong>Hai dãy số ngược chiều:</strong> Dãy trong (0° từ phải sang trái) và dãy ngoài (0° từ trái sang phải) giúp đo góc mở về bất kỳ hướng nào.
              </li>
            </ul>
            <button
              type="button"
              onClick={onOpenLab}
              className="btn-3d-cobalt mt-auto py-2.5 px-4 rounded-xl text-xs font-extrabold text-white cursor-pointer"
            >
              🔬 Mở Phòng Thí Nghiệm Thước 180°
            </button>
          </div>

          {/* Card 6.3: Cách sử dụng thước 3 bước */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-pink-500/60">
            <div className="text-xs font-extrabold text-pink-300">MỤC 3 · QUY TRÌNH CHUẨN</div>
            <h2 className="text-xl font-extrabold text-white">3 Bước Đo Góc Chính Xác</h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-indigo-100">
              <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                <strong className="text-yellow-300">Bước 1:</strong> Đặt <strong>tâm thước</strong> trùng khít với <strong>đỉnh O</strong> của góc.
              </div>
              <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                <strong className="text-emerald-300">Bước 2:</strong> Xoay thước sao cho <strong>đường chuẩn vạch 0°</strong> trùng khít với một cạnh (tia gốc) của góc.
              </div>
              <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                <strong className="text-pink-300">Bước 3:</strong> Cạnh còn lại đi qua vạch chia nào (trên dãy số bắt đầu từ 0° đó) thì đó chính là số đo của góc.
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenTutorial}
              className="btn-3d-pink mt-auto py-2.5 px-4 rounded-xl text-xs font-extrabold text-white cursor-pointer"
            >
              📖 Thực hành Bài học 3 bước
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: COMMON MISTAKES (ĐÚNG VS SAI VISUAL COMPARATOR) */}
      {activeTab === 'mistakes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mistake 1: Lệch tâm thước */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 1: Đặt Tâm Thước Không Trùng Đỉnh Góc
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-rose-950/80 border border-rose-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-rose-300 mb-1">❌ CÁCH ĐẶT SAI</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(59,130,246,0.3)" stroke="#60A5FA" />
                  <circle cx="60" cy="65" r="3" fill="#FACC15" />
                  {/* Vertex shifted away from center */}
                  <line x1="35" y1="55" x2="95" y2="55" stroke="#FF2E93" strokeWidth="3" />
                  <line x1="35" y1="55" x2="75" y2="20" stroke="#FF2E93" strokeWidth="3" />
                  <circle cx="35" cy="55" r="3.5" fill="#FF2E93" />
                </svg>
                <p className="text-[11px] text-rose-200">Đỉnh góc bị lệch khỏi tâm thước</p>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-emerald-300 mb-1">✅ CÁCH ĐẶT ĐÚNG</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(34,197,94,0.3)" stroke="#22C55E" />
                  <line x1="60" y1="65" x2="100" y2="65" stroke="#38BDF8" strokeWidth="3" />
                  <line x1="60" y1="65" x2="90" y2="30" stroke="#FACC15" strokeWidth="3" />
                  <circle cx="60" cy="65" r="4" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-emerald-200">Tâm thước trùng khít đỉnh O</p>
              </div>
            </div>
            <p className="text-xs text-indigo-100">
              <strong>Cách khắc phục:</strong> Luôn kiểm tra dấu cộng tâm thước nằm ngay chính giữa đỉnh góc O trước khi nhìn vạch chia.
            </p>
          </div>

          {/* Mistake 2: Vạch 0° không trùng cạnh góc */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 2: Vạch 0° Không Trùng Với Cạnh Của Góc
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-rose-950/80 border border-rose-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-rose-300 mb-1">❌ CÁCH ĐẶT SAI</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(59,130,246,0.3)" stroke="#60A5FA" />
                  {/* Both rays floating above baseline */}
                  <line x1="60" y1="65" x2="95" y2="48" stroke="#38BDF8" strokeWidth="3" />
                  <line x1="60" y1="65" x2="65" y2="22" stroke="#FF2E93" strokeWidth="3" />
                  <circle cx="60" cy="65" r="3.5" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-rose-200">Cạnh gốc lệch khỏi vạch 0°</p>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-emerald-300 mb-1">✅ CÁCH ĐẶT ĐÚNG</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(34,197,94,0.3)" stroke="#22C55E" />
                  <line x1="60" y1="65" x2="100" y2="65" stroke="#22C55E" strokeWidth="3.5" />
                  <line x1="60" y1="65" x2="85" y2="30" stroke="#FACC15" strokeWidth="3" />
                  <circle cx="60" cy="65" r="4" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-emerald-200">Vạch 0° nằm đè lên tia OA</p>
              </div>
            </div>
            <p className="text-xs text-indigo-100">
              <strong>Cách khắc phục:</strong> Xoay thước để đường chuẩn 0°–180° nằm đè khít lên một cạnh của góc.
            </p>
          </div>

          {/* Mistake 3: Đọc nhầm dãy số ngược chiều */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 3: Đọc Nhầm Hai Dãy Số (Nhầm Nhọn & Tù)
            </h3>
            <div className="bg-[#090621] border border-indigo-500/40 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>❌ Sai lầm phổ biến:</span>
                <span>Góc nhọn 60° đọc thành 120°!</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>✅ Mẹo kiểm tra nhanh:</span>
                <span>So sánh với góc vuông 90°</span>
              </div>
              <p className="text-indigo-200 leading-relaxed">
                Trước khi kết luận số đo, hãy nhìn xem góc đó hẹp hơn góc vuông (phải {'<'} 90°) hay rộng hơn góc vuông (phải {'>'} 90°). Luôn đếm từ vạch <strong>0°</strong> nơi đặt tia gốc!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REWARDS, BADGES & LEARNING PROGRESS */}
      {activeTab === 'rewards' && (
        <div className="flex flex-col gap-5">
          {/* Progress Bar Card */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  TIẾN ĐỘ CHINH PHỤC VŨ TRỤ GÓC HỌC
                </h2>
                <p className="text-xs text-indigo-200">
                  Dữ liệu điểm thưởng và huy hiệu được lưu tự động trên trình duyệt của em
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-indigo-300 font-bold">TỔNG SAO THƯỞNG</div>
                  <div className="text-2xl font-extrabold font-mono-num text-yellow-300">
                    ★ {progress.stars}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-indigo-300 font-bold">HOÀN THÀNH</div>
                  <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                    {overallPercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden border border-indigo-500/40">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(6, overallPercent)}%` }}
              />
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGE_CATALOG.map((badge) => {
              const isUnlocked = badge.unlocked(progress);
              return (
                <div
                  key={badge.id}
                  className={`card-3d-cosmic rounded-2xl p-4 flex items-center gap-4 border-2 ${
                    isUnlocked ? 'border-yellow-400' : 'border-slate-700/60 opacity-75'
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-extrabold border-2"
                    style={{
                      backgroundColor: isUnlocked ? 'rgba(250, 204, 21, 0.2)' : '#0F172A',
                      borderColor: isUnlocked ? badge.color : '#334155',
                      color: isUnlocked ? badge.color : '#64748B',
                    }}
                  >
                    {isUnlocked ? '🏅' : '🔒'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {badge.titleVi}
                      </h3>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">{badge.descVi}</p>
                    <div
                      className={`text-[11px] font-bold mt-1 ${
                        isUnlocked ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {isUnlocked ? '✓ Đã nhận huy hiệu' : 'Chưa mở khóa'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ANIMATE IMAGES INTO VIDEO (gemini-omni-1.2-flash via Interactions API) */}
      {activeTab === 'video' && (
        <div className="card-3d-cosmic rounded-2xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div>
              <span className="text-xs font-extrabold text-sky-300">
                XƯỞNG PHIM VŨ TRỤ GÓC HỌC · GEMINI OMNI FLASH
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Biến Ảnh Mô Hình Góc Thành Video Chuyển Động
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                Tải lên bức ảnh góc học hoặc dùng ảnh mẫu 3D, chọn khung hình ngang (16:9) hoặc dọc (9:16) để tạo video hoạt ảnh!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="btn-3d-cobalt px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer">
                <span>📤 Tải ảnh lên từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleGenerateSampleAngleImage}
                className="btn-3d-gold px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
              >
                🎨 Dùng ảnh mẫu Góc 3D
              </button>
            </div>

            {/* Aspect Ratio Selector: 16:9 or 9:16 */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-200">Tỷ lệ khung hình video:</span>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-800 text-indigo-200'
                }`}
              >
                16:9 (Màn hình ngang)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-800 text-indigo-200'
                }`}
              >
                9:16 (Màn hình dọc)
              </button>
            </div>

            <div>
              <label htmlFor="video-motion-prompt" className="text-xs font-bold text-indigo-200 block mb-1.5">
                Mô tả chuyển động mong muốn:
              </label>
              <input
                id="video-motion-prompt"
                type="text"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-indigo-500/40 px-3.5 py-2.5 text-xs sm:text-sm text-white"
              />
            </div>

            <button
              type="button"
              disabled={isGeneratingVideo}
              onClick={handleAnimateImageToVideo}
              className="btn-3d-pink py-3 px-5 rounded-xl font-extrabold text-sm text-white cursor-pointer disabled:opacity-60"
            >
              {isGeneratingVideo
                ? '⏳ Đang tạo video hoạt ảnh với gemini-omni-1.2-flash...'
                : `🎬 Tạo Video Hoạt Ảnh (${aspectRatio})`}
            </button>

            {videoError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-400 text-xs text-rose-200 font-semibold"
              >
                {videoError}
              </div>
            )}
          </div>

          {/* Right Preview Area */}
          <div className="lg:col-span-6 bg-[#090621] rounded-2xl p-4 border border-indigo-500/40 min-h-[260px] flex flex-col items-center justify-center gap-3">
            {generatedVideoUrl ? (
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                className={`rounded-xl border border-pink-500/50 ${
                  aspectRatio === '9:16' ? 'max-h-80 w-auto' : 'w-full h-auto'
                }`}
              />
            ) : imagePreviewUrl ? (
              <div className="text-center space-y-2">
                <img
                  src={imagePreviewUrl}
                  alt="Ảnh chuẩn bị tạo video"
                  referrerPolicy="no-referrer"
                  className="max-h-60 rounded-xl border border-indigo-400/40 mx-auto"
                />
                <div className="text-xs text-indigo-300 font-semibold">
                  Ảnh đã sẵn sàng! Hãy bấm nút &ldquo;Tạo Video Hoạt Ảnh&rdquo; bên trái.
                </div>
              </div>
            ) : (
              <div className="text-center text-xs sm:text-sm text-indigo-300 max-w-sm space-y-2 py-8">
                <div className="text-4xl">📽️</div>
                <p>
                  Chưa có ảnh nào được chọn. Hãy bấm <strong>&ldquo;Tải ảnh lên từ máy&rdquo;</strong> hoặc{' '}
                  <strong>&ldquo;Dùng ảnh mẫu Góc 3D&rdquo;</strong> để bắt đầu!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
