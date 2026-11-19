import fs from 'fs';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { Resvg } from '@resvg/resvg-js';
import type { Lesson, LessonVideoScript, VideoScenePlan } from '../src/types/index.ts';

const execFileAsync = promisify(execFile);

const PIPER_TOOLS_DIR = '/tmp/diali10-tools';
const PIPER_DIR = path.join(PIPER_TOOLS_DIR, 'piper');
const PIPER_BIN = path.join(PIPER_DIR, 'piper');
const PIPER_MODEL = path.join(PIPER_DIR, 'voices', 'vi_VN-vais1000-medium.onnx');
const PIPER_MODEL_CFG = `${PIPER_MODEL}.json`;

const NOTO_FONT_FILES = [
  '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-Italic.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-BoldItalic.ttf',
].filter((p) => fs.existsSync(p));

export interface OfflineEngineStatus {
  piperAvailable: boolean;
  piperVoiceAvailable: boolean;
  resvgAvailable: boolean;
  fontsAvailable: boolean;
  piperVoiceName: string;
}

export function getOfflineEngineStatus(): OfflineEngineStatus {
  const installedLocally =
    fs.existsSync(PIPER_BIN) && fs.existsSync(PIPER_MODEL) && fs.existsSync(PIPER_MODEL_CFG);
  const canAutoBootstrap = fs.existsSync('/usr/bin/curl') || fs.existsSync('/bin/curl');
  const piperAvailable = installedLocally || canAutoBootstrap;
  const piperVoiceAvailable = installedLocally || canAutoBootstrap;
  const resvgAvailable = typeof Resvg === 'function';
  const fontsAvailable = NOTO_FONT_FILES.length >= 2;
  return {
    piperAvailable,
    piperVoiceAvailable,
    resvgAvailable,
    fontsAvailable,
    piperVoiceName: 'vi_VN-vais1000-medium (Miễn phí - Ngoại tuyến)',
  };
}

let piperInstallPromise: Promise<void> | null = null;

export async function ensurePiperInstalled(): Promise<void> {
  if (fs.existsSync(PIPER_BIN) && fs.existsSync(PIPER_MODEL) && fs.existsSync(PIPER_MODEL_CFG)) {
    try { fs.chmodSync(PIPER_BIN, 0o755); } catch { /* ignore */ }
    return;
  }
  if (piperInstallPromise) return piperInstallPromise;

  piperInstallPromise = (async () => {
    const toolsDir = PIPER_TOOLS_DIR;
    const piperDir = PIPER_DIR;
    const voicesDir = path.join(piperDir, 'voices');
    fs.mkdirSync(voicesDir, { recursive: true });

    if (!fs.existsSync(PIPER_BIN)) {
      const tmpTgz = '/tmp/piper-bootstrap.tar.gz';
      await execFileAsync('curl', [
        '-fsSL',
        '-L',
        'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz',
        '-o',
        tmpTgz,
      ]);
      await execFileAsync('tar', ['-xzf', tmpTgz, '-C', toolsDir]);
      try { fs.unlinkSync(tmpTgz); } catch { /* ignore */ }
      fs.chmodSync(PIPER_BIN, 0o755);
    }

    if (!fs.existsSync(PIPER_MODEL)) {
      const tmpOnnx = `${PIPER_MODEL}.tmp`;
      await execFileAsync('curl', [
        '-fsSL',
        '-L',
        'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx',
        '-o',
        tmpOnnx,
      ]);
      fs.renameSync(tmpOnnx, PIPER_MODEL);
    }

    if (!fs.existsSync(PIPER_MODEL_CFG)) {
      const tmpCfg = `${PIPER_MODEL_CFG}.tmp`;
      await execFileAsync('curl', [
        '-fsSL',
        '-L',
        'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx.json',
        '-o',
        tmpCfg,
      ]);
      fs.renameSync(tmpCfg, PIPER_MODEL_CFG);
    }
  })().finally(() => {
    piperInstallPromise = null;
  });

  return piperInstallPromise;
}

function escapeXml(input: string): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = last.length > 3 ? `${last.slice(0, Math.max(1, maxChars - 3))}...` : last;
  }
  return lines;
}

