import React, { useState } from 'react';
import { useAppNavigate } from '../../hooks/useAppRouter';
import { TOKEN_LAYERS, ASSET_GROUPS, TOKEN_TOTAL, ASSET_TOTAL } from './catalog';
import styles from './DesignAssetsPage.module.css';

const TABS = [
  { key: 'tokens', label: 'Design Tokens' },
  { key: 'assets', label: 'Assets' },
];

const DesignAssetsPage = () => {
  const navigate = useAppNavigate();
  const [activeTab, setActiveTab] = useState('tokens');
  const [tokenFilter, setTokenFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
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

  const normalizedTokenFilter = tokenFilter.trim().toLowerCase();
  const normalizedAssetFilter = assetFilter.trim().toLowerCase();

  const filteredTokenLayers = TOKEN_LAYERS.map((layer) => ({
    ...layer,
    items: layer.items.filter((token) => {
      if (!normalizedTokenFilter) return true;
      return token.name.toLowerCase().includes(normalizedTokenFilter)
        || token.value.toLowerCase().includes(normalizedTokenFilter);
    }),
  })).filter((layer) => layer.items.length > 0);

  const filteredAssetGroups = ASSET_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((assetPath) => {
      if (!normalizedAssetFilter) return true;
      return assetPath.toLowerCase().includes(normalizedAssetFilter);
    }),
  })).filter((group) => group.items.length > 0);

  const filteredTokenCount = filteredTokenLayers.reduce((acc, layer) => acc + layer.items.length, 0);
  const filteredAssetCount = filteredAssetGroups.reduce((acc, group) => acc + group.items.length, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Design Assets</h1>
          <p className={styles.subtitle}>OW Tool 전체 디자인 토큰/에셋 카탈로그</p>
        </div>
        <button className={styles.backButton} onClick={() => navigate('/wave')}>
          WAVE로 돌아가기
        </button>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>전체 토큰</span>
          <strong className={styles.metricValue}>{TOKEN_TOTAL}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>전체 에셋</span>
          <strong className={styles.metricValue}>{ASSET_TOTAL}</strong>
        </div>
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
          <div className={styles.filterRow}>
            <input
              className={styles.filterInput}
              value={tokenFilter}
              onChange={(event) => setTokenFilter(event.target.value)}
              placeholder="토큰명 또는 값으로 검색 (--color-primary, 14px, rgba...)"
            />
            <span className={styles.filterCount}>{filteredTokenCount}개 표시</span>
          </div>
          {filteredTokenLayers.map((group) => (
            <section key={group.key} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{group.label} ({group.items.length})</h2>
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
                      <span className={styles.itemMeta}>line {token.line}</span>
                      {copiedValue === copyValue && <span className={styles.copied}>Copied</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {filteredTokenLayers.length === 0 && (
            <div className={styles.emptyState}>검색 결과가 없습니다.</div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className={styles.sectionList}>
          <div className={styles.filterRow}>
            <input
              className={styles.filterInput}
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              placeholder="에셋 경로로 검색 (icons, images, pdf...)"
            />
            <span className={styles.filterCount}>{filteredAssetCount}개 표시</span>
          </div>
          {filteredAssetGroups.map((group) => (
            <section key={group.key} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{group.label} ({group.items.length})</h2>
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
          {filteredAssetGroups.length === 0 && (
            <div className={styles.emptyState}>검색 결과가 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignAssetsPage;
