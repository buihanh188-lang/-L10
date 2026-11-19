import fs from 'fs';
import path from 'path';
import type { LessonVideoRecord } from '../src/types/index.ts';
import {
  exportExternalVideoLinksBackup,
  getTeacherLessonVideo,
  setLessonExternalVideoLink,
  VideoPipelineError,
} from './videoService.ts';

const VIDEOS_ROOT_DIR = path.resolve(process.cwd(), 'data', 'videos');
export const DEFAULT_DRIVE_FOLDER_NAME = 'Địa lí 10 - Kho Video Bài Giảng';
const BACKUP_JSON_FILENAME = 'diali10-video-links-backup.json';

function extractGoogleErrorMessage(rawText: string, fallback: string): string {
  try {
    const parsed = JSON.parse(rawText);
    const msg = parsed?.error?.message;
    if (msg) return String(msg);
  } catch {
    // ignore
  }
  return fallback;
}

function handleDriveHttpStatus(status: number, rawText: string, actionLabel: string): never {
  if (status === 401) {
    throw new VideoPipelineError(
      'DRIVE_TOKEN_EXPIRED',
      'Phiên kết nối Google Drive đã hết hạn. Vui lòng bấm đăng nhập lại Google Drive.',
      401
    );
  }
  if (status === 403) {
    const detail = extractGoogleErrorMessage(rawText, 'Thiếu quyền ghi vào Google Drive.');
    throw new VideoPipelineError('DRIVE_FORBIDDEN', `Google Drive từ chối quyền: ${detail}`, 403);
  }
  const detail = extractGoogleErrorMessage(rawText, rawText.slice(0, 200) || actionLabel);
  throw new VideoPipelineError('DRIVE_API_ERROR', `${actionLabel}: ${detail}`, 502);
}

export async function findOrCreateDriveFolder(
  driveAccessToken: string,
  folderName: string = DEFAULT_DRIVE_FOLDER_NAME
): Promise<{ id: string; name: string }> {
  const safeName = folderName.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=5`,
    {
      headers: {
        Authorization: `Bearer ${driveAccessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const text = await searchRes.text().catch(() => '');
    handleDriveHttpStatus(searchRes.status, text, 'Không thể tìm thư mục trên Google Drive');
  }

  const searchJson: any = await searchRes.json();
  if (Array.isArray(searchJson?.files) && searchJson.files.length > 0) {
    return {
      id: String(searchJson.files[0].id),
      name: String(searchJson.files[0].name),
    };
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${driveAccessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Thư mục lưu trữ video bài giảng Địa lí 10 bền vững.',
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => '');
    handleDriveHttpStatus(createRes.status, text, 'Không thể tạo thư mục trên Google Drive');
  }

  const created: any = await createRes.json();
  return { id: String(created.id), name: String(created.name || folderName) };
}

async function grantAnyoneReaderPermission(driveAccessToken: string, fileId: string): Promise<void> {
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${driveAccessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  );

  if (!permRes.ok) {
    const text = await permRes.text().catch(() => '');
    handleDriveHttpStatus(
      permRes.status,
      text,
      'Đã tải lên tệp nhưng không thể bật quyền "Bất kỳ ai có đường liên kết"'
    );
  }
}

