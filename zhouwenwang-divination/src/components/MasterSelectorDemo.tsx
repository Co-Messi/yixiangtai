/**
 * 大师选择器演示组件
 * 用于测试和展示大师选择功能
 */

import React from 'react';
import { MasterSelector } from '../masters';
import { useMaster, useUI } from '../core/store';

export const MasterSelectorDemo: React.FC = () => {
  const { selectedMaster, setSelectedMaster } = useMaster();
  const { loading } = useUI();

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--ui-text)] mb-8 text-center">
          周文王占卜 - 大师选择
        </h1>
        
        <div className="bg-[var(--ui-surface-2)] rounded-lg">
          <MasterSelector
            selectedMaster={selectedMaster}
            onMasterChange={setSelectedMaster}
            loading={loading}
          />
        </div>

        {/* 调试信息 */}
        {selectedMaster && (
          <div className="mt-8 p-4 bg-[var(--ui-surface-3)] rounded-lg">
            <h3 className="text-[var(--ui-text)] font-medium mb-4">调试信息</h3>
            <div className="space-y-2 text-sm">
              <div className="text-[var(--ui-muted)]">
                <span className="text-[var(--ui-muted-2)]">选中大师ID:</span> {selectedMaster.id}
              </div>
              <div className="text-[var(--ui-muted)]">
                <span className="text-[var(--ui-muted-2)]">大师名称:</span> {selectedMaster.name}
              </div>
              <div className="text-[var(--ui-muted)]">
                <span className="text-[var(--ui-muted-2)]">描述:</span> {selectedMaster.description}
              </div>
              <div className="text-[var(--ui-muted)]">
                <span className="text-[var(--ui-muted-2)]">提示词长度:</span> {selectedMaster.prompt.length} 字符
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 