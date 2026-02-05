/**
 * Chat View (전문가 챗봇)
 * - ExpertChat 컴포넌트 래핑
 */

import React from 'react';
import { ExpertChat } from '../../../features/studio';
import styles from '../ImageGenPage.module.css';

export const ChatView: React.FC = () => {
  return (
    <div className={styles.conversationalContainer}>
      <ExpertChat fullWidth={true} />
    </div>
  );
};

export default ChatView;
