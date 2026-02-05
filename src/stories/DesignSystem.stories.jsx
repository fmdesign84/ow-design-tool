import '../styles/design-tokens.css';

const meta = {
  title: 'Design System',
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

// 컬러 스와치 컴포넌트
const ColorSwatch = ({ name, color, cssVar }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
    <div style={{
      width: '48px',
      height: '48px',
      backgroundColor: color,
      borderRadius: '8px',
      border: '1px solid #E8E8E8',
    }} />
    <div>
      <div style={{ fontSize: '13px', fontWeight: '500', color: '#212121' }}>{name}</div>
      <div style={{ fontSize: '11px', color: '#757575', fontFamily: 'monospace' }}>{color}</div>
      <div style={{ fontSize: '11px', color: '#9E9E9E', fontFamily: 'monospace' }}>{cssVar}</div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '16px', borderBottom: '1px solid #E8E8E8', paddingBottom: '8px' }}>
      {title}
    </h3>
    {children}
  </div>
);

// 컬러 팔레트
export const Colors = () => (
  <div style={{ padding: '24px', maxWidth: '900px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Color Palette</h2>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
      <Section title="Primary">
        <ColorSwatch name="Primary" color="#FF6B35" cssVar="--color-primary" />
        <ColorSwatch name="Primary Light" color="#FFF5F0" cssVar="--color-primary-light" />
        <ColorSwatch name="Primary Hover" color="#E55A2B" cssVar="--color-primary-hover" />
      </Section>

      <Section title="Status - Success">
        <ColorSwatch name="Success" color="#22C55E" cssVar="--color-success" />
        <ColorSwatch name="Success Light" color="#DCFCE7" cssVar="--color-success-light" />
      </Section>

      <Section title="Status - Warning">
        <ColorSwatch name="Warning" color="#F5A623" cssVar="--color-warning" />
        <ColorSwatch name="Warning Light" color="#FFF8E6" cssVar="--color-warning-light" />
      </Section>

      <Section title="Status - Error">
        <ColorSwatch name="Error" color="#F44336" cssVar="--color-error" />
        <ColorSwatch name="Error Light" color="#FFEBEE" cssVar="--color-error-light" />
      </Section>

      <Section title="Status - Info">
        <ColorSwatch name="Info" color="#3B82F6" cssVar="--color-info" />
        <ColorSwatch name="Info Light" color="#DBEAFE" cssVar="--color-info-light" />
      </Section>

      <Section title="Status - Gray">
        <ColorSwatch name="Gray" color="#607D8B" cssVar="--color-gray" />
        <ColorSwatch name="Gray Light" color="#ECEFF1" cssVar="--color-gray-light" />
      </Section>
    </div>

    <Section title="Neutral Scale">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <ColorSwatch name="Neutral 50" color="#F5F6F8" cssVar="--color-neutral-100" />
        <ColorSwatch name="Neutral 100" color="#F3F4F6" cssVar="--color-neutral-200" />
        <ColorSwatch name="Neutral 200" color="#E8E8E8" cssVar="--color-neutral-300" />
        <ColorSwatch name="Neutral 300" color="#D9D9D9" cssVar="--color-neutral-400" />
        <ColorSwatch name="Neutral 400" color="#9E9E9E" cssVar="--color-neutral-500" />
        <ColorSwatch name="Neutral 500" color="#757575" cssVar="--color-neutral-500" />
        <ColorSwatch name="Neutral 600" color="#616161" cssVar="--color-neutral-600" />
        <ColorSwatch name="Neutral 700" color="#5F5F5F" cssVar="--color-neutral-700" />
        <ColorSwatch name="Neutral 800" color="#3C3C3C" cssVar="--color-neutral-800" />
        <ColorSwatch name="Neutral 900" color="#1A1A1A" cssVar="--color-neutral-900" />
      </div>
    </Section>

    <Section title="Base">
      <div style={{ display: 'flex', gap: '16px' }}>
        <ColorSwatch name="White" color="#FFFFFF" cssVar="--color-white" />
        <ColorSwatch name="Black" color="#1A1A1A" cssVar="--color-black" />
      </div>
    </Section>
  </div>
);

// 타이포그래피
export const Typography = () => (
  <div style={{ padding: '24px', maxWidth: '800px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Typography</h2>

    <Section title="Font Sizes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '11px' }}>11px (xs)</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-xs</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '12px' }}>12px (sm)</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-sm</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>14px (md) - 기본</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-md</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '16px' }}>16px (lg)</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-lg</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '18px' }}>18px (xl)</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-xl</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '20px' }}>20px (2xl)</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-size-2xl</code>
        </div>
      </div>
    </Section>

    <Section title="Font Weights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 400, width: '200px' }}>Regular (400) - 본문</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-weight-regular</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 500, width: '200px' }}>Medium (500) - 라벨</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-weight-medium</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 600, width: '200px' }}>Semibold (600) - 강조</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-weight-semibold</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 700, width: '200px' }}>Bold (700) - 제목</span>
          <code style={{ fontSize: '11px', color: '#757575' }}>--font-weight-bold</code>
        </div>
      </div>
    </Section>

    <Section title="Line Height">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '100px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>tight (1.2)</div>
            <code style={{ fontSize: '11px', color: '#757575' }}>--line-height-tight</code>
          </div>
          <p style={{ lineHeight: 1.2, fontSize: '14px', margin: 0, padding: '8px', background: '#F5F6F8', borderRadius: '4px', flex: 1 }}>
            라인 높이 1.2 - 제목이나 짧은 텍스트에 적합합니다. 글자 간격이 좁아 컴팩트한 느낌을 줍니다.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '100px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>normal (1.5)</div>
            <code style={{ fontSize: '11px', color: '#757575' }}>--line-height-normal</code>
          </div>
          <p style={{ lineHeight: 1.5, fontSize: '14px', margin: 0, padding: '8px', background: '#F5F6F8', borderRadius: '4px', flex: 1 }}>
            라인 높이 1.5 - 본문 텍스트의 기본값입니다. 가독성과 공간 효율의 균형을 맞춘 설정입니다.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '100px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>relaxed (1.7)</div>
            <code style={{ fontSize: '11px', color: '#757575' }}>--line-height-relaxed</code>
          </div>
          <p style={{ lineHeight: 1.7, fontSize: '14px', margin: 0, padding: '8px', background: '#F5F6F8', borderRadius: '4px', flex: 1 }}>
            라인 높이 1.7 - 긴 본문 텍스트에 적합합니다. 여유로운 간격으로 편안한 읽기 경험을 제공합니다.
          </p>
        </div>
      </div>
    </Section>
  </div>
);

// 간격 시스템
export const Spacing = () => (
  <div style={{ padding: '24px', maxWidth: '600px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Spacing</h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[
        { name: 'xs', size: '4px', var: '--spacing-xs' },
        { name: 'sm', size: '8px', var: '--spacing-sm' },
        { name: 'md', size: '12px', var: '--spacing-md' },
        { name: 'lg', size: '16px', var: '--spacing-lg' },
        { name: 'xl', size: '20px', var: '--spacing-xl' },
        { name: '2xl', size: '24px', var: '--spacing-2xl' },
        { name: '3xl', size: '32px', var: '--spacing-3xl' },
        { name: '4xl', size: '40px', var: '--spacing-4xl' },
      ].map(({ name, size, var: cssVar }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: size,
            height: '24px',
            backgroundColor: '#FF6B35',
            borderRadius: '2px',
          }} />
          <span style={{ fontSize: '13px', width: '40px' }}>{name}</span>
          <span style={{ fontSize: '13px', color: '#757575', width: '40px' }}>{size}</span>
          <code style={{ fontSize: '11px', color: '#9E9E9E' }}>{cssVar}</code>
        </div>
      ))}
    </div>
  </div>
);

// Border Radius
export const BorderRadius = () => (
  <div style={{ padding: '24px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Border Radius</h2>

    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      {[
        { name: 'xs', size: '2px', var: '--radius-xs' },
        { name: 'sm', size: '4px', var: '--radius-sm' },
        { name: 'md', size: '8px', var: '--radius-md' },
        { name: 'lg', size: '12px', var: '--radius-lg' },
        { name: 'xl', size: '16px', var: '--radius-xl' },
        { name: 'full', size: '9999px', var: '--radius-full' },
      ].map(({ name, size, var: cssVar }) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FF6B35',
            borderRadius: size,
            marginBottom: '8px',
          }} />
          <div style={{ fontSize: '12px', fontWeight: '500' }}>{name}</div>
          <div style={{ fontSize: '11px', color: '#757575' }}>{size}</div>
        </div>
      ))}
    </div>
  </div>
);

// Shadows
export const Shadows = () => (
  <div style={{ padding: '24px', backgroundColor: '#F5F6F8' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Shadows</h2>
    <p style={{ fontSize: '12px', color: '#757575', marginBottom: '24px' }}>
      실제 시스템에서 사용하는 그림자 - 미니멀한 하단 라인 shadow
    </p>

    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      {[
        { name: 'sm', shadow: '0 1px 0 rgba(0, 0, 0, 0.05)', var: '--shadow-sm', desc: '미세한 구분선' },
        { name: 'md', shadow: '0 2px 0 rgba(0, 0, 0, 0.05)', var: '--shadow-md', desc: '카드, 버튼' },
        { name: 'lg', shadow: '0 4px 0 rgba(0, 0, 0, 0.08)', var: '--shadow-lg', desc: '드롭다운, 모달' },
      ].map(({ name, shadow, var: cssVar, desc }) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: shadow,
            marginBottom: '12px',
          }} />
          <div style={{ fontSize: '12px', fontWeight: '500' }}>{name}</div>
          <div style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '4px' }}>{desc}</div>
          <code style={{ fontSize: '10px', color: '#757575' }}>{cssVar}</code>
        </div>
      ))}
    </div>

    <div style={{ marginTop: '32px', padding: '16px', background: '#FFF', borderRadius: '8px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>CSS 값</h4>
      <pre style={{ fontSize: '11px', color: '#616161', margin: 0 }}>
{`--shadow-sm: 0 1px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 0 rgba(0, 0, 0, 0.05);
--shadow-lg: 0 4px 0 rgba(0, 0, 0, 0.08);`}
      </pre>
    </div>
  </div>
);

// Z-Index
export const ZIndex = () => (
  <div style={{ padding: '24px', maxWidth: '600px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Z-Index</h2>
    <p style={{ fontSize: '12px', color: '#757575', marginBottom: '24px' }}>
      레이어 순서를 관리하는 z-index 스케일
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[
        { name: 'dropdown', value: 100, var: '--z-dropdown', desc: '드롭다운 메뉴' },
        { name: 'sticky', value: 200, var: '--z-sticky', desc: '고정 헤더/사이드바' },
        { name: 'fixed', value: 300, var: '--z-fixed', desc: '고정 요소' },
        { name: 'modal-backdrop', value: 400, var: '--z-modal-backdrop', desc: '모달 배경' },
        { name: 'modal', value: 500, var: '--z-modal', desc: '모달' },
        { name: 'popover', value: 600, var: '--z-popover', desc: '팝오버' },
        { name: 'tooltip', value: 700, var: '--z-tooltip', desc: '툴팁' },
      ].map(({ name, value, var: cssVar, desc }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#F5F6F8', borderRadius: '8px' }}>
          <div style={{
            width: '48px',
            height: '32px',
            background: `linear-gradient(135deg, #FF6B35 ${100 - value / 7}%, #FFF5F0 100%)`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: '#FFF',
          }}>
            {value}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#757575' }}>{desc}</div>
          </div>
          <code style={{ fontSize: '11px', color: '#9E9E9E' }}>{cssVar}</code>
        </div>
      ))}
    </div>
  </div>
);

// Transitions
export const Transitions = () => (
  <div style={{ padding: '24px', maxWidth: '600px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Transitions</h2>
    <p style={{ fontSize: '12px', color: '#757575', marginBottom: '24px' }}>
      일관된 애니메이션을 위한 전환 속도
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {[
        { name: 'fast', value: '0.15s ease', var: '--transition-fast', desc: '호버, 포커스 등 즉각적인 피드백' },
        { name: 'normal', value: '0.2s ease', var: '--transition-normal', desc: '일반적인 상태 변화' },
        { name: 'slow', value: '0.3s ease', var: '--transition-slow', desc: '모달 열기/닫기, 큰 요소 변화' },
      ].map(({ name, value, var: cssVar, desc }) => (
        <div key={name}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', width: '60px' }}>{name}</span>
            <code style={{ fontSize: '11px', color: '#757575' }}>{value}</code>
            <code style={{ fontSize: '11px', color: '#9E9E9E' }}>{cssVar}</code>
          </div>
          <div style={{ fontSize: '11px', color: '#616161', marginBottom: '8px' }}>{desc}</div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#E8E8E8',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '30%',
                height: '100%',
                background: '#FF6B35',
                borderRadius: '4px',
                transition: value,
              }}
              onMouseEnter={(e) => e.target.style.width = '100%'}
              onMouseLeave={(e) => e.target.style.width = '30%'}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '4px' }}>마우스를 올려서 확인</div>
        </div>
      ))}
    </div>
  </div>
);

