import { AppRoutes, AppRoute, AppNavigate } from './app/routerAdapter';
import { ImageGenPage, DocumentMergerPage } from './pages';
import ErrorOverlay from './components/ErrorOverlay';
import { ToastProvider } from './components/common';
import './styles/index.css';
import './styles/responsive-mobile.css';

// OW-Design Tool - Wave 노드 에디터 중심 AI 디자인 툴
function App() {
  return (
    <ToastProvider>
      <div className="main-container no-sidebar">
        {/* 개발용 에러 오버레이 - 화면 우측 하단에 에러 표시 */}
        <ErrorOverlay />
        <main className="content-area">
          <AppRoutes>
          {/* AI Studio Routes - 모두 ImageGenPage로 통일 */}
          <AppRoute path="/" element={<ImageGenPage />} />
          <AppRoute path="/image" element={<ImageGenPage />} />
          <AppRoute path="/tools" element={<ImageGenPage />} />
          <AppRoute path="/video" element={<ImageGenPage />} />
          <AppRoute path="/design" element={<ImageGenPage />} />
          <AppRoute path="/wave" element={<ImageGenPage />} />

          {/* 문서 스타일 통합기 */}
          <AppRoute path="/document-merger" element={<DocumentMergerPage />} />

          {/* Redirect old paths */}
          <AppRoute path="/gen-ai" element={<AppNavigate to="/" replace />} />
          <AppRoute path="/gen-ai/*" element={<AppNavigate to="/" replace />} />
          </AppRoutes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
