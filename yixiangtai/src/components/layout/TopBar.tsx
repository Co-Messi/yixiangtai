import React from 'react';
import { useLocation } from 'react-router-dom';
import { getAllGames } from '../../games';

interface TopBarProps {
  isCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const games = getAllGames();
  const gameMatch = games.find(game => game.path === location.pathname);
  const sectionTitle = location.pathname === '/' ? '首页' : (gameMatch?.name || '功能');
  const dragStyle: React.CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' } = {
    left: isCollapsed ? 72 : 200,
    WebkitAppRegion: 'drag'
  };

  return (
    <div
      className="fixed top-0 right-0 z-30"
      style={dragStyle}
    >
      <div className="mx-6 mt-4">
        <div className="surface-light rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-[var(--ui-text)]">
              易象台
            </div>
            <span className="text-xs text-[var(--ui-muted-2)]">·</span>
            <div className="text-xs text-[var(--ui-muted)]">
              {sectionTitle}
            </div>
          </div>
          <div className="text-xs text-[var(--ui-muted-2)]">
            yixiangtai
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
