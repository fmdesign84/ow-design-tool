import { Routes, Route, Navigate } from 'react-router-dom';
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
          <Routes>
          {/* AI Studio Routes - 모두 ImageGenPage로 통일 */}
          <Route path="/" element={<ImageGenPage />} />
          <Route path="/image" element={<ImageGenPage />} />
          <Route path="/tools" element={<ImageGenPage />} />
          <Route path="/video" element={<ImageGenPage />} />
          <Route path="/design" element={<ImageGenPage />} />
          <Route path="/wave" element={<ImageGenPage />} />

          {/* 문서 스타일 통합기 */}
          <Route path="/document-merger" element={<DocumentMergerPage />} />

          {/* Redirect old paths */}
          <Route path="/gen-ai" element={<Navigate to="/" replace />} />
          <Route path="/gen-ai/*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
