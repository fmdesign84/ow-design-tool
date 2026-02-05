import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Modals/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};
export default meta;

// 기본 (프로젝트 등록)
export const Default = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        확인 다이얼로그 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="프로젝트를 등록 하시겠습니까?"
        onConfirm={() => {
          alert('등록 완료!');
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 삭제 확인 (휴지통 아이콘)
export const DeleteConfirm = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#F44336',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        삭제 확인 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="임시저장한 문서를 삭제하시겠습니까?"
        confirmedMessage="삭제 완료!"
        confirmText="예"
        cancelText="아니요"
        variant="delete"
        onConfirm={() => {
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 위험 경고 (경고 아이콘)
export const DangerConfirm = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#F44336',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        위험 확인 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="정말 진행하시겠습니까?"
        confirmedMessage="확인됨!"
        confirmText="확인"
        cancelText="취소"
        variant="danger"
        onConfirm={() => {
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 저장 확인
export const SaveConfirm = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        저장 확인 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="변경사항을 저장하시겠습니까?"
        confirmText="저장"
        cancelText="취소"
        onConfirm={() => {
          alert('저장 완료!');
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 상신 확인
export const SubmitConfirm = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        상신 확인 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="문서를 상신하시겠습니까?"
        confirmText="상신"
        cancelText="취소"
        onConfirm={() => {
          alert('상신 완료!');
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 취소 확인
export const CancelConfirm = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#757575',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        취소 확인 열기
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        message="작성을 취소하시겠습니까?\n입력한 내용은 저장되지 않습니다."
        confirmText="확인"
        cancelText="계속 작성"
        onConfirm={() => {
          alert('취소됨');
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

// 사용법
export const UsageGuide = () => (
  <div style={{ padding: '24px', maxWidth: '600px' }}>
    <h3 style={{ marginBottom: '16px' }}>ConfirmDialog 사용법</h3>

    <pre style={{ background: '#F5F6F8', padding: '16px', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
{`import ConfirmDialog from '../components/modals/ConfirmDialog';

const MyComponent = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    // 실제 등록/삭제 로직
    console.log('확인됨');
    setIsConfirmOpen(false);
  };

  return (
    <>
      <button onClick={handleSubmit}>프로젝트 등록</button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        message="프로젝트를 등록 하시겠습니까?"
        confirmText="네"
        cancelText="아니요"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};`}
    </pre>

    <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Props</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ background: '#F5F6F8' }}>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Prop</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Type</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Default</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>설명</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>isOpen</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>boolean</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>-</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>다이얼로그 열림 상태</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>message</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'진행하시겠습니까?'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>확인 메시지</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>onConfirm</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>function</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>-</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>확인 버튼 핸들러</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>onCancel</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>function</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>-</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>취소 버튼 핸들러</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>confirmText</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'네'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>확인 버튼 텍스트</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>cancelText</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'아니요'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>취소 버튼 텍스트</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>variant</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'default'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'default' | 'danger' | 'delete'</td></tr>
      </tbody>
    </table>

    <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Variant</h4>
    <ul style={{ fontSize: '13px', lineHeight: '1.8' }}>
      <li><strong>default</strong> - 주황색 확인 버튼 + 체크 아이콘 (등록, 저장, 상신 등)</li>
      <li><strong>danger</strong> - 빨간색 확인 버튼 + 경고 아이콘 (위험 경고)</li>
      <li><strong>delete</strong> - 빨간색 확인 버튼 + 휴지통 아이콘 (삭제)</li>
    </ul>

    <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>기능</h4>
    <ul style={{ fontSize: '13px', lineHeight: '1.8' }}>
      <li>ESC 키로 닫기</li>
      <li>Overlay 클릭으로 닫기</li>
      <li>열릴 때 body 스크롤 방지</li>
    </ul>
  </div>
);
