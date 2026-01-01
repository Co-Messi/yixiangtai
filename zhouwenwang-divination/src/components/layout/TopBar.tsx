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

  return (
    <div
      className="fixed top-0 right-0 z-30"
      style={{
        left: isCollapsed ? 72 : 200,
        WebkitAppRegion: 'drag'
      }}
    >
      <div className="mx-6 mt-4">
        <div className="surface-light rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--ui-accent-soft)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--ui-accent)]" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--ui-muted-2)] font-semibold">
                Zhou Wen Wang
              </div>
              <div className="text-base font-semibold text-[var(--ui-text)]">
                周文王占卜
              </div>
            </div>
          </div>
          <div className="text-sm text-[var(--ui-muted)] font-medium">
            {sectionTitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
