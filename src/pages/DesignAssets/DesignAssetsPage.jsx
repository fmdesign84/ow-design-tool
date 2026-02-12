import React, { useState } from 'react';
import { useAppNavigate } from '../../hooks/useAppRouter';
import styles from './DesignAssetsPage.module.css';

const TABS = [
  { key: 'tokens', label: 'Design Tokens' },
  { key: 'assets', label: 'Assets' },
];

const TOKEN_GROUPS = [
  {
    title: 'Primitive Tokens',
    source: 'src/styles/tokens/primitive.css',
    items: [
      { name: '--color-primary', value: '#ff6b00' },
      { name: '--color-neutral-50', value: '#fafafa' },
      { name: '--color-neutral-800', value: '#424242' },
      { name: '--spacing-4', value: '16px' },
      { name: '--radius-lg', value: '12px' },
      { name: '--font-size-md', value: '14px' },
    ],
  },
  {
    title: 'Semantic Tokens',
    source: 'src/styles/tokens/semantic.css',
    items: [
      { name: '--text-primary', value: 'var(--color-neutral-800)' },
      { name: '--text-secondary', value: 'var(--color-neutral-700)' },
      { name: '--surface-primary', value: 'var(--color-white)' },
      { name: '--border-default', value: 'var(--color-neutral-300)' },
      { name: '--status-success', value: 'var(--color-green-500)' },
      { name: '--shadow-md', value: '0 4px 12px rgba(0, 0, 0, 0.08)' },
    ],
  },
  {
    title: 'Component Tokens',
    source: 'src/styles/tokens/component.css',
    items: [
      { name: '--node-editor-bg', value: '#f5f6f8' },
      { name: '--node-editor-panel-bg', value: '#ffffff' },
      { name: '--node-editor-panel-border', value: '#e8e8e8' },
      { name: '--studio-nav-item-bg-active', value: '#fff5f0' },
      { name: '--header-transparent-text', value: '#ffffff' },
      { name: '--confirm-bg', value: '#ffffff' },
    ],
  },
];

const ASSET_GROUPS = [
  {
    title: 'Icons',
    source: 'src/assets/icons',
    items: [
      'src/assets/icons/logo.svg',
      'src/assets/icons/logo-only.svg',
      'src/assets/icons/whale-icon.svg',
      'src/assets/icons/icon-home.svg',
      'src/assets/icons/icon-chevron-down.svg',
      'src/assets/icons/search-icon.svg',
    ],
  },
  {
    title: 'Images',
    source: 'src/assets/images',
    items: [
      'src/assets/images/whale-celebration.png',
    ],
  },
];

const DesignAssetsPage = () => {
  const navigate = useAppNavigate();
  const [activeTab, setActiveTab] = useState('tokens');
  const [copiedValue, setCopiedValue] = useState('');

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(text);
      setTimeout(() => setCopiedValue(''), 1200);
    } catch {
      // Clipboard API 미지원 브라우저 대비
      setCopiedValue('');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Design Assets</h1>
          <p className={styles.subtitle}>OW Tool 디자인 토큰/에셋 목록</p>
        </div>
        <button className={styles.backButton} onClick={() => navigate('/wave')}>
          WAVE로 돌아가기
        </button>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'tokens' && (
        <div className={styles.sectionList}>
          {TOKEN_GROUPS.map((group) => (
            <section key={group.title} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{group.title}</h2>
                <button className={styles.sourcePath} onClick={() => copyText(group.source)}>
                  {group.source}
                </button>
              </div>
              <div className={styles.grid}>
                {group.items.map((token) => {
                  const copyValue = `var(${token.name})`;
                  return (
                    <button
                      key={token.name}
                      className={styles.itemCard}
                      onClick={() => copyText(copyValue)}
                      title={copyValue}
                    >
                      <span className={styles.itemName}>{token.name}</span>
                      <span className={styles.itemValue}>{token.value}</span>
                      {copiedValue === copyValue && <span className={styles.copied}>Copied</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className={styles.sectionList}>
          {ASSET_GROUPS.map((group) => (
            <section key={group.title} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{group.title}</h2>
                <button className={styles.sourcePath} onClick={() => copyText(group.source)}>
                  {group.source}
                </button>
              </div>
              <div className={styles.list}>
                {group.items.map((assetPath) => (
                  <button
                    key={assetPath}
                    className={styles.listItem}
                    onClick={() => copyText(assetPath)}
                    title={assetPath}
                  >
                    <span className={styles.itemName}>{assetPath}</span>
                    {copiedValue === assetPath && <span className={styles.copied}>Copied</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignAssetsPage;
