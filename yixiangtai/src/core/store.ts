import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Master, Settings } from '../types';
import type { StorageResult } from './types';
import { saveSettings } from './settings';
import { getDefaultServerUrl } from '../utils/url';

/**
 * 应用设置状态切片
 */
interface SettingsSlice {
  settings: Settings;
  setApiKey: (apiKey: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  resetSettings: () => void;
  updateSettings: (newSettings: Partial<Settings>) => Promise<StorageResult<void>>;
}

/**
 * UI状态切片
 */
interface UISlice {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * 大师状态切片
 */
interface MasterSlice {
  selectedMaster: Master | null;
  availableMasters: Master[];
  setSelectedMaster: (master: Master | null) => void;
  setAvailableMasters: (masters: Master[]) => void;
  initializeDefaultMaster: () => void;
}

/**
 * 游戏状态切片
 */
interface GameSlice {
  currentGame: string | null;
  gameHistory: any[];
  setCurrentGame: (gameId: string | null) => void;
  addToHistory: (record: any) => void;
  clearHistory: () => void;
}

type AnalysisStatus = 'idle' | 'running' | 'completed' | 'error' | 'stopped';

interface AnalysisSessionState {
  status: AnalysisStatus;
  text: string;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
  controller: AbortController | null;
}

interface DivinationSessionState {
  data: any | null;
  analysis: AnalysisSessionState;
}

/**
 * 占卜会话状态切片（用于后台生成与中断）
 */
interface DivinationSessionSlice {
  divinationSessions: Record<string, DivinationSessionState>;
  setSessionData: (gameId: string, data: any | null) => void;
  setSessionAnalysis: (gameId: string, analysis: Partial<AnalysisSessionState>) => void;
  resetSession: (gameId: string) => void;
  stopSession: (gameId: string) => void;
}


/**
 * 完整的应用状态类型
 */
type AppStore = SettingsSlice & UISlice & MasterSlice & GameSlice & DivinationSessionSlice;

/**
 * 默认设置
 */
const defaultSettings: Settings = {
  apiKey: '',
  theme: 'dark',
  sidebarCollapsed: false,
  serverUrl: getDefaultServerUrl(),
};

/**
 * 默认周文王大师配置
 */
const defaultMaster: Master = {
  id: "zhouwenwang",
  name: "周文王",
  description: "周朝奠基人，精通易经，开创八卦理论，被誉为易学之祖",
  prompt: "你是周文王，古代圣贤，精通易经占卜。你深谙八卦变化之理，能够通过卦象洞察天机，解读人生吉凶。在回答时要体现你的深厚易学功底，语言古朴典雅，充满智慧。请根据提供的占卜信息，给出详细而准确的解读，包含具体的指导建议。"
};

const createEmptySession = (): DivinationSessionState => ({
  data: null,
  analysis: {
    status: 'idle',
    text: '',
    error: null,
    startedAt: null,
    completedAt: null,
    controller: null
  }
});


/**
 * 全局应用状态管理
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // 设置状态
      settings: defaultSettings,
      setApiKey: (apiKey: string) =>
        set((state) => ({
          settings: { ...state.settings, apiKey }
        })),
      setSidebarCollapsed: (collapsed: boolean) =>
        set((state) => ({
          settings: { ...state.settings, sidebarCollapsed: collapsed }
        })),
      toggleSidebar: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            sidebarCollapsed: !state.settings.sidebarCollapsed
          }
        })),
      resetSettings: () =>
        set({ settings: defaultSettings }),
      updateSettings: async (newSettings: Partial<Settings>): Promise<StorageResult<void>> => {
        try {
          // 使用 get() 获取当前状态，避免潜在的状态不一致
          const currentSettings = get().settings as Record<string, unknown>;
          const { openaiApiKey: _legacyOpenaiKey, ...sanitizedCurrent } = currentSettings;
          const updatedSettings = { ...(sanitizedCurrent as Settings), ...newSettings };

          // 保存到localStorage
          const result = saveSettings(updatedSettings);

          if (result.success) {
            // 更新store状态
            set({ settings: updatedSettings });
          }

          return result;
        } catch (error) {
          console.error('更新设置失败:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : '更新设置失败'
          };
        }
      },

      // UI状态
      loading: false,
      error: null,
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // 大师状态
      selectedMaster: defaultMaster, // 默认选中周文王
      availableMasters: [],
      setSelectedMaster: (master: Master | null) => {
        console.log('设置选中大师:', master);
        set({ selectedMaster: master });
      },
      setAvailableMasters: (masters: Master[]) => set({ availableMasters: masters }),
      initializeDefaultMaster: () => {
        const state = get();
        // 如果没有选中的大师，或者当前选中的大师不在可用列表中，则选择周文王
        if (!state.selectedMaster ||
          (state.availableMasters.length > 0 &&
            !state.availableMasters.find(m => m.id === state.selectedMaster?.id))) {
          const zhouwenwang = state.availableMasters.find(m => m.id === 'zhouwenwang') || defaultMaster;
          set({ selectedMaster: zhouwenwang });
        }
      },

      // 游戏状态
      currentGame: null,
      gameHistory: [],
      setCurrentGame: (gameId: string | null) => set({ currentGame: gameId }),
      addToHistory: (record: any) =>
        set((state) => ({
          gameHistory: [record, ...state.gameHistory].slice(0, 100) // 保留最近100条记录
        })),
      clearHistory: () => set({ gameHistory: [] }),

      // 占卜会话状态
      divinationSessions: {},
      setSessionData: (gameId: string, data: any | null) =>
        set((state) => ({
          divinationSessions: {
            ...state.divinationSessions,
            [gameId]: {
              ...(state.divinationSessions[gameId] ?? createEmptySession()),
              data
            }
          }
        })),
      setSessionAnalysis: (gameId: string, analysis: Partial<AnalysisSessionState>) =>
        set((state) => {
          const session = state.divinationSessions[gameId] ?? createEmptySession();
          return {
            divinationSessions: {
              ...state.divinationSessions,
              [gameId]: {
                ...session,
                analysis: {
                  ...session.analysis,
                  ...analysis
                }
              }
            }
          };
        }),
      resetSession: (gameId: string) =>
        set((state) => ({
          divinationSessions: {
            ...state.divinationSessions,
            [gameId]: createEmptySession()
          }
        })),
      stopSession: (gameId: string) => {
        const session = get().divinationSessions[gameId];
        if (session?.analysis.controller) {
          session.analysis.controller.abort();
        }
        set((state) => {
          const current = state.divinationSessions[gameId] ?? createEmptySession();
          return {
            divinationSessions: {
              ...state.divinationSessions,
              [gameId]: {
                ...current,
                analysis: {
                  ...current.analysis,
                  status: 'stopped',
                  controller: null,
                  completedAt: Date.now()
                }
              }
            }
          };
        });
      },

    }),
    {
      name: 'yixiangtai-app-store', // 本地存储的键名
      storage: createJSONStorage(() => localStorage),
      // 只持久化需要的状态
      partialize: (state) => ({
        settings: state.settings,
        selectedMaster: state.selectedMaster,
        gameHistory: state.gameHistory,
      }),
      // 避免在服务器端渲染时出现水合错误
      skipHydration: false,
      // 添加重新水合回调
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Store 重新水合完成');
          // 确保有默认大师
          if (!state.selectedMaster) {
            state.selectedMaster = defaultMaster;
          }
        }
      },
    }
  )
);

/**
 * 获取设置的便捷钩子
 */
export const useSettings = () => {
  const settings = useAppStore((state) => state.settings);
  const setApiKey = useAppStore((state) => state.setApiKey);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const resetSettings = useAppStore((state) => state.resetSettings);

  return {
    settings,
    setApiKey,
    setSidebarCollapsed,
    toggleSidebar,
    resetSettings,
  };
};

/**
 * 获取UI状态的便捷钩子
 */
export const useUI = () => {
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
  };
};

/**
 * 获取大师状态的便捷钩子
 */
export const useMaster = () => {
  const selectedMaster = useAppStore((state) => state.selectedMaster);
  const availableMasters = useAppStore((state) => state.availableMasters);
  const setSelectedMaster = useAppStore((state) => state.setSelectedMaster);
  const setAvailableMasters = useAppStore((state) => state.setAvailableMasters);
  const initializeDefaultMaster = useAppStore((state) => state.initializeDefaultMaster);

  return {
    selectedMaster,
    availableMasters,
    setSelectedMaster,
    setAvailableMasters,
    initializeDefaultMaster,
  };
};

/**
 * 获取游戏状态的便捷钩子
 */
export const useGame = () => {
  const currentGame = useAppStore((state) => state.currentGame);
  const gameHistory = useAppStore((state) => state.gameHistory);
  const setCurrentGame = useAppStore((state) => state.setCurrentGame);
  const addToHistory = useAppStore((state) => state.addToHistory);
  const clearHistory = useAppStore((state) => state.clearHistory);

  return {
    currentGame,
    gameHistory,
    setCurrentGame,
    addToHistory,
    clearHistory,
  };
};

/**
 * 获取占卜会话状态的便捷钩子
 */
export const useDivinationSession = (gameId: string) => {
  const session = useAppStore((state) => state.divinationSessions[gameId]);
  const setSessionData = useAppStore((state) => state.setSessionData);
  const setSessionAnalysis = useAppStore((state) => state.setSessionAnalysis);
  const resetSession = useAppStore((state) => state.resetSession);
  const stopSession = useAppStore((state) => state.stopSession);

  return {
    session,
    setSessionData,
    setSessionAnalysis,
    resetSession,
    stopSession,
  };
};

/**
 * 主store钩子（用于SettingsModal组件）
 */
export const useStore = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setApiKey = useAppStore((state) => state.setApiKey);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const resetSettings = useAppStore((state) => state.resetSettings);

  return {
    settings,
    updateSettings,
    setApiKey,
    setSidebarCollapsed,
    toggleSidebar,
    resetSettings,
  };
};