export function normalizeVietnameseForTts(raw: string): string {
  let txt = String(raw || '').replace(/\s+/g, ' ').trim();
  // Expand geography & school abbreviations cleanly for clear Vietnamese pronunciation
  const replacements: Array<[RegExp, string]> = [
    [/\bTHPT\b/g, 'trung học phổ thông'],
    [/\bTHCS\b/g, 'trung học cơ sở'],
    [/\bSGK\b/g, 'sách giáo khoa'],
    [/\bGDPT\b/g, 'giáo dục phổ thông'],
    [/\bGIS\b/g, 'hệ thống thông tin địa lí G I S'],
    [/\bGPS\b/g, 'hệ thống định vị toàn cầu G P S'],
    [/\bBĐKH\b/g, 'biến đổi khí hậu'],
    [/\bKTXH\b/g, 'kinh tế xã hội'],
    [/\bĐBSH\b/g, 'Đồng bằng sông Hồng'],
    [/\bĐBSCL\b/g, 'Đồng bằng sông Cửu Long'],
    [/\bTP\.HCM\b/gi, 'Thành phố Hồ Chí Minh'],
    [/\bTP\.\s*/g, 'Thành phố '],
    [/\s*&\s*/g, ' và '],
    [/\s*–\s*/g, ', '],
    [/\s*—\s*/g, ', '],
    [/\s*\/\s*/g, ' hoặc '],
    [/(\d+)\s*%/g, '$1 phần trăm'],
    [/\(([^)]{1,45})\)/g, ', $1,'],
  ];
  for (const [pattern, target] of replacements) {
    txt = txt.replace(pattern, target);
  }
  // Tidy repeated commas / spaces
  txt = txt.replace(/,\s*,+/g, ', ').replace(/\s+([,.!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
  return txt;
}

function cleanBulletForSpeech(text: string): string {
  return String(text || '')
    .replace(/^[-•*]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '');
}

/**
 * Composes a rich, pedagogically accurate 4–6 minute lecture script directly from
 * `LESSONS` (SGK Địa lí 10 - Kết nối tri thức với cuộc sống) without paid external APIs.
 */
export function composeOfflineLessonScript(
  lesson: Lesson,
  partTitle: string,
  chapterTitle: string
): LessonVideoScript {
  const scenes: VideoScenePlan[] = [];
  let sceneNo = 1;

  const isBai1 = lesson.id === 'bai-1';

  // 1. INTRO SCENE
  const introNarration = isBai1
    ? `Chào mừng các em học sinh lớp 10 đến với bài giảng môn Địa lí, bộ sách Kết nối tri thức với cuộc sống. Hôm nay, chúng ta cùng khởi đầu hành trình khám phá ${lesson.title}. Trước khi đi vào nội dung chính, các em hãy thử nghĩ xem: mỗi sáng thức dậy, chúng ta mở điện thoại xem dự báo thời tiết, bật bản đồ định vị G P S để tìm đường đến trường, hay tìm hiểu vì sao những vườn na đặc sản lại sinh trưởng tốt trên các sườn núi đá vôi ở Lạng Sơn. Tất cả những hoạt động quen thuộc ấy đều gắn liền với tri thức Địa lí. Vậy môn Địa lí ở cấp trung học phổ thông có gì khác biệt và mở ra những cơ hội nghề nghiệp hấp dẫn nào? Chúng ta hãy cùng khám phá ngay sau đây.`
    : `Chào mừng các em học sinh lớp 10 đến với bài giảng môn Địa lí, bộ sách Kết nối tri thức với cuộc sống. Trong bài học hôm nay, thầy cô cùng các em sẽ tìm hiểu ${lesson.title}, thuộc ${chapterTitle}. Đây là một chủ đề trọng tâm giúp các em hiểu rõ ${lesson.subtitle.toLowerCase()}, từ đó biết cách giải thích các hiện tượng tự nhiên hoặc kinh tế xã hội diễn ra xung quanh mình. Hãy chuẩn bị vở ghi, theo dõi sát các sơ đồ trên màn hình và cùng bắt đầu bài học ngay bây giờ.`;

  scenes.push({
    sceneNumber: sceneNo++,
    phase: 'intro',
    title: 'Mở đầu & Tình huống dẫn nhập',
    durationSeconds: 36,
    narration: introNarration,
    onScreenKeywords: [
      `Bài ${lesson.number}`,
      lesson.subtitle,
      chapterTitle,
      'Kết nối tri thức với cuộc sống',
    ],
    visualPrompt: `Introductory geography hero slide for ${lesson.title}`,
    visualType: 'illustration',
    subtitleText: introNarration,
  });

  // 2. OBJECTIVES SCENE
  const objSpoken = lesson.objectives
    .map((o, idx) => `Mục tiêu thứ ${idx + 1}: ${cleanBulletForSpeech(o)}`)
    .join('. ');
  const objectivesNarration = `Trước hết, chúng ta hãy xác định rõ những mục tiêu cần đạt sau khi hoàn thành bài học này. ${objSpoken}. Việc nắm vững các mục tiêu trên không chỉ giúp các em hệ thống hóa kiến thức sách giáo khoa một cách khoa học, mà còn là nền tảng vững chắc để vận dụng giải quyết các dạng câu hỏi trắc nghiệm, đúng sai, trả lời ngắn và ghép cột trong phần luyện tập.`;

  scenes.push({
    sceneNumber: sceneNo++,
    phase: 'objectives',
    title: 'Mục tiêu bài học cần đạt',
    durationSeconds: 34,
    narration: objectivesNarration,
    onScreenKeywords: lesson.objectives.slice(0, 4),
    visualPrompt: `Learning objectives roadmap for ${lesson.title}`,
    visualType: 'map_diagram',
    subtitleText: objectivesNarration,
  });

  // 3. KNOWLEDGE SCENES (one per keyKnowledge section, enriched pedagogically)
  lesson.keyKnowledge.forEach((section, idx) => {
    const cleanItems = section.content.map(cleanBulletForSpeech);
    let narration = '';

    if (isBai1 && idx === 0) {
      narration = `Chúng ta cùng bước vào nội dung trọng tâm đầu tiên: ${section.sectionTitle}. Ở bậc trung học phổ thông, môn Địa lí được xếp vào nhóm môn Khoa học Xã hội, nhưng lại mang bản chất hết sức độc đáo vì vừa gắn bó chặt chẽ với khoa học tự nhiên, vừa kết hợp sâu sắc với khoa học xã hội. Về mặt tự nhiên, Địa lí nghiên cứu các quy luật của lớp vỏ Trái Đất, từ địa hình, khí hậu, thủy văn cho tới đất đai và sinh vật. Về mặt xã hội, Địa lí phân tích sự phân bố dân cư, đô thị, sản xuất công nghiệp, nông nghiệp và dịch vụ trong không gian lãnh thổ. Cụ thể hơn, ${cleanItems.join('. ')}. ${section.highlight ? `Các em cần đặc biệt ghi nhớ điểm cốt lõi sau: ${cleanBulletForSpeech(section.highlight)}.` : ''} Chính tính tổng hợp không gian này giúp người học Địa lí nhìn nhận mọi vấn đề thực tiễn một cách toàn diện và có chiều sâu.`;
    } else if (isBai1 && idx === 1) {
      narration = `Tiếp theo, chúng ta tìm hiểu mục thứ hai: ${section.sectionTitle}. Tri thức Địa lí không hề khô khan trong trang sách mà hiện hữu trực tiếp trong từng quyết định hằng ngày của con người. Nhờ hiểu biết về quy luật tự nhiên và khí hậu, chúng ta biết cách phòng tránh thiên tai như lũ quét, sạt lở đất, hay thích ứng với biến đổi khí hậu. Trong sản xuất và đời sống, tri thức Địa lí hỗ trợ định vị không gian, đánh giá tài nguyên đất, nước, khoáng sản và xây dựng chiến lược phát triển bền vững. Như sách giáo khoa đã khái quát: ${cleanItems.join('. ')}. ${section.highlight ? `Điểm cần lưu ý nhất ở phần này là: ${cleanBulletForSpeech(section.highlight)}.` : ''} Nói cách khác, học Địa lí chính là học cách hiểu ngôi nhà chung Trái Đất để sống hài hòa và có trách nhiệm hơn.`;
    } else if (isBai1 && idx === 2) {
      const termsIntro = lesson.keyTerms
        .map((t) => `${t.term}, được hiểu là ${cleanBulletForSpeech(t.definition)}`)
        .join('. ');
      narration = `Nội dung trọng tâm thứ ba sẽ mở ra góc nhìn thực tế cho tương lai của các em: ${section.sectionTitle}. Hiện nay, nguồn nhân lực có nền tảng kiến thức Địa lí đang giữ vai trò then chốt ở nhiều lĩnh vực hiện đại. Trên sơ đồ màn hình là bốn nhóm nghề nghiệp tiêu biểu: thứ nhất là quản lí tài nguyên, bảo vệ môi trường, khí tượng thủy văn và quy hoạch đô thị; thứ hai là du lịch, lữ hành, thương mại, logistics và chuỗi cung ứng; thứ ba là nhóm ngành công nghệ cao sử dụng hệ thống thông tin địa lí G I S, viễn thám và bản đồ số; và thứ tư là giảng dạy, nghiên cứu khoa học và truyền thông về môi trường. ${cleanItems.join('. ')}. ${section.highlight ? `Ghi nhớ quan trọng: ${cleanBulletForSpeech(section.highlight)}.` : ''} Cùng với đó, các em cần phân biệt chính xác ba khái niệm nền tảng: ${termsIntro}.`;
    } else {
      const extraTerms =
        idx === lesson.keyKnowledge.length - 1 && lesson.keyTerms.length > 0
          ? ` Bên cạnh đó, các em cần nắm chắc các thuật ngữ cốt lõi gồm: ${lesson.keyTerms
              .map((t) => `${t.term} là ${cleanBulletForSpeech(t.definition)}`)
              .join('; ')}.`
          : '';
      narration = `Chúng ta chuyển sang nội dung trọng tâm thứ ${idx + 1}: ${section.sectionTitle}. Ở phần kiến thức này, các em hãy quan sát sơ đồ hệ thống trên màn hình và chú ý các luận điểm chính sau đây. ${cleanItems.join('. ')}. ${section.highlight ? `Điểm mấu chốt cần khắc sâu: ${cleanBulletForSpeech(section.highlight)}.` : ''}${extraTerms}`;
    }

    scenes.push({
      sceneNumber: sceneNo++,
      phase: 'knowledge',
      title: section.sectionTitle,
      durationSeconds: idx === 2 ? 52 : 46,
      narration,
      onScreenKeywords: section.content.slice(0, 4),
      visualPrompt: `Structured educational diagram for ${section.sectionTitle}`,
      visualType: idx === 0 ? 'map_diagram' : 'chart_data',
      subtitleText: narration,
    });
  });

  // Ensure Key Terms have an explicit visual mention if not Bai 1 with 3rd section
  if (!isBai1 && lesson.keyTerms.length > 0 && lesson.keyKnowledge.length < 3) {
    const termsText = lesson.keyTerms
      .map((t) => `${t.term}, nghĩa là ${cleanBulletForSpeech(t.definition)}`)
      .join('. ');
    const termsNarration = `Để củng cố chắc phần lí thuyết vừa học, chúng ta cùng điểm lại các thuật ngữ địa lí quan trọng trong bài. ${termsText}. Việc hiểu đúng từng khái niệm sẽ giúp các em tránh nhầm lẫn khi đọc ngữ liệu câu hỏi Đúng Sai và Trả lời ngắn.`;
    scenes.push({
      sceneNumber: sceneNo++,
      phase: 'knowledge',
      title: 'Hệ thống thuật ngữ & Khái niệm cốt lõi',
      durationSeconds: 36,
      narration: termsNarration,
      onScreenKeywords: lesson.keyTerms.map((t) => `${t.term}: ${t.definition}`).slice(0, 4),
      visualPrompt: `Key terminology visual cards for ${lesson.title}`,
      visualType: 'chart_data',
      subtitleText: termsNarration,
    });
  }

  // 4. LOCAL EXAMPLE SCENE (Lang Son & Practical Connection)
  const examplesJoined = lesson.realWorldExamples.map(cleanBulletForSpeech).join('. ');
  const localNarration = isBai1
    ? `Hãy cùng liên hệ ngay với thực tiễn sinh động tại quê hương Lạng Sơn của chúng ta. ${examplesJoined}. Chẳng hạn, tại vùng núi đá vôi Vạn Linh và Chi Lăng, người nông dân kết hợp cùng cán bộ nông nghiệp đã ứng dụng định vị G P S và bản đồ số G I S để lập bản đồ thổ nhưỡng, theo dõi độ dốc, hướng phơi và quản lí chất lượng từng vườn na đặc sản. Nhờ gắn tri thức Địa lí với công nghệ số, sản phẩm nông nghiệp địa phương không chỉ nâng cao năng suất mà còn mở rộng thị trường tiêu thụ gắn với du lịch sinh thái và thương mại cửa khẩu quốc tế tại Lạng Sơn. Điều đó cho thấy ngay tại địa phương, các em hoàn toàn có thể theo đuổi nhiều ngành nghề giàu tiềm năng bắt nguồn từ môn Địa lí.`
    : `Để kiến thức không chỉ nằm trên trang giấy, chúng ta hãy cùng liên hệ thực tiễn cuộc sống và địa phương Lạng Sơn. ${examplesJoined}. Qua những ví dụ cụ thể này, các em thấy rõ mối liên hệ mật thiết giữa quy luật địa lí với hoạt động sản xuất, bảo vệ môi trường và định hướng phát triển kinh tế tại địa phương mình.`;

  scenes.push({
    sceneNumber: sceneNo++,
    phase: 'local_example',
    title: 'Liên hệ thực tiễn & Địa phương Lạng Sơn',
    durationSeconds: 42,
    narration: localNarration,
    onScreenKeywords: lesson.realWorldExamples.slice(0, 3),
    visualPrompt: `Local Lang Son geography real world application for ${lesson.title}`,
    visualType: 'illustration',
    subtitleText: localNarration,
  });

  // 5. PRACTICE BRIDGE SCENE
  const practiceNarration = `Sau khi nắm vững bài giảng, các em hãy chuyển sang mục Luyện tập ngay trên Web App Địa lí 10 – Chinh phục tri thức. Hệ thống đã thiết kế đầy đủ bốn dạng câu hỏi bám sát định hướng thi tốt nghiệp trung học phổ thông mới. Với dạng Trắc nghiệm bốn phương án, hãy chú ý các từ khóa chỉ đặc điểm hoặc vai trò chính xác. Với dạng Đúng Sai theo ngữ liệu, các em cần đọc kĩ đoạn thông tin thực tế và đánh giá độc lập từng ý A, B, C, D. Với dạng Trả lời ngắn, hãy điền chính xác con số hoặc thuật ngữ ngắn gọn. Và với dạng Ghép cột, hãy đối chiếu thật kĩ giữa nhóm kiến thức hoặc ngành nghề tương ứng.`;

  scenes.push({
    sceneNumber: sceneNo++,
    phase: 'practice_bridge',
    title: 'Hướng dẫn luyện tập 4 dạng câu hỏi',
    durationSeconds: 32,
    narration: practiceNarration,
    onScreenKeywords: [
      '1. Trắc nghiệm 4 phương án',
      '2. Đúng / Sai theo ngữ liệu',
      '3. Trả lời ngắn chính xác',
      '4. Ghép cột kiến thức tương ứng',
    ],
    visualPrompt: `Interactive 4 question types guide for Geography Grade 10`,
    visualType: 'chart_data',
    subtitleText: practiceNarration,
  });

  // 6. SUMMARY SCENE
  const takeawaysJoined = lesson.keyTakeaways.map(cleanBulletForSpeech).join('. ');
  const summaryNarration = `Trước khi khép lại bài giảng, chúng ta cùng hệ thống hóa lại những thông điệp cốt lõi của ${lesson.title}. ${takeawaysJoined}. Hi vọng bài giảng hôm nay đã giúp các em không chỉ hiểu sâu kiến thức sách giáo khoa Địa lí 10 Kết nối tri thức mà còn thêm yêu thích môn học và sớm định hình hướng đi nghề nghiệp phù hợp với năng lực bản thân. Chúc các em hoàn thành xuất sắc phần luyện tập ngay bên dưới. Hẹn gặp lại các em ở bài học tiếp theo.`;

  scenes.push({
    sceneNumber: sceneNo++,
    phase: 'summary',
    title: 'Tổng kết & Ghi nhớ cốt lõi',
    durationSeconds: 32,
    narration: summaryNarration,
    onScreenKeywords: lesson.keyTakeaways.slice(0, 3),
    visualPrompt: `Summary mindmap for ${lesson.title}`,
    visualType: 'map_diagram',
    subtitleText: summaryNarration,
  });

  const targetDurationSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  const fullNarration = scenes.map((s) => `[${s.title}]\n${s.narration}`).join('\n\n');

  const draftScript: LessonVideoScript = {
    lessonId: lesson.id,
    title: lesson.title,
    learningObjectivesSummary: lesson.subtitle,
    targetDurationSeconds,
    voiceStyle: 'Giọng đọc tiếng Việt chuẩn (Piper TTS vi_VN-vais1000-medium - Ngoại tuyến 100% miễn phí)',
    fullNarration,
    webVttContent: '',
    scenes,
    updatedAt: Date.now(),
    generatedBy: 'ai_gemini', // Keep strict union compatibility; UI shows engine honestly
  };

  draftScript.webVttContent = buildPhraseSyncedWebVtt(
    scenes.map((s) => ({ scene: s, startSec: 0, durationSec: s.durationSeconds })),
    true
  );
  return draftScript;
}

function formatVttTimestamp(seconds: number): string {
  const safeMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(safeMs / 3600000);
  const mins = Math.floor((safeMs % 3600000) / 60000);
  const secs = Math.floor((safeMs % 60000) / 1000);
  const ms = safeMs % 1000;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function splitIntoSubtitleClauses(text: string): string[] {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Split into natural sentences first
  const rawSentences = clean
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const clauses: string[] = [];
  for (const sent of rawSentences) {
    const words = sent.split(' ');
    if (words.length <= 18) {
      clauses.push(sent);
      continue;
    }
    // Split longer sentence cleanly along punctuation or word chunks
    const subParts = sent.split(/(?<=[,;:])\s+/).filter(Boolean);
    let buffer = '';
    for (const part of subParts) {
      const cand = buffer ? `${buffer} ${part}` : part;
      if (cand.split(' ').length <= 18) {
        buffer = cand;
      } else {
        if (buffer) clauses.push(buffer);
        // If single clause is still > 18 words, chunk into ~14-word readable segments
        const pWords = part.split(' ');
        if (pWords.length > 18) {
          for (let i = 0; i < pWords.length; i += 14) {
            clauses.push(pWords.slice(i, i + 14).join(' '));
          }
          buffer = '';
        } else {
          buffer = part;
        }
      }
    }
    if (buffer) clauses.push(buffer);
  }
  return clauses.length > 0 ? clauses : [clean];
}

export function buildPhraseSyncedWebVtt(
  timedScenes: Array<{ scene: VideoScenePlan; startSec: number; durationSec: number }>,
  computeOffsetsFromDurations = false
): string {
  const lines: string[] = ['WEBVTT', ''];
  let cueIndex = 1;
  let runningCursor = 0;

  for (const item of timedScenes) {
    const sceneDur = Math.max(2, item.durationSec);
    const sceneStart = computeOffsetsFromDurations ? runningCursor : item.startSec;
    const rawText = (item.scene.narration || item.scene.subtitleText || item.scene.title).trim();
    const clauses = splitIntoSubtitleClauses(rawText);

    // Weight each clause by character length + small pause weight if ending a sentence
    const weights = clauses.map((c) => {
      const base = Math.max(8, c.length);
      const pauseBonus = /[.!?…]$/.test(c) ? 14 : /[,;:]$/.test(c) ? 6 : 0;
      return base + pauseBonus;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    const usableStart = sceneStart + 0.12;
    const usableSpan = Math.max(1.0, sceneDur - 0.24);
    let cursor = usableStart;

    for (let i = 0; i < clauses.length; i++) {
      const sliceDur = (weights[i] / totalWeight) * usableSpan;
      const cueStart = cursor;
      const cueEnd = i === clauses.length - 1 ? sceneStart + sceneDur - 0.08 : cursor + sliceDur - 0.04;
      lines.push(`${cueIndex++}`);
      lines.push(`${formatVttTimestamp(cueStart)} --> ${formatVttTimestamp(Math.max(cueStart + 0.4, cueEnd))}`);
      // Wrap at ~54 chars for clean 2-line HTML5 video caption display
      const wrapped = wrapLines(clauses[i], 54, 2).join('\n');
      lines.push(wrapped);
      lines.push('');
      cursor += sliceDur;
    }

    runningCursor += sceneDur;
  }

  return lines.join('\n');
}

export function isValidPngFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size < 8192) return false;
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(24);
    const bytesRead = fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);
    if (bytesRead < 24) return false;
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    return (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header.readUInt32BE(16) >= 640 &&
      header.readUInt32BE(20) >= 360
    );
  } catch {
    return false;
  }
}

function readPngWidthHeight(filePath: string): { width: number; height: number } | null {
  try {
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(24);
    const bytesRead = fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);
    if (bytesRead < 24) return null;
    return {
      width: header.readUInt32BE(16),
      height: header.readUInt32BE(20),
    };
  } catch {
    return null;
  }
}

