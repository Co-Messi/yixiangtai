/**
 * 主页组件
 * 展示欢迎信息、占卜游戏卡片和AI大师介绍
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI, useMaster } from '../core/store';
import { motion } from 'framer-motion';
import { Star, Sparkles, Brain, Eye, Crown, Lightbulb, Compass, BookOpen, Hand, Music, MessageCircle, Smile, Shield } from 'lucide-react';
import { getAllGames } from '../games';
import { fetchMasters, getDefaultMaster } from '../masters/service';
import type { Master } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { clearError } = useUI();
  const { selectedMaster, setSelectedMaster, availableMasters, setAvailableMasters } = useMaster();
  const games = getAllGames();
  const [loading, setLoading] = useState(true);
  const masterSectionRef = useRef<HTMLDivElement | null>(null);

  // 图标映射函数
  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
      Crown,
      Lightbulb,
      Eye,
      Compass,
      BookOpen,
      Hand,
      Music,
      MessageCircle,
      Smile,
    };
    
    return iconName ? iconMap[iconName] : null;
  };

  useEffect(() => {
    const loadMasters = async () => {
      try {
        // 如果全局状态中已经有大师数据，则直接使用
        if (availableMasters.length > 0) {
          setLoading(false);
          return;
        }

        const mastersData = await fetchMasters();
        setAvailableMasters(mastersData);
        
        // 如果没有选中的大师，设置默认大师
        if (!selectedMaster && mastersData.length > 0) {
          const defaultMaster = getDefaultMaster(mastersData);
          if (defaultMaster) {
            console.log('首页设置默认大师:', defaultMaster);
            setSelectedMaster(defaultMaster);
          }
        }
      } catch (error) {
        console.error('加载大师数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, [availableMasters, selectedMaster, setAvailableMasters, setSelectedMaster]);

  const handleGameClick = (path: string) => {
    clearError(); // 导航到游戏页面时清除错误
    navigate(path);
  };

  const handleMasterSelect = (master: Master) => {
    console.log('首页选择大师:', master);
    setSelectedMaster(master);
  };

  const handleViewMaster = () => {
    const target = masterSectionRef.current;
    if (!target) {
      return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen text-[var(--ui-text)]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-8 pb-16">
        <motion.div className="grid grid-cols-12 gap-8 items-start" variants={itemVariants}>
          <motion.section className="col-span-7 space-y-6" variants={itemVariants}>
            <div className="surface-light rounded-[24px] p-10">
              <div className="text-xs text-[var(--ui-muted-2)] font-medium">
                yixiangtai
              </div>
              <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-ink">
                易象台
              </h1>
              <p className="mt-4 text-base text-[var(--ui-muted)] leading-relaxed">
                传承千年的古典智慧，融合现代AI技术，为您提供准确的占卜分析与人生指导。
              </p>
              <div className="mt-8 flex items-center gap-4">
                <motion.button
                  onClick={() => handleGameClick('/liuyao')}
                  className="bg-[var(--ui-accent)] text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-[var(--ui-accent-strong)] transition-all duration-300"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    立即起卦
                  </span>
                </motion.button>
                <button
                  onClick={handleViewMaster}
                  className="px-6 py-3 rounded-xl border border-[var(--ui-border)] text-[var(--ui-text)] hover:border-[var(--ui-accent)] transition-colors"
                >
                  查看大师
                </button>
              </div>
              <div className="mt-10 hairline" />
              <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-[var(--ui-muted)]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--ui-accent)]" />
                  本地隐私保护
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[var(--ui-accent)]" />
                  AI智能分析
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[var(--ui-accent)]" />
                  传统易学智慧
                </div>
              </div>
            </div>

            <div className="surface-light rounded-[24px] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--ui-accent-soft)] flex items-center justify-center text-[var(--ui-accent)]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--ui-text)]">起卦指南</h2>
                    <p className="text-xs text-[var(--ui-muted-2)]">三步完成 · 快速入门</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--ui-muted-2)]">今日启示</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: '选择大师', desc: '先在右侧挑选偏好的解读风格' },
                  { title: '填写信息', desc: '按提示输入必要的占卜资料' },
                  { title: '查看解读', desc: '结合大师建议做出更好的判断' }
                ].map((item, index) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center justify-center text-sm font-semibold text-[var(--ui-text)]">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--ui-text)]">{item.title}</div>
                      <div className="text-xs text-[var(--ui-muted-2)]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-4 py-3">
                <div>
                  <div className="text-xs text-[var(--ui-muted-2)]">当前大师</div>
                  <div className="text-sm font-semibold text-[var(--ui-text)]">
                    {selectedMaster ? selectedMaster.name : '未选择'}
                  </div>
                </div>
                <button
                  onClick={handleViewMaster}
                  className="text-xs font-semibold text-[var(--ui-accent)] hover:text-[var(--ui-accent-strong)]"
                >
                  去选择
                </button>
              </div>
            </div>
          </motion.section>

          <motion.section className="col-span-5 space-y-6" variants={itemVariants}>
            <div className="surface-light rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--ui-text)]">占卜入口</h2>
                <span className="text-xs text-[var(--ui-muted-2)]">精选功能</span>
              </div>
              <div className="space-y-3">
                {games.map(game => {
                  const IconComponent = game.icon;
                  return (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameClick(game.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--ui-border)] hover:border-[var(--ui-accent)] hover:bg-[var(--ui-surface-2)] transition-all"
                      whileHover={{ scale: 1.01, x: 2 }}
                    >
                      {IconComponent && (
                        <span className="w-9 h-9 rounded-xl bg-[var(--ui-accent-soft)] flex items-center justify-center text-[var(--ui-accent)]">
                          <IconComponent size={18} />
                        </span>
                      )}
                      <div className="text-left">
                        <div className="text-sm font-semibold text-[var(--ui-text)]">{game.name}</div>
                        <div className="text-xs text-[var(--ui-muted-2)]">{game.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div ref={masterSectionRef} className="surface-light rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--ui-text)]">大师选择</h2>
                <span className="text-xs text-[var(--ui-muted-2)]">实时切换</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-3 text-sm text-[var(--ui-muted-2)]">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--ui-accent)]"></div>
                  正在加载大师信息...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {availableMasters.map(master => {
                      const IconComponent = getIconComponent(master.icon);
                      return (
                        <button
                          key={master.id}
                          onClick={() => handleMasterSelect(master)}
                          className={`rounded-2xl px-2 py-3 border text-xs transition-all ${
                            selectedMaster?.id === master.id
                              ? 'border-[var(--ui-accent)] bg-[var(--ui-surface-3)]'
                              : 'border-[var(--ui-border)] hover:border-[var(--ui-accent)]'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {IconComponent && <IconComponent size={16} className="text-[var(--ui-accent)]" />}
                            <span className="text-[var(--ui-text)] font-semibold">{master.name}</span>
                            {master.dynasty && (
                              <span className="text-[10px] text-[var(--ui-muted-2)]">{master.dynasty}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedMaster && (
                    <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4">
                      <div className="text-sm font-semibold text-[var(--ui-text)] mb-2">{selectedMaster.name}</div>
                      <p className="text-xs text-[var(--ui-muted-2)] leading-relaxed">
                        {selectedMaster.description}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage; 