// Layout
export const Layout = () => (
  <div style={{ padding: '24px', maxWidth: '800px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Layout</h2>
    <p style={{ fontSize: '12px', color: '#757575', marginBottom: '24px' }}>
      레이아웃 구성 요소 크기
    </p>

    <Section title="주요 레이아웃 변수">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { name: 'Header Height', value: '56px', var: '--header-height', desc: '상단 헤더 높이' },
          { name: 'Sidebar Width', value: '240px', var: '--sidebar-width', desc: '사이드바 너비' },
          { name: 'Content Max Width', value: '1200px', var: '--content-max-width', desc: '컨텐츠 최대 너비' },
          { name: 'Board Gap', value: '12px', var: '--board-gap', desc: '대시보드/보드 간격' },
        ].map(({ name, value, var: cssVar, desc }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#F5F6F8', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{name}</div>
              <div style={{ fontSize: '11px', color: '#757575' }}>{desc}</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#FF6B35' }}>{value}</div>
            <code style={{ fontSize: '11px', color: '#9E9E9E' }}>{cssVar}</code>
          </div>
        ))}
      </div>
    </Section>

    <div style={{ marginTop: '32px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>레이아웃 미리보기</h4>
      <div style={{ border: '1px solid #E8E8E8', borderRadius: '8px', overflow: 'hidden', height: '300px', position: 'relative' }}>
        {/* Header */}
        <div style={{ height: '56px', background: '#FFF', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <span style={{ fontSize: '12px', color: '#757575' }}>Header (56px)</span>
        </div>
        <div style={{ display: 'flex', height: 'calc(100% - 56px)' }}>
          {/* Sidebar */}
          <div style={{ width: '240px', background: '#F5F6F8', borderRight: '1px solid #E8E8E8', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#757575' }}>Sidebar (240px)</span>
          </div>
          {/* Content */}
          <div style={{ flex: 1, padding: '16px', background: '#FFF' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto', background: '#F5F6F8', borderRadius: '8px', padding: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#757575' }}>Content Area</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
