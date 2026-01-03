import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAIAnalysisStream, isAbortError } from '../../masters/service';
import { useDivinationSession, useMaster, useUI } from '../../core/store';
import { addRecord } from '../../core/history';
import { StreamingMarkdown, ErrorToast, useAutoScroll } from '../../components/common';
import DivinationAnimation from '../../components/DivinationAnimation';
import { getRandomQuestions } from '../../core/quickQuestions';
import type { DivinationRecord } from '../../types';

const ZhouGongPage = () => {
  const [dreamDescription, setDreamDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);

  const { selectedMaster } = useMaster();
  const { error, setError } = useUI();
  const navigate = useNavigate();
  const { session, setSessionData, setSessionAnalysis, resetSession, stopSession } = useDivinationSession('zhougong');
  
  // 使用通用的自动滚动Hook
  const { contentRef: analysisRef } = useAutoScroll({
    isAnalyzing: analyzing,
    content: analysis
  });

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.data && session.data !== dreamDescription) {
      setDreamDescription(session.data as string);
    }

    if (session.analysis.text !== analysis) {
      setAnalysis(session.analysis.text);
    }

    const nextAnalyzing = session.analysis.status === 'running';
    if (nextAnalyzing !== analyzing) {
      setAnalyzing(nextAnalyzing);
    }

    const nextComplete = session.analysis.status === 'completed';
    if (nextComplete !== analysisComplete) {
      setAnalysisComplete(nextComplete);
    }

    const nextShowLoading = nextAnalyzing && !session.analysis.text;
    if (nextShowLoading !== showLoadingAnimation) {
      setShowLoadingAnimation(nextShowLoading);
    }
  }, [session, dreamDescription, analysis, analyzing, analysisComplete, showLoadingAnimation]);

  // 自动清除错误提示
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // 初始化随机问题
  useEffect(() => {
    setQuickQuestions(getRandomQuestions('zhougong', 3));
  }, []);

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

  /**
   * 快速开始解梦
   */
  const quickStart = async (selectedDream: string) => {
    setDreamDescription(selectedDream);
    
    setTimeout(() => {
      performDreamAnalysis(selectedDream);
    }, 200);
  };

  const resetDream = () => {
    stopSession('zhougong');
    resetSession('zhougong');
    setDreamDescription('');
    setAnalysis('');
    setAnalyzing(false);
    setAnalysisComplete(false);
    setShowLoadingAnimation(false);
  };

  /**
   * 执行梦境分析 - 直接调用大模型
   */
  const performDreamAnalysis = async (dreamText?: string) => {
    const dreamToAnalyze = dreamText || dreamDescription;
    
    if (!dreamToAnalyze.trim()) {
      setError('请输入您的梦境内容');
      return;
    }

    if (!selectedMaster) {
      setError('请先在设置中选择一位大师');
      return;
    }

    stopSession('zhougong');
    resetSession('zhougong');

    const controller = new AbortController();
    setSessionAnalysis('zhougong', {
      status: 'running',
      text: '',
      error: null,
      startedAt: Date.now(),
      completedAt: null,
      controller
    });
    setSessionData('zhougong', dreamToAnalyze.trim());

    try {
      setAnalyzing(true);
      setError(null);
      setAnalysis('');
      setAnalysisComplete(false);
      setShowLoadingAnimation(true);

      // 构建解梦数据
      const divinationData = {
        type: 'zhougong',
        dreamDescription: dreamToAnalyze.trim(),
        timestamp: Date.now()
      };

      // 使用流式分析，实时更新结果
      const analysisResult = await getAIAnalysisStream(
        divinationData,
        selectedMaster,
        'zhougong',
        undefined,
        (streamText) => {
          if (streamText && streamText.trim()) {
            setSessionAnalysis('zhougong', { text: streamText });
          }
        },
        controller.signal
      );

      setAnalysisComplete(true);
      setSessionAnalysis('zhougong', {
        status: 'completed',
        completedAt: Date.now(),
        controller: null
      });

      // 保存到历史记录
      const record: DivinationRecord = {
        id: `zhougong-${Date.now()}`,
        type: 'zhougong',
        timestamp: Date.now(),
        data: divinationData,
        master: {
          id: selectedMaster.id,
          name: selectedMaster.name,
          description: selectedMaster.description
        },
        analysis: analysisResult
      };
      await addRecord(record);

    } catch (error) {
      if (isAbortError(error)) {
        setSessionAnalysis('zhougong', {
          status: 'stopped',
          completedAt: Date.now(),
          controller: null
        });
        return;
      }

      console.error('AI分析失败:', error);
      const message = error instanceof Error ? error.message : '分析过程中发生错误';
      setSessionAnalysis('zhougong', {
        status: 'error',
        error: message,
        completedAt: Date.now(),
        controller: null
      });
      setError(message);
      setAnalysisComplete(false);
    } finally {
      setAnalyzing(false);
      setShowLoadingAnimation(false);
    }
  };

  const canStartAnalysis = dreamDescription.trim() && selectedMaster && !analyzing && !analysisComplete;

  return (
    <motion.div 
      className="min-h-screen text-[var(--ui-text)]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <motion.div 
          className="text-center mb-2"
          variants={itemVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--ui-text)] via-[var(--ui-muted-2)] to-[var(--ui-accent)] bg-clip-text text-transparent">
            周公解梦
          </h1>
          <p className="text-xl text-[var(--ui-muted-2)] max-w-3xl mx-auto leading-relaxed">
            承古圣贤智慧，解析梦境奥秘，窥探潜意识深处的神秘信息
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* 梦境描述输入区域 */}
          <motion.div variants={itemVariants}>
            {/* 输入框和按钮水平排列 - 居中 */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <motion.textarea
                value={dreamDescription}
                onChange={(e) => setDreamDescription(e.target.value)}
                placeholder="请详细描述您的梦境..."
                className="w-[400px] h-[100px] px-6 py-3 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] rounded-xl !text-[var(--ui-text)] !text-lg !font-bold placeholder:!text-[var(--ui-muted-2)] focus:border-[var(--ui-accent)] focus:outline-none transition-all duration-300 resize-none"
                style={{ 
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: 'var(--ui-border)',
                  borderRadius: '12px'
                }}
                disabled={analyzing}
              />
              <motion.button 
                onClick={() => performDreamAnalysis()}
                disabled={!canStartAnalysis}
                className={`px-8 py-3 h-[46px] rounded-xl font-bold text-lg transition-all duration-300 shadow-lg whitespace-nowrap flex items-center justify-center ${
                  !canStartAnalysis
                    ? 'bg-[var(--ui-muted)] text-[var(--ui-muted-2)] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] text-white hover:from-[var(--ui-accent-strong)] hover:to-[var(--ui-accent-strong)] hover:shadow-xl hover:shadow-[0_12px_30px_rgba(37,94,234,0.25)]'
                }`}
                whileHover={canStartAnalysis ? { scale: 1.05, y: -2 } : {}}
                whileTap={canStartAnalysis ? { scale: 0.98 } : {}}
              >
                {analyzing ? (
                  <span className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    正在解梦...
                  </span>
                ) : (
                  '开始解梦'
                )}
              </motion.button>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {analysis && !analyzing && (
                <motion.button
                  onClick={resetDream}
                  className="px-5 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-[var(--ui-text)] text-sm font-semibold hover:bg-[var(--ui-surface-3)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  重新生成
                </motion.button>
              )}
              {analyzing && (
                <motion.button
                  onClick={() => stopSession('zhougong')}
                  className="px-5 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-[var(--ui-danger)] text-sm font-semibold hover:bg-[var(--ui-surface-3)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  停止生成
                </motion.button>
              )}
            </div>

            {/* 快速开始水平布局 - 居中 */}
            <div className="flex justify-center items-center gap-3">
              <h4 className="text-lg font-medium text-[var(--ui-text)] whitespace-nowrap">快速开始：</h4>
              <div className="flex flex-wrap gap-4">
                {quickQuestions.map((quickDream, index) => (
                  <motion.span
                    key={index}
                    onClick={() => !analyzing && quickStart(quickDream)}
                    className={`px-4 py-2 text-[var(--ui-muted-2)] text-sm cursor-pointer hover:text-[var(--ui-accent)] transition-all duration-300 ${
                      analyzing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={!analyzing ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!analyzing ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {quickDream}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* 没有选择大师时的提示 */}
            {!selectedMaster && (
              <div className="flex justify-center mt-4">
                <motion.button 
                  onClick={() => navigate('/settings')}
                  className="bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-[var(--ui-accent-strong)] hover:to-[var(--ui-accent-strong)] transition-all duration-300 shadow-lg hover:shadow-[0_12px_30px_rgba(37,94,234,0.25)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  前往设置选择大师
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* 解梦动画区域 */}
          <AnimatePresence>
            {showLoadingAnimation && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-[var(--ui-text)] mb-6">梦境解析，天机显现</h3>
                  
                  {/* 解梦动画区域 */}
                  <div className="flex justify-center">
                    <div className="bg-[var(--ui-surface-2)] flex items-center justify-center relative overflow-hidden rounded-xl" style={{ width: '560px', height: '315px' }}>
                      <DivinationAnimation symbol="梦" label="解梦" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 大师分析结果 */}
          {analysis && !showLoadingAnimation && (
            <motion.div 
              ref={analysisRef}
              className="p-4"
              style={{ marginTop: '2rem' }}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20rem',
                }}
              >
                <StreamingMarkdown
                  content={analysis}
                  showCursor={analyzing && !analysisComplete}
                  isStreaming={analyzing}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      <ErrorToast
        isVisible={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </motion.div>
  );
};

export default ZhouGongPage; 