export async function probeValidWavDuration(wavPath: string): Promise<number | null> {
  try {
    if (!fs.existsSync(wavPath) || fs.statSync(wavPath).size < 4096) return null;
    const ffprobe = fs.existsSync('/usr/bin/ffprobe') ? '/usr/bin/ffprobe' : 'ffprobe';
    const { stdout } = await execFileAsync(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name',
      '-of',
      'json',
      wavPath,
    ]);
    const parsed = JSON.parse(stdout || '{}');
    const dur = parseFloat(parsed?.format?.duration);
    const hasAudio = Array.isArray(parsed?.streams) && parsed.streams.some((s: any) => s.codec_type === 'audio');
    return hasAudio && Number.isFinite(dur) && dur > 0.5 ? dur : null;
  } catch {
    return null;
  }
}

export async function probeValidMp4Duration(
  mp4Path: string,
  verifyDecode = false
): Promise<{
  valid: boolean;
  durationSeconds: number;
  hasVideo: boolean;
  hasAudio: boolean;
  width: number;
  height: number;
  error?: string;
}> {
  try {
    if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).size < 8192) {
      return { valid: false, durationSeconds: 0, hasVideo: false, hasAudio: false, width: 0, height: 0, error: 'Tệp không tồn tại hoặc quá nhỏ' };
    }
    const ffprobe = fs.existsSync('/usr/bin/ffprobe') ? '/usr/bin/ffprobe' : 'ffprobe';
    const { stdout } = await execFileAsync(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name,width,height',
      '-of',
      'json',
      mp4Path,
    ]);
    const parsed = JSON.parse(stdout || '{}');
    const streams = Array.isArray(parsed?.streams) ? parsed.streams : [];
    const videoStream = streams.find((s: any) => s.codec_type === 'video');
    const audioStream = streams.find((s: any) => s.codec_type === 'audio');
    const dur = parseFloat(parsed?.format?.duration);
    if (!videoStream || !audioStream || !Number.isFinite(dur) || dur <= 0.5) {
      return {
        valid: false,
        durationSeconds: Number.isFinite(dur) ? dur : 0,
        hasVideo: Boolean(videoStream),
        hasAudio: Boolean(audioStream),
        width: Number(videoStream?.width) || 0,
        height: Number(videoStream?.height) || 0,
        error: 'Thiếu luồng hình ảnh/âm thanh hoặc thời lượng không hợp lệ',
      };
    }

    if (verifyDecode) {
      const ffmpeg = fs.existsSync('/usr/bin/ffmpeg') ? '/usr/bin/ffmpeg' : 'ffmpeg';
      await execFileAsync(
        ffmpeg,
        ['-v', 'error', '-i', mp4Path, '-f', 'null', '-'],
        { maxBuffer: 1024 * 1024 * 8 }
      );
    }

    return {
      valid: true,
      durationSeconds: dur,
      hasVideo: true,
      hasAudio: true,
      width: Number(videoStream.width) || 1280,
      height: Number(videoStream.height) || 720,
    };
  } catch (err: any) {
    return {
      valid: false,
      durationSeconds: 0,
      hasVideo: false,
      hasAudio: false,
      width: 0,
      height: 0,
      error: String(err?.message || err || 'Lỗi kiểm tra MP4'),
    };
  }
}

