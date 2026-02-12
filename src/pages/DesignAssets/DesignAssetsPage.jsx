import React, { useMemo, useState } from 'react';
import { useAppNavigate } from '../../hooks/useAppRouter';
import { TOKEN_LAYERS, ASSET_GROUPS, TOKEN_TOTAL, ASSET_TOTAL } from './catalog';
import styles from './DesignAssetsPage.module.css';

const MAIN_TABS = [
  { key: 'tokens', label: 'Design Tokens' },
  { key: 'assets', label: 'Assets' },
];

const TOKEN_TABS = [
  { key: 'all', label: 'All' },
  { key: 'colors', label: 'Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'radius', label: 'Radius' },
  { key: 'effects', label: 'Effects' },
  { key: 'motion', label: 'Motion' },
  { key: 'layout', label: 'Layout' },
  { key: 'component', label: 'Component' },
];

const flattenTokens = () => TOKEN_LAYERS.flatMap((layer) =>
  layer.items.map((item) => ({ ...item, layerKey: layer.key, layerLabel: layer.label, source: layer.file }))
);

const classifyToken = (tokenName) => {
  if (/^--(color|text|bg|surface|border|toast|tooltip|modal|notification|tag)-/.test(tokenName)) return 'colors';
  if (/^--(font|line-height)-/.test(tokenName)) return 'typography';
  if (/^--(spacing|space)-/.test(tokenName)) return 'spacing';
  if (/^--radius-/.test(tokenName)) return 'radius';
  if (/^--(shadow|effect)-/.test(tokenName) || tokenName.includes('glow')) return 'effects';
  if (/^--transition-/.test(tokenName)) return 'motion';
  if (/^--(z-|header-height|sidebar|content|max-width|board-gap)/.test(tokenName)) return 'layout';
  return 'component';
};

const parsePixel = (value) => {
  const match = String(value).match(/^(\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : null;
};

const DesignAssetsPage = () => {
  const navigate = useAppNavigate();
  const [activeTab, setActiveTab] = useState('tokens');
  const [tokenTab, setTokenTab] = useState('colors');
  const [tokenFilter, setTokenFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [copiedValue, setCopiedValue] = useState('');

  const allTokens = useMemo(flattenTokens, []);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(text);
      setTimeout(() => setCopiedValue(''), 1200);
    } catch {
      setCopiedValue('');
    }
  };

  const normalizedTokenFilter = tokenFilter.trim().toLowerCase();
  const normalizedAssetFilter = assetFilter.trim().toLowerCase();

  const filteredTokens = useMemo(() => {
    return allTokens
      .filter((token) => {
        if (!normalizedTokenFilter) return true;
        return token.name.toLowerCase().includes(normalizedTokenFilter)
          || token.value.toLowerCase().includes(normalizedTokenFilter);
      })
      .filter((token) => tokenTab === 'all' || classifyToken(token.name) === tokenTab);
  }, [allTokens, normalizedTokenFilter, tokenTab]);

  const filteredTokensByLayer = useMemo(() => {
    return TOKEN_LAYERS.map((layer) => ({
      key: layer.key,
      label: layer.label,
      source: layer.file,
      items: filteredTokens.filter((token) => token.layerKey === layer.key),
    })).filter((layer) => layer.items.length > 0);
  }, [filteredTokens]);

  const filteredAssetGroups = useMemo(() => {
    return ASSET_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((assetPath) => {
        if (!normalizedAssetFilter) return true;
        return assetPath.toLowerCase().includes(normalizedAssetFilter);
      }),
    })).filter((group) => group.items.length > 0);
  }, [normalizedAssetFilter]);

  const filteredAssetCount = filteredAssetGroups.reduce((acc, group) => acc + group.items.length, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Design Assets</h1>
          <p className={styles.subtitle}>컬러/타이포/스페이싱 등 카테고리별 토큰 뷰</p>
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
          <span className={styles.metricLabel}>현재 토큰</span>
          <strong className={styles.metricValue}>{filteredTokens.length}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>전체 에셋</span>
          <strong className={styles.metricValue}>{ASSET_TOTAL}</strong>
        </div>
      </div>

      <div className={styles.tabs}>
        {MAIN_TABS.map((tab) => (
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
              placeholder="토큰명/값 검색 (--color-primary, 14px, rgba...)"
            />
          </div>

          <div className={styles.tokenTabs}>
            {TOKEN_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tokenTab} ${tokenTab === tab.key ? styles.active : ''}`}
                onClick={() => setTokenTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredTokensByLayer.map((layer) => (
            <section key={layer.key} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{layer.label} ({layer.items.length})</h2>
                <button className={styles.sourcePath} onClick={() => copyText(layer.source)}>
                  {layer.source}
                </button>
              </div>

              <div className={styles.grid}>
                {layer.items.map((token) => {
                  const tokenVar = `var(${token.name})`;
                  const category = classifyToken(token.name);
                  const spacingPx = parsePixel(token.value);
                  const spacingWidth = spacingPx ? Math.min(Math.max(spacingPx, 6), 180) : 36;

                  return (
                    <button
                      key={`${token.layerKey}-${token.name}`}
                      className={styles.itemCard}
                      onClick={() => copyText(tokenVar)}
                      title={tokenVar}
                    >
                      {category === 'colors' && (
                        <span className={styles.swatch} style={{ background: tokenVar }} />
                      )}

                      {category === 'spacing' && (
                        <span className={styles.spacingBar} style={{ width: `${spacingWidth}px` }} />
                      )}

                      {category === 'radius' && (
                        <span className={styles.radiusBox} style={{ borderRadius: tokenVar }} />
                      )}

                      {category === 'effects' && (
                        <span className={styles.shadowBox} style={{ boxShadow: tokenVar }} />
                      )}

                      <span className={styles.itemName}>{token.name}</span>
                      <span className={styles.itemValue}>{token.value}</span>
                      <span className={styles.itemMeta}>line {token.line}</span>
                      {copiedValue === tokenVar && <span className={styles.copied}>Copied</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {filteredTokensByLayer.length === 0 && (
            <div className={styles.emptyState}>검색/카테고리 조건에 맞는 토큰이 없습니다.</div>
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
              placeholder="에셋 경로 검색 (icons, images, pdf...)"
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