export async function uploadLessonMp4ToGoogleDrive(params: {
  lessonId: string;
  driveAccessToken: string;
  teacherName: string;
  autoApprove: boolean;
  folderName?: string;
}): Promise<{
  record: LessonVideoRecord;
  driveFileId: string;
  driveFileName: string;
  driveFolderId: string;
  driveFolderName: string;
  driveShareUrl: string;
}> {
  const { lessonId, driveAccessToken, teacherName, autoApprove } = params;
  if (!driveAccessToken || !driveAccessToken.trim()) {
    throw new VideoPipelineError(
      'DRIVE_AUTH_REQUIRED',
      'Chưa đăng nhập Google Drive. Vui lòng kết nối tài khoản Google trước.',
      401
    );
  }

  const rec = getTeacherLessonVideo(lessonId);
  const candidateUrl = rec.draftVideo?.videoUrl || rec.videoUrl;
  if (!candidateUrl || !candidateUrl.startsWith('/api/videos/media/')) {
    throw new VideoPipelineError(
      'NO_LOCAL_MP4_TO_UPLOAD',
      `Bài ${rec.lessonNumber} chưa có tệp video .mp4 trên máy chủ để đẩy lên Google Drive.`,
      400
    );
  }

  const filename = path.basename(candidateUrl);
  const absPath = path.join(VIDEOS_ROOT_DIR, lessonId, filename);
  if (!fs.existsSync(absPath)) {
    throw new VideoPipelineError(
      'LOCAL_MP4_MISSING',
      `Không tìm thấy tệp ${filename} của Bài ${rec.lessonNumber} trên máy chủ.`,
      404
    );
  }

  const folder = await findOrCreateDriveFolder(
    driveAccessToken,
    params.folderName || DEFAULT_DRIVE_FOLDER_NAME
  );

  const fileBuffer = fs.readFileSync(absPath);
  const driveFileName = `Bai-${String(rec.lessonNumber).padStart(2, '0')}-${lessonId}-DiaLi10.mp4`;

  // Resumable upload step 1: initiate upload session
  const initRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${driveAccessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(fileBuffer.byteLength),
      },
      body: JSON.stringify({
        name: driveFileName,
        parents: [folder.id],
        mimeType: 'video/mp4',
        description: `Video bài giảng Địa lí 10 - ${rec.lessonTitle}`,
      }),
    }
  );

  if (!initRes.ok) {
    const text = await initRes.text().catch(() => '');
    handleDriveHttpStatus(initRes.status, text, 'Không thể khởi tạo phiên tải lên Google Drive');
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new VideoPipelineError(
      'DRIVE_UPLOAD_URL_MISSING',
      'Google Drive không trả về địa chỉ phiên tải lên.',
      502
    );
  }

  // Resumable upload step 2: upload MP4 payload
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': String(fileBuffer.byteLength),
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    handleDriveHttpStatus(uploadRes.status, text, 'Lỗi khi tải dữ liệu MP4 lên Google Drive');
  }

  const uploadedFile: any = await uploadRes.json();
  const driveFileId = String(uploadedFile?.id || '');
  if (!driveFileId) {
    throw new VideoPipelineError('DRIVE_FILE_ID_MISSING', 'Không nhận được mã tệp từ Google Drive.', 502);
  }

  await grantAnyoneReaderPermission(driveAccessToken, driveFileId);

  const driveShareUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`;
  const updatedRecord = setLessonExternalVideoLink(
    lessonId,
    {
      rawUrl: driveShareUrl,
      durationSeconds: rec.draftVideo?.durationSeconds ?? rec.durationSeconds ?? null,
      note: `Google Drive tự động (${driveFileName})`,
      autoApprove,
    },
    teacherName
  );

  return {
    record: updatedRecord,
    driveFileId,
    driveFileName,
    driveFolderId: folder.id,
    driveFolderName: folder.name,
    driveShareUrl,
  };
}

export async function syncExternalBackupJsonToGoogleDrive(params: {
  driveAccessToken: string;
  folderName?: string;
}): Promise<{
  driveFileId: string;
  driveFolderId: string;
  driveFolderName: string;
  totalLinked: number;
  webViewLink: string;
}> {
  const { driveAccessToken } = params;
  if (!driveAccessToken || !driveAccessToken.trim()) {
    throw new VideoPipelineError(
      'DRIVE_AUTH_REQUIRED',
      'Chưa đăng nhập Google Drive. Vui lòng kết nối tài khoản Google trước.',
      401
    );
  }

  const folder = await findOrCreateDriveFolder(
    driveAccessToken,
    params.folderName || DEFAULT_DRIVE_FOLDER_NAME
  );

  const backup = exportExternalVideoLinksBackup();
  const jsonText = JSON.stringify(backup, null, 2);

  // Check if backup JSON already exists in this folder so we update instead of duplicating
  const safeFolderId = folder.id.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `name='${BACKUP_JSON_FILENAME}' and '${safeFolderId}' in parents and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=5`,
    {
      headers: { Authorization: `Bearer ${driveAccessToken}` },
    }
  );

  if (!searchRes.ok) {
    const text = await searchRes.text().catch(() => '');
    handleDriveHttpStatus(searchRes.status, text, 'Không thể kiểm tra tệp sao lưu trên Google Drive');
  }

  const searchJson: any = await searchRes.json();
  const existingId = searchJson?.files?.[0]?.id ? String(searchJson.files[0].id) : null;

  const uploadEndpoint = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingId)}?uploadType=resumable&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink';

  const metadataBody = existingId
    ? { name: BACKUP_JSON_FILENAME, mimeType: 'application/json' }
    : { name: BACKUP_JSON_FILENAME, parents: [folder.id], mimeType: 'application/json' };

  const initRes = await fetch(uploadEndpoint, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${driveAccessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': 'application/json',
      'X-Upload-Content-Length': String(Buffer.byteLength(jsonText, 'utf-8')),
    },
    body: JSON.stringify(metadataBody),
  });

  if (!initRes.ok) {
    const text = await initRes.text().catch(() => '');
    handleDriveHttpStatus(initRes.status, text, 'Không thể khởi tạo lưu tệp JSON lên Google Drive');
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new VideoPipelineError('DRIVE_UPLOAD_URL_MISSING', 'Thiếu URL tải lên tệp JSON.', 502);
  }

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': String(Buffer.byteLength(jsonText, 'utf-8')),
    },
    body: jsonText,
  });

  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '');
    handleDriveHttpStatus(putRes.status, text, 'Không thể ghi tệp sao lưu JSON lên Google Drive');
  }

  const uploaded: any = await putRes.json();
  const driveFileId = String(uploaded?.id || existingId || '');

  return {
    driveFileId,
    driveFolderId: folder.id,
    driveFolderName: folder.name,
    totalLinked: backup.totalLinked,
    webViewLink: String(
      uploaded?.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`
    ),
  };
}

