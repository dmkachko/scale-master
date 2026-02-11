/**
 * TabSelector Component
 * Tab navigation for switching between Chord and Scale selection modes
 */

import clsx from 'clsx';
import styles from '../SequenceBuilderPage.module.css';

type TabType = 'chord' | 'scale' | 'scale2';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabSelector({
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  return (
    <div className={styles.tabs}>
      <button
        className={clsx(styles.tab, activeTab === 'chord' && styles.activeTab)}
        onClick={() => onTabChange('chord')}
      >
        Select Chord
      </button>
      <button
        className={clsx(styles.tab, activeTab === 'scale' && styles.activeTab)}
        onClick={() => onTabChange('scale')}
      >
        Select Scale
      </button>
      <button
        className={clsx(styles.tab, activeTab === 'scale2' && styles.activeTab)}
        onClick={() => onTabChange('scale2')}
      >
        Select Scale 2
      </button>
    </div>
  );
}
