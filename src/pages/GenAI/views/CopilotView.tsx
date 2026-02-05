/**
 * Copilot View (실험실)
 * - iframe으로 외부 서비스 연결
 */

import React from 'react';
import { COPILOT_API_URL } from '../constants';
import styles from '../ImageGenPage.module.css';

export const CopilotView: React.FC = () => {
  return (
    <div className={styles.copilotContainer}>
      <iframe
        src={COPILOT_API_URL}
        title="Orange Whale Copilot"
        className={styles.copilotFrame}
        allow="microphone"
      />
    </div>
  );
};

export default CopilotView;
