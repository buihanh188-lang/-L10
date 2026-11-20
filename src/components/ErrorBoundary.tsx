import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Đã xảy ra lỗi không mong muốn.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendlyMsg = 'Hệ thống gặp sự cố kết nối tạm thời. Cô/em vui lòng tải lại trang để tiếp tục.';
      if (this.state.message.includes('Quota exceeded')) {
        friendlyMsg =
          'Hạn mức đọc/ghi miễn phí trong ngày của cơ sở dữ liệu đám mây đã tạm đạt giới hạn và sẽ tự động đặt lại vào ngày mai.';
      } else if (this.state.message.includes('permission') || this.state.message.includes('PERMISSION_DENIED')) {
        friendlyMsg =
          'Phiên đăng nhập Google chưa đủ quyền truy cập dữ liệu này. Vui lòng đăng nhập lại bằng tài khoản Google hợp lệ.';
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-rose-200 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Thông báo hệ thống</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{friendlyMsg}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