export async function synthesizePiperWav(text: string, outputWavPath: string): Promise<number> {
  await ensurePiperInstalled();
  if (!fs.existsSync(PIPER_BIN) || !fs.existsSync(PIPER_MODEL)) {
    throw new Error('Thiếu công cụ Piper TTS hoặc mô hình giọng tiếng Việt vi_VN-vais1000-medium trên máy chủ.');
  }
  const spokenText = normalizeVietnameseForTts(text);
  const tmpWavPath = `${outputWavPath}.tmp.wav`;
  if (fs.existsSync(tmpWavPath)) {
    try { fs.unlinkSync(tmpWavPath); } catch { /* ignore */ }
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      PIPER_BIN,
      [
        '--model',
        PIPER_MODEL,
        '--length_scale',
        '1.00',
        '--sentence_silence',
        '0.32',
        '--output_file',
        tmpWavPath,
      ],
      { stdio: ['pipe', 'pipe', 'pipe'] }
    );
    let stderr = '';
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on('error', (err: Error) => reject(err));
    proc.on('close', (code: number) => {
      if (code === 0 && fs.existsSync(tmpWavPath)) {
        resolve();
      } else {
        try { if (fs.existsSync(tmpWavPath)) fs.unlinkSync(tmpWavPath); } catch { /* ignore */ }
        reject(new Error(`Piper TTS thất bại (code ${code}): ${stderr.slice(0, 300)}`));
      }
    });
    proc.stdin.write(`${spokenText}\n`);
    proc.stdin.end();
  });

  const dur = await probeValidWavDuration(tmpWavPath);
  if (!dur) {
    try { if (fs.existsSync(tmpWavPath)) fs.unlinkSync(tmpWavPath); } catch { /* ignore */ }
    throw new Error('Tệp âm thanh Piper TTS tạo ra không hợp lệ.');
  }
  fs.renameSync(tmpWavPath, outputWavPath);
  return dur;
}

