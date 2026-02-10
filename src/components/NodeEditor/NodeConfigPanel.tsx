/**
 * Node Config Panel
 * 선택된 노드의 설정을 편집하는 우측 패널
 */

import React from 'react';
import type { Node } from '@xyflow/react';
import type { CustomNodeData } from './CustomNode';
import type { ConfigDefinition } from '../../nodes/types';
import { nodeRegistry } from '../../nodes/registry';
import styles from './NodeConfigPanel.module.css';

interface NodeConfigPanelProps {
  selectedNode: Node<CustomNodeData> | null;
  onConfigChange: (nodeId: string, configId: string, value: unknown) => void;
  onClose: () => void;
  embedded?: boolean;
}

/**
 * 설정 필드 렌더링
 */
const ConfigField: React.FC<{
  config: ConfigDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  allConfig?: Record<string, unknown>;
  onAutoReset?: (configId: string, value: unknown) => void;
}> = ({ config, value, onChange, allConfig, onAutoReset }) => {
  const currentValue = value ?? config.default ?? '';

  switch (config.type) {
    case 'text':
      return (
        <input
          type="text"
          className={styles.textInput}
          value={String(currentValue)}
          onChange={e => onChange(e.target.value)}
          placeholder={config.description}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className={styles.numberInput}
          value={Number(currentValue) || 0}
          onChange={e => onChange(Number(e.target.value))}
          min={config.min}
          max={config.max}
          step={config.step || 1}
        />
      );

    case 'boolean':
      return (
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={Boolean(currentValue)}
            onChange={e => onChange(e.target.checked)}
          />
          <span className={styles.toggle} />
        </label>
      );

    case 'select': {
      // 옵션 레벨 showWhen 필터링
      const filteredOptions = config.options?.filter(opt => {
        if (!opt.showWhen) return true;
        const depValue = allConfig?.[opt.showWhen.field];
        const allowed = opt.showWhen.value;
        return Array.isArray(allowed)
          ? allowed.includes(depValue as string)
          : depValue === allowed;
      }) ?? [];

      // 현재 값이 필터링된 옵션에 없으면 첫 번째 옵션으로 자동 리셋
      const currentStr = String(currentValue);
      const isValidValue = filteredOptions.some(opt => opt.value === currentStr);
      if (!isValidValue && filteredOptions.length > 0 && onAutoReset) {
        // 비동기로 리셋 (렌더 중 setState 방지)
        setTimeout(() => onAutoReset(config.id, filteredOptions[0].value), 0);
      }

      return (
        <select
          className={styles.select}
          value={isValidValue ? currentStr : (filteredOptions[0]?.value ?? '')}
          onChange={e => onChange(e.target.value)}
        >
          {filteredOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case 'slider':
      return (
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            className={styles.slider}
            value={Number(currentValue) || config.min || 0}
            onChange={e => onChange(Number(e.target.value))}
            min={config.min || 0}
            max={config.max || 100}
            step={config.step || 1}
          />
          <span className={styles.sliderValue}>{String(currentValue)}</span>
        </div>
      );

    case 'color':
      return (
        <input
          type="color"
          className={styles.colorInput}
          value={String(currentValue) || '#000000'}
          onChange={e => onChange(e.target.value)}
        />
      );

    default:
      return null;
  }
};

/**
 * 노드 설정 패널 컴포넌트
 */
const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  selectedNode,
  onConfigChange,
  onClose,
  embedded = false,
}) => {
  if (!selectedNode) {
    return (
      <div className={`${styles.panel} ${embedded ? styles.embedded : ''}`}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>👆</span>
          <p>노드를 선택하세요</p>
        </div>
      </div>
    );
  }

  const nodeData = selectedNode.data as CustomNodeData;
  const nodeDef = nodeRegistry.get(nodeData.nodeId);

  if (!nodeDef) {
    return (
      <div className={`${styles.panel} ${embedded ? styles.embedded : ''}`}>
        <div className={styles.error}>
          노드 정의를 찾을 수 없습니다
        </div>
      </div>
    );
  }

  const handleChange = (configId: string, value: unknown) => {
    onConfigChange(selectedNode.id, configId, value);
  };

  return (
    <div className={`${styles.panel} ${embedded ? styles.embedded : ''}`}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.nodeInfo}>
          <span className={styles.nodeIcon}>{nodeDef.icon}</span>
          <span className={styles.nodeName}>{nodeDef.name}</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      {/* 노드 설명 */}
      <div className={styles.description}>
        {nodeDef.description}
      </div>

      {/* 설정 폼 */}
      <div className={styles.configList}>
        {nodeDef.config.length === 0 ? (
          <div className={styles.noConfig}>
            설정 항목이 없습니다
          </div>
        ) : (
          nodeDef.config
            .filter(config => {
              if (!config.showWhen) return true;
              const depValue = nodeData.config[config.showWhen.field];
              const allowed = config.showWhen.value;
              return Array.isArray(allowed)
                ? allowed.includes(depValue as string)
                : depValue === allowed;
            })
            .map(config => (
            <div key={config.id} className={styles.configItem}>
              <label className={styles.configLabel}>
                {config.name}
                {config.description && (
                  <span className={styles.configHint} title={config.description}>
                    ⓘ
                  </span>
                )}
              </label>
              <ConfigField
                config={config}
                value={nodeData.config[config.id]}
                onChange={val => handleChange(config.id, val)}
                allConfig={nodeData.config}
                onAutoReset={handleChange}
              />
            </div>
          ))
        )}
      </div>

      {/* 입출력 정보 */}
      <div className={styles.portsInfo}>
        <div className={styles.portsSection}>
          <h4 className={styles.portsTitle}>입력</h4>
          {nodeDef.inputs.map(input => (
            <div key={input.id} className={styles.portItem}>
              <span className={styles.portName}>{input.name}</span>
              <span className={styles.portType}>{input.type}</span>
              {input.required && <span className={styles.required}>필수</span>}
            </div>
          ))}
          {nodeDef.inputs.length === 0 && (
            <span className={styles.noPorts}>없음</span>
          )}
        </div>

        <div className={styles.portsSection}>
          <h4 className={styles.portsTitle}>출력</h4>
          {nodeDef.outputs.map(output => (
            <div key={output.id} className={styles.portItem}>
              <span className={styles.portName}>{output.name}</span>
              <span className={styles.portType}>{output.type}</span>
            </div>
          ))}
          {nodeDef.outputs.length === 0 && (
            <span className={styles.noPorts}>없음</span>
          )}
        </div>
      </div>

      {/* 노드 ID (디버그용) */}
      <div className={styles.footer}>
        <span className={styles.nodeId}>ID: {selectedNode.id}</span>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
