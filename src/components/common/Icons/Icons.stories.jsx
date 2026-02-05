import * as Icons from './index';

const meta = {
  title: 'Common/Icons',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

// 아이콘 그리드 스타일
const IconGrid = ({ children }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '24px',
    padding: '20px',
  }}>
    {children}
  </div>
);

const IconItem = ({ name, children }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    border: '1px solid #E8E8E8',
    borderRadius: '8px',
    minWidth: '100px',
  }}>
    <div style={{ color: '#212121' }}>{children}</div>
    <span style={{ fontSize: '11px', color: '#757575', textAlign: 'center' }}>{name}</span>
  </div>
);

// 전체 아이콘 카탈로그
export const AllIcons = () => (
  <IconGrid>
    <IconItem name="SearchIcon"><Icons.SearchIcon size={24} /></IconItem>
    <IconItem name="CalendarIcon"><Icons.CalendarIcon size={24} /></IconItem>
    <IconItem name="CloseIcon"><Icons.CloseIcon size={24} /></IconItem>
    <IconItem name="PlusIcon"><Icons.PlusIcon size={24} /></IconItem>
    <IconItem name="LockIcon"><Icons.LockIcon size={24} /></IconItem>
    <IconItem name="InfoIcon"><Icons.InfoIcon size={24} /></IconItem>
    <IconItem name="AvatarIcon"><Icons.AvatarIcon size={24} /></IconItem>
    <IconItem name="ChevronLeftIcon"><Icons.ChevronLeftIcon size={24} /></IconItem>
    <IconItem name="ChevronRightIcon"><Icons.ChevronRightIcon size={24} /></IconItem>
    <IconItem name="ChevronDownIcon"><Icons.ChevronDownIcon size={24} /></IconItem>
    <IconItem name="EditIcon"><Icons.EditIcon size={24} /></IconItem>
    <IconItem name="TrashIcon"><Icons.TrashIcon size={24} /></IconItem>
    <IconItem name="CheckIcon"><Icons.CheckIcon size={24} /></IconItem>
    <IconItem name="EyeIcon (active)"><Icons.EyeIcon active={true} size={24} /></IconItem>
    <IconItem name="EyeIcon (inactive)"><Icons.EyeIcon active={false} size={24} /></IconItem>
    <IconItem name="SaveIcon"><Icons.SaveIcon size={24} /></IconItem>
    <IconItem name="UploadIcon"><Icons.UploadIcon size={24} /></IconItem>
    <IconItem name="DownloadIcon"><Icons.DownloadIcon size={24} /></IconItem>
    <IconItem name="SettingsIcon"><Icons.SettingsIcon size={24} /></IconItem>
    <IconItem name="DocumentIcon"><Icons.DocumentIcon size={24} /></IconItem>
    <IconItem name="ImageFileIcon"><Icons.ImageFileIcon size={24} /></IconItem>
    <IconItem name="PdfFileIcon"><Icons.PdfFileIcon size={24} /></IconItem>
    <IconItem name="FileIcon"><Icons.FileIcon size={24} /></IconItem>
    <IconItem name="ExcelFileIcon"><Icons.ExcelFileIcon size={24} /></IconItem>
    <IconItem name="WhaleIcon"><Icons.WhaleIcon size={24} /></IconItem>
    <IconItem name="StarIcon"><Icons.StarIcon size={24} /></IconItem>
    <IconItem name="StarIcon (filled)"><Icons.StarIcon size={24} filled /></IconItem>
  </IconGrid>
);

// 카테고리별 아이콘
export const BasicUI = () => (
  <IconGrid>
    <IconItem name="SearchIcon"><Icons.SearchIcon size={24} /></IconItem>
    <IconItem name="CalendarIcon"><Icons.CalendarIcon size={24} /></IconItem>
    <IconItem name="CloseIcon"><Icons.CloseIcon size={24} /></IconItem>
    <IconItem name="PlusIcon"><Icons.PlusIcon size={24} /></IconItem>
    <IconItem name="LockIcon"><Icons.LockIcon size={24} /></IconItem>
    <IconItem name="InfoIcon"><Icons.InfoIcon size={24} /></IconItem>
    <IconItem name="AvatarIcon"><Icons.AvatarIcon size={24} /></IconItem>
  </IconGrid>
);

export const Navigation = () => (
  <IconGrid>
    <IconItem name="ChevronLeftIcon"><Icons.ChevronLeftIcon size={24} /></IconItem>
    <IconItem name="ChevronRightIcon"><Icons.ChevronRightIcon size={24} /></IconItem>
    <IconItem name="ChevronDownIcon"><Icons.ChevronDownIcon size={24} /></IconItem>
  </IconGrid>
);

export const Actions = () => (
  <IconGrid>
    <IconItem name="EditIcon"><Icons.EditIcon size={24} /></IconItem>
    <IconItem name="TrashIcon"><Icons.TrashIcon size={24} /></IconItem>
    <IconItem name="CheckIcon"><Icons.CheckIcon size={24} /></IconItem>
    <IconItem name="EyeIcon (active)"><Icons.EyeIcon active={true} size={24} /></IconItem>
    <IconItem name="EyeIcon (inactive)"><Icons.EyeIcon active={false} size={24} /></IconItem>
    <IconItem name="SaveIcon"><Icons.SaveIcon size={24} /></IconItem>
    <IconItem name="UploadIcon"><Icons.UploadIcon size={24} /></IconItem>
    <IconItem name="DownloadIcon"><Icons.DownloadIcon size={24} /></IconItem>
    <IconItem name="SettingsIcon"><Icons.SettingsIcon size={24} /></IconItem>
    <IconItem name="DocumentIcon"><Icons.DocumentIcon size={24} /></IconItem>
    <IconItem name="StarIcon"><Icons.StarIcon size={24} /></IconItem>
    <IconItem name="StarIcon (filled)"><Icons.StarIcon size={24} filled /></IconItem>
  </IconGrid>
);