function renderSvgTextBlock(
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  fontSize: number,
  fill: string,
  weight: 'normal' | 'bold' = 'normal',
  anchor: 'start' | 'middle' = 'start'
): string {
  return lines
    .map(
      (line, idx) =>
        `<text x="${x}" y="${y + idx * lineHeight}" font-family="Noto Sans" font-weight="${weight}" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}">${escapeXml(line)}</text>`
    )
    .join('\n');
}

function buildSceneSvg(
  lesson: Lesson,
  scene: VideoScenePlan,
  sceneIndex: number,
  totalScenes: number,
  partTitle: string,
  chapterTitle: string
): string {
  const W = 1440;
  const H = 810;
  const progressRatio = Math.round(((sceneIndex + 1) / Math.max(1, totalScenes)) * 100);

  const phaseLabels: Record<VideoScenePlan['phase'], string> = {
    intro: 'MỞ ĐẦU & DẪN NHẬP',
    objectives: 'MỤC TIÊU CẦN ĐẠT',
    knowledge: 'KIẾN THỨC TRỌNG TÂM',
    local_example: 'THỰC TIỄN ĐỊA PHƯƠNG LẠNG SƠN',
    practice_bridge: 'CHINH PHỤC 4 DẠNG BÀI TẬP',
    summary: 'TỔNG KẾT & GHI NHỚ',
  };

  const phaseLabel = phaseLabels[scene.phase] || 'BÀI GIẢNG ĐỊA LÍ 10';
  const headerSubtitle = chapterTitle && lesson.chapterId ? chapterTitle : partTitle;

  let bodySvg = '';

  if (scene.phase === 'intro') {
    const titleLines = wrapLines(lesson.title, 34, 2);
    const subLines = wrapLines(lesson.subtitle, 52, 2);
    const questionHighlight =
      lesson.id === 'bai-1'
        ? 'Vì sao Địa lí vừa kết nối Tự nhiên – Xã hội, vừa mở rộng định hướng nghề nghiệp hiện đại?'
        : `Trọng tâm khám phá: ${lesson.subtitle}`;
    const qLines = wrapLines(questionHighlight, 58, 2);

    bodySvg = `
      <!-- Right side stylized Earth + Meridian/Parallel Globe & Compass Diagram -->
      <g transform="translate(1070, 385)">
        <circle cx="0" cy="0" r="220" fill="#0f766e" opacity="0.14"/>
        <circle cx="0" cy="0" r="185" fill="#14b8a6" opacity="0.16"/>
        <circle cx="0" cy="0" r="150" fill="url(#globeGrad)" stroke="#5eead4" stroke-width="3"/>
        <ellipse cx="0" cy="0" rx="68" ry="150" fill="none" stroke="#99f6e4" stroke-width="1.8" opacity="0.55"/>
        <ellipse cx="0" cy="0" rx="122" ry="150" fill="none" stroke="#99f6e4" stroke-width="1.5" opacity="0.35"/>
        <line x1="-150" y1="0" x2="150" y2="0" stroke="#99f6e4" stroke-width="2" opacity="0.65"/>
        <ellipse cx="0" cy="-65" rx="135" ry="22" fill="none" stroke="#99f6e4" stroke-width="1.5" opacity="0.45"/>
        <ellipse cx="0" cy="65" rx="135" ry="22" fill="none" stroke="#99f6e4" stroke-width="1.5" opacity="0.45"/>
        <!-- stylized continents -->
        <path d="M-75,-60 C-40,-90 15,-85 45,-50 C70,-20 60,35 20,65 C-25,85 -70,45 -85,10 Z" fill="#10b981" opacity="0.55"/>
        <path d="M40,25 C75,20 110,45 95,85 C75,115 35,105 28,70 Z" fill="#34d399" opacity="0.45"/>
        <!-- Location pin -->
        <circle cx="52" cy="-28" r="10" fill="#fbbf24" stroke="#ffffff" stroke-width="3"/>
        <circle cx="52" cy="-28" r="24" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.6"/>
        <!-- Orbiting badge -->
        <g transform="translate(-145, -135)">
          <rect x="0" y="0" width="150" height="44" rx="12" fill="#0f172a" stroke="#2dd4bf" stroke-width="2"/>
          <text x="75" y="28" font-family="Noto Sans" font-weight="bold" font-size="16" fill="#5eead4" text-anchor="middle">GIS &amp; GPS SỐ</text>
        </g>
        <g transform="translate(8, 130)">
          <rect x="0" y="0" width="196" height="44" rx="12" fill="#0f172a" stroke="#fbbf24" stroke-width="2"/>
          <text x="98" y="28" font-family="Noto Sans" font-weight="bold" font-size="15.5" fill="#fde68a" text-anchor="middle">ĐỊNH HƯỚNG NGHỀ</text>
        </g>
      </g>

      <!-- Left side Hero Content -->
      <rect x="76" y="135" width="330" height="42" rx="10" fill="#115e59" stroke="#2dd4bf" stroke-width="1.5"/>
      <text x="241" y="162" font-family="Noto Sans" font-weight="bold" font-size="17" fill="#ccfbf1" text-anchor="middle">BÀI GIẢNG ĐỊA LÍ 10 • BÀI ${lesson.number}</text>

      ${renderSvgTextBlock(titleLines, 76, 240, 62, 48, '#ffffff', 'bold')}
      ${renderSvgTextBlock(subLines, 76, 368, 36, 24, '#cbd5e1', 'normal')}

      <!-- Guiding Inquiry Card -->
      <rect x="76" y="455" width="710" height="145" rx="20" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <rect x="76" y="455" width="10" height="145" rx="5" fill="#f59e0b"/>
      <text x="108" y="492" font-family="Noto Sans" font-weight="bold" font-size="18" fill="#fbbf24">CÂU HỎI GỢI MỞ THỰC TIỄN</text>
      ${renderSvgTextBlock(qLines, 108, 532, 32, 22, '#f8fafc', 'normal')}
    `;
  } else if (scene.phase === 'objectives') {
    const objs = lesson.objectives.slice(0, 4);
    const cards = objs
      .map((obj, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = 76 + col * 655;
        const cy = 205 + row * 235;
        const accentColors = ['#14b8a6', '#38bdf8', '#f59e0b', '#34d399'];
        const acc = accentColors[idx % accentColors.length];
        const lines = wrapLines(obj, 42, 4);
        return `
          <g transform="translate(${cx}, ${cy})">
            <rect x="0" y="0" width="625" height="205" rx="20" fill="#1e293b" stroke="${acc}" stroke-width="2"/>
            <circle cx="52" cy="52" r="28" fill="${acc}" opacity="0.22" stroke="${acc}" stroke-width="2"/>
            <text x="52" y="60" font-family="Noto Sans" font-weight="bold" font-size="22" fill="${acc}" text-anchor="middle">0${idx + 1}</text>
            <text x="98" y="56" font-family="Noto Sans" font-weight="bold" font-size="20" fill="${acc}">MỤC TIÊU CẦN ĐẠT ${idx + 1}</text>
            ${renderSvgTextBlock(lines, 34, 106, 30, 21, '#f1f5f9', 'normal')}
          </g>
        `;
      })
      .join('\n');

    bodySvg = `
      <text x="76" y="158" font-family="Noto Sans" font-weight="bold" font-size="34" fill="#ffffff">Mục tiêu học sinh cần nắm vững sau bài học</text>
      ${cards}
    `;
  } else if (scene.phase === 'knowledge') {
    const knowledgeIdx = lesson.keyKnowledge.findIndex((k) => k.sectionTitle === scene.title);
    const sec = knowledgeIdx >= 0 ? lesson.keyKnowledge[knowledgeIdx] : null;
    const isCareerOrFirstBai1 = lesson.id === 'bai-1' && knowledgeIdx === 0;
    const isCareerThirdBai1 = lesson.id === 'bai-1' && knowledgeIdx === 2;

    const titleLines = wrapLines(scene.title, 44, 2);

    if (isCareerOrFirstBai1 && sec) {
      // Interlocking Natural + Spatial Geography + Social Sciences Venn Diagram on Right + Points on Left
      const bullets = sec.content.slice(0, 3).map((item, idx) => {
        const bLines = wrapLines(item, 44, 3);
        const by = 225 + idx * 120;
        return `
          <rect x="76" y="${by}" width="680" height="104" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
          <circle cx="108" cy="${by + 36}" r="14" fill="#14b8a6"/>
          <text x="108" y="${by + 42}" font-family="Noto Sans" font-weight="bold" font-size="15" fill="#0f172a" text-anchor="middle">${idx + 1}</text>
          ${renderSvgTextBlock(bLines, 138, by + 38, 28, 20, '#f1f5f9', 'normal')}
        `;
      }).join('\n');

      const hlLines = sec.highlight ? wrapLines(sec.highlight, 52, 2) : [];

      bodySvg = `
        ${renderSvgTextBlock(titleLines, 76, 150, 42, 32, '#ffffff', 'bold')}
        ${bullets}
        ${sec.highlight ? `
          <rect x="76" y="592" width="680" height="92" rx="16" fill="#0f766e" opacity="0.28" stroke="#2dd4bf" stroke-width="2"/>
          <text x="102" y="624" font-family="Noto Sans" font-weight="bold" font-size="17" fill="#5eead4">LƯU Ý TRỌNG TÂM</text>
          ${renderSvgTextBlock(hlLines, 102, 654, 26, 19, '#ffffff', 'normal')}
        ` : ''}

        <!-- Right Visual Diagram: Geography Bridge -->
        <g transform="translate(800, 190)">
          <rect x="0" y="0" width="564" height="495" rx="24" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
          <text x="282" y="44" font-family="Noto Sans" font-weight="bold" font-size="21" fill="#5eead4" text-anchor="middle">SƠ ĐỒ BẢN CHẤT KHOA HỌC ĐỊA LÍ</text>

          <circle cx="282" cy="175" r="95" fill="#0284c7" opacity="0.28" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="282" y="156" font-family="Noto Sans" font-weight="bold" font-size="18" fill="#bae6fd" text-anchor="middle">KHOA HỌC TỰ NHIÊN</text>
          <text x="282" y="182" font-family="Noto Sans" font-size="15" fill="#e0f2fe" text-anchor="middle">Địa hình • Khí hậu</text>
          <text x="282" y="204" font-family="Noto Sans" font-size="15" fill="#e0f2fe" text-anchor="middle">Thủy văn • Sinh vật</text>

          <circle cx="282" cy="345" r="95" fill="#d97706" opacity="0.28" stroke="#fbbf24" stroke-width="2.5"/>
          <text x="282" y="346" font-family="Noto Sans" font-weight="bold" font-size="18" fill="#fde68a" text-anchor="middle">KHOA HỌC XÃ HỘI</text>
          <text x="282" y="372" font-family="Noto Sans" font-size="15" fill="#fef3c7" text-anchor="middle">Dân cư • Đô thị • Kinh tế</text>
          <text x="282" y="394" font-family="Noto Sans" font-size="15" fill="#fef3c7" text-anchor="middle">Quy hoạch lãnh thổ</text>

          <!-- Intersection Core -->
          <rect x="132" y="232" width="300" height="58" rx="29" fill="#0f766e" stroke="#5eead4" stroke-width="3"/>
          <text x="282" y="267" font-family="Noto Sans" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">ĐỊA LÍ TỔNG HỢP (GDPT 2018)</text>

          <text x="282" y="468" font-family="Noto Sans" font-size="16" fill="#94a3b8" text-anchor="middle">Thuộc nhóm Khoa học Xã hội • Tư duy không gian</text>
        </g>
      `;
    } else if (isCareerThirdBai1 && sec) {
      // 4 Career Quadrants + 3 Key Term Strips
      const careerCards = [
        { num: '01', title: 'Tài nguyên – Môi trường', desc: 'Quản lí đất đai, khí tượng thủy văn, quy hoạch đô thị – vùng', color: '#14b8a6' },
        { num: '02', title: 'Du lịch – Logistics', desc: 'Hướng dẫn viên, lữ hành, thương mại, chuỗi cung ứng – cửa khẩu', color: '#f59e0b' },
        { num: '03', title: 'Công nghệ GIS – Bản đồ số', desc: 'Kĩ sư hệ thống thông tin địa lí GIS, viễn thám, phân tích không gian', color: '#38bdf8' },
        { num: '04', title: 'Sư phạm – Nghiên cứu', desc: 'Giảng dạy Địa lí, nghiên cứu khoa học địa lí, truyền thông môi trường', color: '#a78bfa' },
      ];
      const cardsSvg = careerCards
        .map((c, i) => {
          const x = 76 + i * 326;
          const descLines = wrapLines(c.desc, 24, 4);
          return `
            <g transform="translate(${x}, 205)">
              <rect x="0" y="0" width="306" height="240" rx="18" fill="#1e293b" stroke="${c.color}" stroke-width="2"/>
              <rect x="0" y="0" width="306" height="52" rx="18" fill="${c.color}" opacity="0.2"/>
              <text x="18" y="33" font-family="Noto Sans" font-weight="bold" font-size="16" fill="${c.color}">${c.num}. ${escapeXml(c.title)}</text>
              ${renderSvgTextBlock(descLines, 20, 90, 29, 18.5, '#f1f5f9', 'normal')}
            </g>
          `;
        })
        .join('\n');

      const termsSvg = lesson.keyTerms.slice(0, 3).map((t, i) => {
        const x = 76 + i * 436;
        const dLines = wrapLines(t.definition, 34, 3);
        return `
          <g transform="translate(${x}, 495)">
            <rect x="0" y="0" width="416" height="182" rx="16" fill="#0f172a" stroke="#2dd4bf" stroke-width="1.8"/>
            <text x="22" y="38" font-family="Noto Sans" font-weight="bold" font-size="18" fill="#5eead4">${escapeXml(t.term)}</text>
            <line x1="22" y1="52" x2="394" y2="52" stroke="#1e293b" stroke-width="2"/>
            ${renderSvgTextBlock(dLines, 22, 84, 27, 17.5, '#cbd5e1', 'normal')}
          </g>
        `;
      }).join('\n');

      bodySvg = `
        ${renderSvgTextBlock(titleLines, 76, 152, 42, 32, '#ffffff', 'bold')}
        ${cardsSvg}
        <text x="76" y="478" font-family="Noto Sans" font-weight="bold" font-size="18" fill="#94a3b8">THUẬT NGỮ CỐT LÕI CẦN NHỚ</text>
        ${termsSvg}
      `;
    } else {
      // General Knowledge Section Layout (Structured Bullets + Highlight + Keywords Visual Card)
      const items = sec ? sec.content.slice(0, 4) : scene.onScreenKeywords.slice(0, 4);
      const itemCards = items
        .map((item, idx) => {
          const y = 215 + idx * 112;
          const lines = wrapLines(item, 58, 3);
          return `
            <rect x="76" y="${y}" width="835" height="96" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
            <rect x="76" y="${y}" width="8" height="96" rx="4" fill="#14b8a6"/>
            <circle cx="116" cy="${y + 48}" r="18" fill="#0f766e"/>
            <text x="116" y="${y + 54}" font-family="Noto Sans" font-weight="bold" font-size="17" fill="#ffffff" text-anchor="middle">${idx + 1}</text>
            ${renderSvgTextBlock(lines, 152, y + 36, 27, 20, '#f8fafc', 'normal')}
          `;
        })
        .join('\n');

      const hl = sec?.highlight || lesson.keyTakeaways[0] || lesson.subtitle;
      const hlLines = wrapLines(hl, 28, 7);

      bodySvg = `
        ${renderSvgTextBlock(titleLines, 76, 152, 42, 32, '#ffffff', 'bold')}
        ${itemCards}
        <!-- Right Focus Card -->
        <g transform="translate(940, 215)">
          <rect x="0" y="0" width="424" height="432" rx="22" fill="#0f766e" opacity="0.22" stroke="#2dd4bf" stroke-width="2"/>
          <circle cx="212" cy="78" r="38" fill="#14b8a6" opacity="0.25" stroke="#5eead4" stroke-width="2"/>
          <polygon points="212,56 218,70 233,71 221,81 225,96 212,87 199,96 203,81 191,71 206,70" fill="#5eead4"/>
          <text x="212" y="148" font-family="Noto Sans" font-weight="bold" font-size="21" fill="#5eead4" text-anchor="middle">TRỌNG TÂM CẦN NHỚ</text>
          <line x1="40" y1="168" x2="384" y2="168" stroke="#2dd4bf" stroke-width="1.5" opacity="0.4"/>
          ${renderSvgTextBlock(hlLines, 34, 212, 31, 21, '#ffffff', 'normal')}
        </g>
      `;
    }
  } else if (scene.phase === 'local_example') {
    const examples = lesson.realWorldExamples.slice(0, 3);
    const cards = examples
      .map((ex, idx) => {
        const y = 215 + idx * 155;
        const lines = wrapLines(ex, 54, 4);
        return `
          <rect x="76" y="${y}" width="775" height="135" rx="18" fill="#1e293b" stroke="#10b981" stroke-width="1.8"/>
          <text x="104" y="${y + 34}" font-family="Noto Sans" font-weight="bold" font-size="16" fill="#34d399">THỰC TIỄN ${idx + 1} • LẠNG SƠN &amp; ĐỜI SỐNG</text>
          ${renderSvgTextBlock(lines, 104, y + 66, 28, 20, '#f8fafc', 'normal')}
        `;
      })
      .join('\n');

    bodySvg = `
      <text x="76" y="156" font-family="Noto Sans" font-weight="bold" font-size="34" fill="#ffffff">Liên hệ thực tiễn &amp; Địa phương Lạng Sơn</text>
      ${cards}
      <!-- Right side stylized Karst + GIS + Logistics schematic -->
      <g transform="translate(882, 215)">
        <rect x="0" y="0" width="482" height="445" rx="24" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
        <text x="241" y="44" font-family="Noto Sans" font-weight="bold" font-size="20" fill="#6ee7b7" text-anchor="middle">MÔ HÌNH ĐỊA LÍ THỰC TIỄN</text>
        <!-- Limestone Karst silhouettes -->
        <path d="M36,270 L105,155 L175,245 L245,130 L330,235 L395,165 L446,270 Z" fill="#065f46" opacity="0.65"/>
        <path d="M36,270 L130,210 L225,255 L320,195 L446,270 Z" fill="#10b981" opacity="0.5"/>
        <!-- Satellite / GPS grid lines -->
        <circle cx="245" cy="96" r="14" fill="#fbbf24"/>
        <line x1="245" y1="112" x2="185" y2="215" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,6"/>
        <line x1="245" y1="112" x2="310" y2="215" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,6"/>
        <circle cx="185" cy="215" r="8" fill="#fbbf24"/>
        <circle cx="310" cy="215" r="8" fill="#fbbf24"/>

        <rect x="30" y="295" width="422" height="122" rx="14" fill="#1e293b" stroke="#2dd4bf" stroke-width="1.5"/>
        <text x="48" y="330" font-family="Noto Sans" font-weight="bold" font-size="17" fill="#5eead4">ỨNG DỤNG TẠI LẠNG SƠN</text>
        <text x="48" y="362" font-family="Noto Sans" font-size="15.5" fill="#e2e8f0">• Định vị GPS/GIS vùng na Vạn Linh – Chi Lăng</text>
        <text x="48" y="392" font-family="Noto Sans" font-size="15.5" fill="#e2e8f0">• Phát triển du lịch &amp; kinh tế cửa khẩu quốc tế</text>
      </g>
    `;
  } else if (scene.phase === 'practice_bridge') {
    const qTypes = [
      { code: 'DẠNG 1', title: 'Trắc nghiệm 4 phương án', tip: 'Xác định đúng từ khóa trọng tâm câu hỏi, loại trừ phương án nhiễu.', color: '#14b8a6' },
      { code: 'DẠNG 2', title: 'Đúng / Sai theo ngữ liệu', tip: 'Đọc kĩ ngữ liệu thực tế và phân tích độc lập từng phát biểu a, b, c, d.', color: '#38bdf8' },
      { code: 'DẠNG 3', title: 'Trả lời ngắn', tip: 'Viết chính xác con số, đơn vị hoặc tên thuật ngữ địa lí theo yêu cầu.', color: '#f59e0b' },
      { code: 'DẠNG 4', title: 'Ghép cột tương ứng', tip: 'Đối chiếu mối quan hệ nhân quả, khái niệm hoặc nhóm nghề tương ứng.', color: '#a78bfa' },
    ];
    const cards = qTypes
      .map((qt, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 76 + col * 655;
        const y = 210 + row * 235;
        const tLines = wrapLines(qt.tip, 44, 3);
        return `
          <g transform="translate(${x}, ${y})">
            <rect x="0" y="0" width="625" height="205" rx="20" fill="#1e293b" stroke="${qt.color}" stroke-width="2"/>
            <rect x="28" y="24" width="110" height="32" rx="8" fill="${qt.color}"/>
            <text x="83" y="46" font-family="Noto Sans" font-weight="bold" font-size="16" fill="#0f172a" text-anchor="middle">${qt.code}</text>
            <text x="155" y="47" font-family="Noto Sans" font-weight="bold" font-size="22" fill="#ffffff">${escapeXml(qt.title)}</text>
            ${renderSvgTextBlock(tLines, 28, 102, 32, 20.5, '#cbd5e1', 'normal')}
          </g>
        `;
      })
      .join('\n');

    bodySvg = `
      <text x="76" y="158" font-family="Noto Sans" font-weight="bold" font-size="34" fill="#ffffff">Sẵn sàng chinh phục 4 dạng bài luyện tập trên Web App</text>
      ${cards}
    `;
  } else {
    // summary phase
    const takeaways = lesson.keyTakeaways.slice(0, 3);
    const cards = takeaways
      .map((tk, i) => {
        const y = 225 + i * 138;
        const lines = wrapLines(tk, 56, 3);
        return `
          <rect x="76" y="${y}" width="845" height="118" rx="18" fill="#1e293b" stroke="#2dd4bf" stroke-width="1.8"/>
          <circle cx="118" cy="${y + 59}" r="22" fill="#0f766e"/>
          <path d="M109,${y + 59} L115,${y + 65} L128,${y + 52}" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
          ${renderSvgTextBlock(lines, 160, y + 44, 30, 21, '#f8fafc', 'normal')}
        `;
      })
      .join('\n');

    bodySvg = `
      <text x="76" y="158" font-family="Noto Sans" font-weight="bold" font-size="34" fill="#ffffff">Hệ thống hóa &amp; Ghi nhớ cốt lõi Bài ${lesson.number}</text>
      ${cards}
      <g transform="translate(950, 225)">
        <rect x="0" y="0" width="414" height="394" rx="24" fill="#115e59" stroke="#5eead4" stroke-width="2.5"/>
        <circle cx="207" cy="95" r="46" fill="#0f172a" stroke="#fbbf24" stroke-width="3"/>
        <text x="195" y="106" font-family="Noto Sans" font-weight="bold" font-size="32" fill="#fbbf24" text-anchor="middle">10</text>
        <polygon points="231,81 235,90 244,91 237,97 239,106 231,101 223,106 225,97 218,91 227,90" fill="#fbbf24"/>
        <text x="207" y="185" font-family="Noto Sans" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">HOÀN THÀNH BÀI GIẢNG</text>
        <text x="207" y="232" font-family="Noto Sans" font-size="18.5" fill="#ccfbf1" text-anchor="middle">Chuyển ngay sang phần Luyện tập</text>
        <text x="207" y="264" font-family="Noto Sans" font-size="18.5" fill="#ccfbf1" text-anchor="middle">để củng cố kiến thức &amp; đạt điểm cao!</text>
        <rect x="34" y="305" width="346" height="50" rx="14" fill="#fbbf24"/>
        <text x="207" y="336" font-family="Noto Sans" font-weight="bold" font-size="16" fill="#0f172a" text-anchor="middle">ĐỊA LÍ 10 • CHINH PHỤC TRI THỨC</text>
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09111e"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0a2529"/>
    </linearGradient>
    <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <radialGradient id="globeGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="65%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <!-- Subtle Grid Texture -->
  <g stroke="#1e293b" stroke-width="1" opacity="0.45">
    <line x1="0" y1="180" x2="${W}" y2="180"/>
    <line x1="0" y1="360" x2="${W}" y2="360"/>
    <line x1="0" y1="540" x2="${W}" y2="540"/>
    <line x1="360" y1="88" x2="360" y2="740"/>
    <line x1="720" y1="88" x2="720" y2="740"/>
    <line x1="1080" y1="88" x2="1080" y2="740"/>
  </g>

  <!-- Header Bar -->
  <rect x="0" y="0" width="${W}" height="86" fill="url(#topBar)"/>
  <text x="76" y="40" font-family="Noto Sans" font-weight="bold" font-size="21" fill="#ffffff">ĐỊA LÍ 10 – KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</text>
  <text x="76" y="68" font-family="Noto Sans" font-size="16" fill="#ccfbf1">${escapeXml(headerSubtitle)} • ${escapeXml(lesson.title)}</text>

  <rect x="1020" y="20" width="344" height="46" rx="12" fill="#0f172a" opacity="0.88"/>
  <text x="1192" y="49" font-family="Noto Sans" font-weight="bold" font-size="16" fill="#5eead4" text-anchor="middle">${escapeXml(phaseLabel)} (${sceneIndex + 1}/${totalScenes})</text>

  <!-- Scene Body -->
  ${bodySvg}

  <!-- Bottom Progress Footer -->
  <rect x="0" y="742" width="${W}" height="68" fill="#060b14" opacity="0.92"/>
  <rect x="76" y="758" width="1288" height="8" rx="4" fill="#1e293b"/>
  <rect x="76" y="758" width="${Math.round(1288 * (progressRatio / 100))}" height="8" rx="4" fill="#14b8a6"/>
  <text x="76" y="794" font-family="Noto Sans" font-size="15" fill="#94a3b8">Web App Địa lí 10 – Chinh phục tri thức • Bài giảng ngoại tuyến SGK Chuẩn GDPT 2018</text>
  <text x="1364" y="794" font-family="Noto Sans" font-weight="bold" font-size="15" fill="#5eead4" text-anchor="end">Cảnh ${sceneIndex + 1} / ${totalScenes}</text>
</svg>`;
}

export function renderSceneSlidePng(
  lesson: Lesson,
  scene: VideoScenePlan,
  sceneIndex: number,
  totalScenes: number,
  partTitle: string,
  chapterTitle: string,
  outputPngPath: string
): void {
  const svg = buildSceneSvg(lesson, scene, sceneIndex, totalScenes, partTitle, chapterTitle);
  // Render directly at exact 1280x720 HD (16:9) so FFmpeg needs zero per-frame scaling
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1280 },
    font: {
      loadSystemFonts: false,
      fontFiles: NOTO_FONT_FILES,
      defaultFontFamily: 'Noto Sans',
    },
  });
  const pngBuffer = resvg.render().asPng();
  const tmpPngPath = `${outputPngPath}.tmp.png`;
  fs.writeFileSync(tmpPngPath, pngBuffer);
  fs.renameSync(tmpPngPath, outputPngPath);
}

