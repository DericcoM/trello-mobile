import React from 'react';
import styles from './EmptyGroupMessage.module.scss';

const EmptyGroupMessage: React.FC = () => {
  return (
    <div className={styles.emptyGroup}>
      <p>Перетащите задачу сюда</p>
    </div>
  );
};

export default EmptyGroupMessage;