export const FileTypes = () => (
  <IconGrid>
    <IconItem name="FileIcon"><Icons.FileIcon size={24} /></IconItem>
    <IconItem name="ImageFileIcon"><Icons.ImageFileIcon size={24} /></IconItem>
    <IconItem name="PdfFileIcon"><Icons.PdfFileIcon size={24} /></IconItem>
    <IconItem name="ExcelFileIcon"><Icons.ExcelFileIcon size={24} /></IconItem>
  </IconGrid>
);

// FM AI Studio 아이콘
export const FMAIStudio = () => (
  <div style={{ padding: '20px' }}>
    <h3 style={{ marginBottom: '16px', color: '#212121' }}>WhaleIcon (단색 stroke - 기존 톤앤매너)</h3>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
      <IconItem name="18px"><Icons.WhaleIcon size={18} /></IconItem>
      <IconItem name="24px"><Icons.WhaleIcon size={24} /></IconItem>
      <IconItem name="32px"><Icons.WhaleIcon size={32} /></IconItem>
      <IconItem name="48px"><Icons.WhaleIcon size={48} /></IconItem>
      <IconItem name="64px"><Icons.WhaleIcon size={64} /></IconItem>
    </div>

    <h3 style={{ marginBottom: '16px', color: '#212121' }}>OrangeWhaleIcon (컬러 fill - FM AI Studio)</h3>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
      <IconItem name="18px"><Icons.OrangeWhaleIcon size={18} /></IconItem>
      <IconItem name="24px"><Icons.OrangeWhaleIcon size={24} /></IconItem>
      <IconItem name="32px"><Icons.OrangeWhaleIcon size={32} /></IconItem>
      <IconItem name="48px"><Icons.OrangeWhaleIcon size={48} /></IconItem>
      <IconItem name="64px"><Icons.OrangeWhaleIcon size={64} /></IconItem>
    </div>

    <h3 style={{ marginBottom: '16px', color: '#212121' }}>OrangeWhaleOutlinedIcon (테두리 버전 - GNB 사이드바용)</h3>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
      <IconItem name="18px"><Icons.OrangeWhaleOutlinedIcon size={18} /></IconItem>
      <IconItem name="24px"><Icons.OrangeWhaleOutlinedIcon size={24} /></IconItem>
      <IconItem name="32px"><Icons.OrangeWhaleOutlinedIcon size={32} /></IconItem>
      <IconItem name="48px"><Icons.OrangeWhaleOutlinedIcon size={48} /></IconItem>
      <IconItem name="64px"><Icons.OrangeWhaleOutlinedIcon size={64} /></IconItem>
    </div>

    <h3 style={{ marginBottom: '16px', color: '#212121' }}>AI Studio 탭 아이콘</h3>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <IconItem name="ImageGenIcon"><Icons.ImageGenIcon size={24} /></IconItem>
      <IconItem name="VideoGenIcon"><Icons.VideoGenIcon size={24} /></IconItem>
      <IconItem name="DesignGenIcon"><Icons.DesignGenIcon size={24} /></IconItem>
    </div>
  </div>
);

// 사이즈 비교
export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px' }}>
    <IconItem name="12px"><Icons.SearchIcon size={12} /></IconItem>
    <IconItem name="14px"><Icons.SearchIcon size={14} /></IconItem>
    <IconItem name="16px (기본)"><Icons.SearchIcon size={16} /></IconItem>
    <IconItem name="20px"><Icons.SearchIcon size={20} /></IconItem>
    <IconItem name="24px"><Icons.SearchIcon size={24} /></IconItem>
    <IconItem name="32px"><Icons.SearchIcon size={32} /></IconItem>
  </div>
);

// 사용법 가이드
export const Usage = () => (
  <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.8' }}>
    <h3 style={{ marginBottom: '16px' }}>Import</h3>
    <pre style={{ background: '#F5F6F8', padding: '12px', borderRadius: '6px' }}>
{`import { SearchIcon, CalendarIcon, CloseIcon } from '../components/common/Icons';`}
    </pre>

    <h3 style={{ margin: '24px 0 16px' }}>기본 사용</h3>
    <pre style={{ background: '#F5F6F8', padding: '12px', borderRadius: '6px' }}>
{`<SearchIcon />           // 기본 사이즈
<SearchIcon size={20} /> // 커스텀 사이즈
<SearchIcon className="my-icon" /> // CSS 클래스`}
    </pre>

    <h3 style={{ margin: '24px 0 16px' }}>EyeIcon 토글</h3>
    <pre style={{ background: '#F5F6F8', padding: '12px', borderRadius: '6px' }}>
{`<EyeIcon active={true} />  // 눈 열림
<EyeIcon active={false} /> // 눈 감김`}
    </pre>

    <h3 style={{ margin: '24px 0 16px' }}>파일 아이콘 자동 선택</h3>
    <pre style={{ background: '#F5F6F8', padding: '12px', borderRadius: '6px' }}>
{`import { getFileIcon } from '../components/common/Icons';

{getFileIcon('document.pdf')}  // PdfFileIcon 반환
{getFileIcon('image.png')}     // ImageFileIcon 반환
{getFileIcon('data.xlsx')}     // ExcelFileIcon 반환`}
    </pre>
  </div>
);