export async function renderAnimatedSceneMp4(
  imgPath: string,
  wavPath: string,
  audioDurationSec: number,
  _sceneIndex: number,
  outMp4Path: string
): Promise<void> {
  const ffmpeg = fs.existsSync('/usr/bin/ffmpeg') ? '/usr/bin/ffmpeg' : 'ffmpeg';
  const safeDur = Math.max(2, audioDurationSec);
  const durStr = safeDur.toFixed(3);
  const fadeOutStart = Math.max(0.4, safeDur - 0.35).toFixed(2);

  // If preserved legacy PNG is not 1280x720, scale ONCE into a temp PNG
  let feedImgPath = imgPath;
  let tempScaledImgPath: string | null = null;
  const dims = readPngWidthHeight(imgPath);
  if (dims && (dims.width !== 1280 || dims.height !== 720)) {
    tempScaledImgPath = `${imgPath}.1280.tmp.png`;
    await execFileAsync(ffmpeg, [
      '-y',
      '-i',
      imgPath,
      '-vf',
      'scale=1280:720:flags=lanczos',
      tempScaledImgPath,
    ]);
    feedImgPath = tempScaledImgPath;
  }

  // Crisp 1280x720 HD slide with clean fade-in/out (stillimage tuned: ~6x smaller & ~10x faster)
  const vf = [
    `fade=t=in:st=0:d=0.35:color=0x09111e`,
    `fade=t=out:st=${fadeOutStart}:d=0.35:color=0x09111e`,
    `format=yuv420p`,
  ].join(',');

  const afadeOutStart = Math.max(0.2, safeDur - 0.15).toFixed(2);
  const af = `afade=t=in:st=0:d=0.10,afade=t=out:st=${afadeOutStart}:d=0.15`;

  const tmpOutPath = `${outMp4Path}.tmp.mp4`;
  if (fs.existsSync(tmpOutPath)) {
    try { fs.unlinkSync(tmpOutPath); } catch { /* ignore */ }
  }

  try {
    await execFileAsync(
      ffmpeg,
      [
        '-y',
        '-loop',
        '1',
        '-framerate',
        '4',
        '-i',
        feedImgPath,
        '-i',
        wavPath,
        '-t',
        durStr,
        '-vf',
        vf,
        '-af',
        af,
        '-ar',
        '22050',
        '-ac',
        '1',
        '-c:v',
        'libx264',
        '-profile:v',
        'main',
        '-level',
        '3.1',
        '-preset',
        'veryfast',
        '-tune',
        'stillimage',
        '-crf',
        '26',
        '-g',
        '240',
        '-threads',
        '2',
        '-c:a',
        'aac',
        '-b:a',
        '48k',
        '-shortest',
        tmpOutPath,
      ],
      { maxBuffer: 1024 * 1024 * 16 }
    );

    const check = await probeValidMp4Duration(tmpOutPath, false);
    if (!check.valid) {
      throw new Error(`Tệp cảnh MP4 xuất ra không hợp lệ: ${check.error || 'unknown'}`);
    }
    fs.renameSync(tmpOutPath, outMp4Path);
  } catch (err) {
    try { if (fs.existsSync(tmpOutPath)) fs.unlinkSync(tmpOutPath); } catch { /* ignore */ }
    throw err;
  } finally {
    if (tempScaledImgPath && fs.existsSync(tempScaledImgPath)) {
      try { fs.unlinkSync(tempScaledImgPath); } catch { /* ignore */ }
    }
  }
}