function createTarHeader(fileName: string, fileSize: number, mtimeSec: number): Buffer {
  const header = Buffer.alloc(512, 0);
  const nameBytes = Buffer.from(fileName, 'utf8');
  nameBytes.copy(header, 0, 0, Math.min(nameBytes.length, 100));

  const writeOctal = (val: number, offset: number, length: number) => {
    const str = val.toString(8).padStart(length - 1, '0') + '\0';
    Buffer.from(str, 'ascii').copy(header, offset, 0, length);
  };

  writeOctal(0o644, 100, 8);
  writeOctal(0, 108, 8);
  writeOctal(0, 116, 8);
  writeOctal(fileSize, 124, 12);
  writeOctal(Math.floor(mtimeSec), 136, 12);
  Buffer.from('        ', 'ascii').copy(header, 148, 0, 8); // checksum placeholder
  header[156] = '0'.charCodeAt(0); // regular file
  Buffer.from('ustar\0', 'ascii').copy(header, 257, 0, 6);
  Buffer.from('00', 'ascii').copy(header, 263, 0, 2);

  let sum = 0;
  for (let i = 0; i < 512; i++) sum += header[i];
  const chk = sum.toString(8).padStart(6, '0') + '\0 ';
  Buffer.from(chk, 'ascii').copy(header, 148, 0, 8);
  return header;
}

export async function streamAllLocalVideosTar(res: import('express').Response): Promise<void> {
  if (!fs.existsSync(VIDEOS_ROOT_DIR)) {
    res.status(404).json({ error: 'Chưa có thư mục video trên máy chủ.' });
    return;
  }

  const entries: Array<{ archiveName: string; absPath: string; size: number; mtimeSec: number }> = [];
  for (let n = 1; n <= 40; n++) {
    const lessonId = `bai-${n}`;
    const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
    if (!fs.existsSync(lessonDir)) continue;
    let bestMp4: string | null = null;
    let bestVer = -1;
    for (const f of fs.readdirSync(lessonDir)) {
      const m = f.match(/^lecture-v(\d+)\.mp4$/);
      if (m && Number(m[1]) > bestVer) {
        bestVer = Number(m[1]);
        bestMp4 = f;
      }
    }
    if (!bestMp4) continue;
    const absPath = path.join(lessonDir, bestMp4);
    const stat = fs.statSync(absPath);
    if (stat.size <= 0) continue;
    entries.push({
      archiveName: `Bai-${String(n).padStart(2, '0')}-${lessonId}-DiaLi10.mp4`,
      absPath,
      size: stat.size,
      mtimeSec: stat.mtimeMs / 1000,
    });
  }

  if (entries.length === 0) {
    res.status(404).json({ error: 'Hiện chưa có tệp video .mp4 nào trên máy chủ để tải xuống.' });
    return;
  }

  res.setHeader('Content-Type', 'application/x-tar');
  res.setHeader('Content-Disposition', `attachment; filename="DiaLi10-${entries.length}-Videos.tar"`);

  for (const item of entries) {
    if (res.destroyed || res.writableEnded) return;
    res.write(createTarHeader(item.archiveName, item.size, item.mtimeSec));
    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(item.absPath);
      const onClose = () => {
        stream.destroy();
        resolve();
      };
      res.once('close', onClose);
      stream.on('data', (chunk) => {
        if (res.destroyed || res.writableEnded) {
          stream.destroy();
          return;
        }
        if (!res.write(chunk)) {
          stream.pause();
          res.once('drain', () => stream.resume());
        }
      });
      stream.on('end', () => {
        res.removeListener('close', onClose);
        resolve();
      });
      stream.on('error', (err) => {
        res.removeListener('close', onClose);
        reject(err);
      });
    });
    if (res.destroyed || res.writableEnded) return;
    const remainder = item.size % 512;
    if (remainder > 0) {
      res.write(Buffer.alloc(512 - remainder, 0));
    }
  }

  if (res.destroyed || res.writableEnded) return;
  // Two 512-byte EOF zero blocks
  res.write(Buffer.alloc(1024, 0));
  res.end();
}

