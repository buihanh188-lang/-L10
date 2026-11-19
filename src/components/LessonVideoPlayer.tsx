import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Captions,
  CheckCircle2,
  Clock,
  Film,
  Layers,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { apiService } from '../services/api';

interface LessonVideoPlayerProps {
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  isEn?: boolean;
  onJumpToKnowledge: () => void;
  onJumpToPractice: () => void;
}

const WATCH_HISTORY_KEY = 'dia_li_10_video_watches';

function formatSecs(sec: number): string {
  if (!sec || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  lessonId,
  lessonNumber,
  lessonTitle,
  isEn = false,
  onJumpToKnowledge,
  onJumpToPractice,
}) => {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<
    'published' | 'restoring' | 'awaiting_approval' | 'processing' | 'unpublished' | 'not_created'
  >('not_created');
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);
  const [videoMeta, setVideoMeta] = useState<{
    videoUrl: string;
    subtitleUrl: string | null;
    thumbnailUrl: string | null;
    durationSeconds: number;
    approvedAt: string | null;
    version: number;
    provider?: 'local' | 'google_drive' | 'youtube' | 'direct_url';
    playbackType?: 'iframe' | 'html5_video';
    externalRawUrl?: string | null;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [watchCount, setWatchCount] = useState(0);
  const [iframeReloadKey, setIframeReloadKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;
    let pollTimer: number | null = null;
    setLoading(true);

    const fetchVideo = (isInitial: boolean) => {
      apiService
        .getPublishedLessonVideo(lessonId)
        .then((res) => {
          if (!active) return;
          const isReady = Boolean(res.available && res.video);
          const nextStatus = res.approvalStatus || (isReady ? 'published' : 'not_created');
          setAvailable(isReady);
          setApprovalStatus(nextStatus);
          setPendingDuration(res.durationSeconds ?? null);
          setVideoMeta(res.video);
          if (!isReady && (nextStatus === 'restoring' || nextStatus === 'processing')) {
            pollTimer = window.setTimeout(() => fetchVideo(false), 3000);
          }
        })
        .finally(() => {
          if (active && isInitial) setLoading(false);
        });
    };

    fetchVideo(true);

    try {
      const raw = localStorage.getItem(WATCH_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setWatchCount(Number(parsed[lessonId]) || 0);
      }
    } catch {
      // ignore
    }

    return () => {
      active = false;
      if (pollTimer !== null) window.clearTimeout(pollTimer);
    };
  }, [lessonId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !el.textTracks || el.textTracks.length === 0) return;
    el.textTracks[0].mode = subtitlesEnabled ? 'showing' : 'hidden';
  }, [subtitlesEnabled, videoMeta]);

  const recordWatchStart = () => {
    try {
      const raw = localStorage.getItem(WATCH_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const next = (Number(parsed[lessonId]) || 0) + 1;
      parsed[lessonId] = next;
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(parsed));
      setWatchCount(next);
    } catch {
      // ignore
    }
  };

  const handleTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const handleSeekOffset = (deltaSeconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + deltaSeconds));
  };

  const handleRewatch = () => {
    if (videoMeta?.playbackType === 'iframe') {
      setIframeReloadKey((k) => k + 1);
      recordWatchStart();
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
    recordWatchStart();
  };

  const handleToggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const isIframePlayback = videoMeta?.playbackType === 'iframe';
  const providerBadgeText =
    videoMeta?.provider === 'google_drive'
      ? 'Google Drive'
      : videoMeta?.provider === 'youtube'
      ? 'YouTube'
      : videoMeta?.provider === 'direct_url'
      ? isEn
        ? 'Cloud Video'
        : 'Kho lưu trữ đám mây'
      : null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isEn ? 'VIDEO LECTURE' : 'VIDEO BÀI GIẢNG'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEn
                ? `Lesson ${lessonNumber}: ${lessonTitle}`
                : `Bài giảng chuẩn hóa cho Bài ${lessonNumber}: ${lessonTitle}`}
            </p>
          </div>
        </div>

        {available && videoMeta && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Teacher Approved' : 'Giáo viên đã duyệt'}</span>
            </span>
            {providerBadgeText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                <span>{providerBadgeText}</span>
              </span>
            )}
            {videoMeta.durationSeconds > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatSecs(videoMeta.durationSeconds)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          {isEn ? 'Checking published lecture video...' : 'Đang kiểm tra video bài giảng của bài học...'}
        </div>
      ) : available && videoMeta ? (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 shadow-md">
            {isIframePlayback ? (
              <iframe
                key={`${lessonId}-${videoMeta.videoUrl}-${iframeReloadKey}`}
                src={videoMeta.videoUrl}
                title={`Bài ${lessonNumber}: ${lessonTitle}`}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster={videoMeta.thumbnailUrl || undefined}
                src={videoMeta.videoUrl}
                onLoadedMetadata={() => {
                  const el = videoRef.current;
                  if (el && el.textTracks && el.textTracks.length > 0) {
                    el.textTracks[0].mode = subtitlesEnabled ? 'showing' : 'hidden';
                  }
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  if (watchCount === 0) recordWatchStart();
                }}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full"
              >
                {videoMeta.subtitleUrl && (
                  <track
                    kind="subtitles"
                    srcLang="vi"
                    label="Tiếng Việt"
                    src={videoMeta.subtitleUrl}
                    default={subtitlesEnabled}
                  />
                )}
              </video>
            )}
          </div>

          {/* Interactive Student Video Controls + Knowledge/Practice Jump */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {!isIframePlayback && (
                <>
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? (isEn ? 'Pause' : 'Tạm dừng') : isEn ? 'Play' : 'Phát video'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeekOffset(-15)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    -15s
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeekOffset(15)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    +15s
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? (isEn ? 'Muted' : 'Đang tắt tiếng') : isEn ? 'Audio' : 'Âm lượng'}</span>
                  </button>

                  {videoMeta.subtitleUrl && (
                    <button
                      type="button"
                      onClick={() => setSubtitlesEnabled((v) => !v)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 border cursor-pointer ${
                        subtitlesEnabled
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Captions className="w-3.5 h-3.5" />
                      <span>{subtitlesEnabled ? 'Phụ đề: Bật' : 'Phụ đề: Tắt'}</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleRewatch}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Rewatch' : `Xem lại${watchCount > 0 ? ` (${watchCount})` : ''}`}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onJumpToKnowledge}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isEn ? 'Core Knowledge' : 'Xem Kiến thức trọng tâm'}</span>
              </button>

              <button
                type="button"
                onClick={onJumpToPractice}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Start Practice Now' : 'Chuyển sang Luyện tập'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            {approvalStatus === 'restoring' ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-900 border border-teal-300 text-[11px] font-bold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>
                      {isEn
                        ? 'Teacher Approved • Preparing Video Stream'
                        : 'Giáo viên đã duyệt xuất bản • Đang tự động chuẩn bị tệp phát'}
                    </span>
                  </span>
                  {pendingDuration && pendingDuration > 0 && (
                    <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                      ({formatSecs(pendingDuration)})
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {isEn
                    ? `Lesson ${lessonNumber} video is approved and being restored automatically (~45–60 seconds). It will appear here as soon as ready.`
                    : `Video bài giảng Bài ${lessonNumber} đã được cô duyệt xuất bản. Máy chủ đang tự động khôi phục tệp phát (~45–60 giây) và sẽ tự hiển thị ngay tại đây.`}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'You do not need to reload the page — the player will update automatically.'
                    : 'Em không cần tải lại trang — khung video sẽ tự động hiện lên ngay khi hoàn tất.'}
                </p>
              </>
            ) : approvalStatus === 'awaiting_approval' ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isEn
                        ? 'Video Created - Awaiting Teacher Approval'
                        : 'Video đã tạo - Chờ giáo viên duyệt'}
                    </span>
                  </span>
                  {pendingDuration && pendingDuration > 0 && (
                    <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                      ({formatSecs(pendingDuration)})
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {isEn
                    ? `The lecture video for Lesson ${lessonNumber} has been generated and is awaiting teacher approval to publish.`
                    : `Video bài giảng Bài ${lessonNumber} đã được tạo xong và đang chờ giáo viên duyệt để xuất bản chính thức.`}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'Meanwhile, you can study the Core Knowledge and practice all 40 questions below.'
                    : 'Trong lúc chờ giáo viên kiểm duyệt xuất bản, em có thể học ngay phần Kiến thức trọng tâm và Luyện tập 40 câu hỏi bên dưới.'}
                </p>
              </>
            ) : approvalStatus === 'unpublished' ? (
              <>
                <div className="text-xs font-bold text-slate-800">
                  {isEn
                    ? `Lecture video for Lesson ${lessonNumber} is temporarily hidden by the teacher.`
                    : `Video bài giảng Bài ${lessonNumber} đang được giáo viên tạm ẩn để cập nhật.`}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'You can study the structured core knowledge and practice all 40 questions below right away.'
                    : 'Em vẫn có thể học ngay phần Kiến thức trọng tâm và Luyện tập 40 câu hỏi bên dưới.'}
                </p>
              </>
            ) : approvalStatus === 'processing' ? (
              <>
                <div className="text-xs font-bold text-slate-800">
                  {isEn
                    ? `Lecture video for Lesson ${lessonNumber} is currently being produced.`
                    : `Video bài giảng cho Bài ${lessonNumber} đang được hệ thống xử lý tạo bản dựng.`}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'You can study the structured core knowledge and practice all 40 questions below right away.'
                    : 'Trong lúc chờ hoàn tất, em có thể học ngay phần Kiến thức trọng tâm và Luyện tập 40 câu hỏi bên dưới.'}
                </p>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-800">
                  {isEn
                    ? 'Lecture video is not published yet for this lesson.'
                    : `Video bài giảng cho Bài ${lessonNumber} đang chờ giáo viên biên soạn và duyệt xuất bản.`}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'You can study the structured core knowledge and practice all 40 questions below right away.'
                    : 'Trong khi chờ video xuất bản chính thức, em có thể học ngay phần Kiến thức trọng tâm và Luyện tập 40 câu hỏi bên dưới.'}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button
              type="button"
              onClick={onJumpToKnowledge}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold cursor-pointer"
            >
              {isEn ? 'Core Knowledge' : 'Kiến thức trọng tâm'}
            </button>
            <button
              type="button"
              onClick={onJumpToPractice}
              className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer"
            >
              {isEn ? 'Practice Now' : 'Làm bài tập'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
