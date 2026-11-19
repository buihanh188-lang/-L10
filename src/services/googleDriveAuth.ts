import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'] as const;

let cachedAuth: ReturnType<typeof getAuth> | null = null;
function getSafeFirebaseAuth(): ReturnType<typeof getAuth> | null {
  if (cachedAuth) return cachedAuth;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (err) {
    console.warn('[DriveAuth] Firebase Auth init skipped:', err);
    return null;
  }
}

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

export interface DriveConnectedAccount {
  email: string | null;
  displayName: string | null;
  method: 'firebase' | 'gis';
}

// Strict in-memory cache ONLY (never localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedAccount: DriveConnectedAccount | null = null;

export function isEmbeddedPreview(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke?: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export const initDriveAuth = (
  onAuthSuccess?: (account: DriveConnectedAccount, token: string) => void,
  onAuthFailure?: () => void
) => {
  const auth = getSafeFirebaseAuth();
  if (!auth) {
    return () => {};
  }
  // Handle token returned from full-page signInWithRedirect in top-level browser tabs
  getRedirectResult(auth)
    .then((result) => {
      if (!result) return;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        cachedAccount = {
          email: result.user.email,
          displayName: result.user.displayName,
          method: 'firebase',
        };
        if (onAuthSuccess) onAuthSuccess(cachedAccount, cachedAccessToken);
      }
    })
    .catch((err) => {
      console.warn('[DriveAuth] Redirect result error:', err?.code || err?.message);
    });

  return onAuthStateChanged(auth, (user: User | null) => {
    if (cachedAccount?.method === 'gis' && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(cachedAccount, cachedAccessToken);
      return;
    }
    if (user) {
      cachedAccount = {
        email: user.email,
        displayName: user.displayName,
        method: 'firebase',
      };
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(cachedAccount, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedAccount = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export function mapDriveAuthErrorMessage(
  error: any,
  method: 'firebase' | 'gis' = 'firebase'
): { message: string; isPopupIssue: boolean } {
  const code = String(error?.code || error?.type || '');
  const rawMsg = String(error?.message || '');
  const inIframe = isEmbeddedPreview();

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'popup_closed' ||
    rawMsg.includes('popup-closed-by-user')
  ) {
    if (inIframe) {
      return {
        isPopupIssue: true,
        message:
          'Khung xem trước AI Studio đang chặn cửa sổ bật lên trả quyền Google về trang. Cô hãy bấm nút "Mở tab riêng để kết nối Drive" (hoặc tải thẳng "Tải gói 40 MP4 (.tar)").',
      };
    }
    return {
      isPopupIssue: true,
      message:
        method === 'gis'
          ? 'Cửa sổ Google đã đóng trước khi nhận quyền. Cô hãy bấm nút "Đăng nhập không dùng Pop-up" (chuyển trang toàn màn hình) ngay bên cạnh để kết nối chắc chắn 100%.'
          : 'Cửa sổ đăng nhập bị trình duyệt đóng sớm. Cô hãy thử "Đăng nhập Drive (Trực tiếp)" hoặc "Đăng nhập không dùng Pop-up" ngay bên cạnh.',
    };
  }
  if (code === 'auth/popup-blocked' || code === 'popup_failed_to_open') {
    return {
      isPopupIssue: true,
      message: inIframe
        ? 'Trình duyệt đang chặn cửa sổ bật lên trong khung xem trước. Cô hãy bấm "Mở tab riêng để kết nối Drive" ở ngay thanh bên cạnh.'
        : 'Trình duyệt đang chặn Pop-up. Cô bấm "Đăng nhập không dùng Pop-up" ngay bên cạnh để đăng nhập trực tiếp không cần cửa sổ bật lên.',
    };
  }
  if (code === 'auth/cancelled-popup-request') {
    return {
      isPopupIssue: true,
      message: 'Yêu cầu đăng nhập trước đó đã bị hủy do mở cửa sổ mới. Vui lòng thử lại 1 lần.',
    };
  }
  return {
    isPopupIssue: false,
    message: rawMsg || 'Không thể kết nối Google Drive. Vui lòng thử lại.',
  };
}

export const googleDriveSignIn = async (): Promise<{
  account: DriveConnectedAccount;
  accessToken: string;
}> => {
  const auth = getSafeFirebaseAuth();
  if (!auth) {
    throw new Error('Không thể khởi tạo phiên đăng nhập Google. Vui lòng dùng nút "Đăng nhập Drive (Trực tiếp)".');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được quyền truy cập Google Drive từ cửa sổ đăng nhập.');
    }
    cachedAccessToken = credential.accessToken;
    cachedAccount = {
      email: result.user.email,
      displayName: result.user.displayName,
      method: 'firebase',
    };
    return { account: cachedAccount, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const googleDriveSignInRedirect = async (): Promise<void> => {
  if (isEmbeddedPreview()) {
    throw new Error(
      'Khung xem trước không hỗ trợ chuyển trang đăng nhập Google. Vui lòng bấm "Mở tab riêng để kết nối Drive" trước.'
    );
  }
  const auth = getSafeFirebaseAuth();
  if (!auth) {
    throw new Error('Không thể khởi tạo phiên đăng nhập Google. Vui lòng tải lại trang.');
  }
  await signInWithRedirect(auth, provider);
};

export const googleDriveSignInDirect = (): Promise<{
  account: DriveConnectedAccount;
  accessToken: string;
}> => {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    const clientId = (firebaseConfig as any).oAuthClientId;
    if (!oauth2 || !clientId) {
      reject(
        new Error(
          'Trình kết nối Google trực tiếp đang tải hoặc chưa sẵn sàng. Vui lòng tải lại trang và thử lại.'
        )
      );
      return;
    }

    isSigningIn = true;
    try {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(' '),
        prompt: 'consent',
        callback: (resp) => {
          isSigningIn = false;
          if (resp?.error || !resp?.access_token) {
            reject(new Error(resp?.error_description || resp?.error || 'Google từ chối cấp quyền Drive.'));
            return;
          }
          cachedAccessToken = resp.access_token;
          cachedAccount = {
            email: 'Google Drive đã kết nối',
            displayName: 'Tài khoản Google của cô',
            method: 'gis',
          };
          resolve({ account: cachedAccount, accessToken: cachedAccessToken });
        },
        error_callback: (err) => {
          isSigningIn = false;
          const mapped = mapDriveAuthErrorMessage(err, 'gis');
          reject(new Error(mapped.message));
        },
      });
      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      isSigningIn = false;
      reject(err);
    }
  });
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCurrentDriveAccount = (): DriveConnectedAccount | null => {
  return cachedAccount;
};

export const clearCachedDriveToken = () => {
  cachedAccessToken = null;
};

export const googleDriveSignOut = async () => {
  const tokenToRevoke = cachedAccessToken;
  cachedAccessToken = null;
  cachedAccount = null;
  try {
    if (tokenToRevoke && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(tokenToRevoke);
    }
  } catch {
    // ignore
  }
  const auth = getSafeFirebaseAuth();
  if (auth) {
    await auth.signOut().catch(() => {});
  }
};
