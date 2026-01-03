import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Download } from 'lucide-react';
import BaziForm from './components/BaziForm';
import NewLifeKLineChart from './components/NewLifeKLineChart';
import NewAnalysisResult from './components/NewAnalysisResult';
import { generateLifeAnalysis } from './service';
import { isAbortError } from '../../masters/service';
import { useDivinationSession, useUI } from '../../core/store';
import { ErrorToast } from '../../components/common';
import { addRecord } from '../../core/history';
import { useMaster } from '../../core/store';

const LifeKlinePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { error, setError } = useUI();
  const { selectedMaster } = useMaster();
  const { session, setSessionData, setSessionAnalysis, resetSession, stopSession } = useDivinationSession('lifekline');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.data !== result) {
      setResult(session.data);
    }

    const nextAnalyzing = session.analysis.status === 'running';
    if (nextAnalyzing !== isAnalyzing) {
      setIsAnalyzing(nextAnalyzing);
    }
  }, [session, result, isAnalyzing]);

  const handleFormSubmit = async (formData: any) => {
    stopSession('lifekline');
    resetSession('lifekline');

    const controller = new AbortController();
    setSessionAnalysis('lifekline', {
      status: 'running',
      text: '',
      error: null,
      startedAt: Date.now(),
      completedAt: null,
      controller
    });

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisResult = await generateLifeAnalysis(formData, controller.signal);
      setResult(analysisResult);
      setSessionData('lifekline', analysisResult);
      setSessionAnalysis('lifekline', {
        status: 'completed',
        completedAt: Date.now(),
        controller: null
      });

      // Save to history
      addRecord({
        id: `lifekline_${Date.now()}`,
        type: 'lifekline',
        timestamp: Date.now(),
        data: formData,
        master: selectedMaster ? {
          id: selectedMaster.id,
          name: selectedMaster.name,
          description: selectedMaster.description
        } : null,
        analysis: JSON.stringify(analysisResult)
      });
    } catch (err: any) {
      if (isAbortError(err)) {
        setSessionAnalysis('lifekline', {
          status: 'stopped',
          completedAt: Date.now(),
          controller: null
        });
        return;
      }
      const message = err?.message || '推演失败，请检查 API 配置或网络';
      setSessionAnalysis('lifekline', {
        status: 'error',
        error: message,
        completedAt: Date.now(),
        controller: null
      });
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    stopSession('lifekline');
    resetSession('lifekline');
    setResult(null);
    setIsAnalyzing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      className="min-h-screen text-[var(--ui-text)] selection:bg-[var(--ui-accent)]/30 overflow-x-hidden relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-2">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--ui-text)] via-[var(--ui-muted-2)] to-[var(--ui-accent)] bg-clip-text text-transparent"
          >
            人生K线
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--ui-muted-2)] max-w-3xl mx-auto leading-relaxed"
          >
            融合子平八字精粹与现代金融量化思维，为您绘制生命周期的宏观走势与财富命理。
          </motion.p>
        </div>

        {isAnalyzing && !result && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => stopSession('lifekline')}
              className="px-5 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-[var(--ui-danger)] text-sm font-semibold hover:bg-[var(--ui-surface-3)] transition-all"
            >
              停止生成
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <BaziForm onSubmit={handleFormSubmit} isLoading={isAnalyzing} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center bg-[var(--ui-surface-2)] p-4 rounded-2xl border border-[var(--ui-border)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--ui-success)]/20 flex items-center justify-center border border-[var(--ui-success)]/30">
                    <div className="w-2 h-2 bg-[var(--ui-success)] rounded-full animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[var(--ui-text)] block">推演成功</span>
                    <span className="text-[10px] text-[var(--ui-muted)]">已完成</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ui-surface-2)] hover:bg-[var(--ui-surface-3)] text-[var(--ui-muted-2)] hover:text-[var(--ui-text)] rounded-2xl border border-[var(--ui-border)] transition-all text-sm font-semibold"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    重新生成
                  </button>
                </div>
              </div>

              <div className="space-y-16">
                <NewLifeKLineChart data={result.chartData} />
                <NewAnalysisResult analysis={result.analysis} />
              </div>

              <div className="text-center pt-8 pb-32">
                <p className="text-[var(--ui-muted)] text-xs mb-6">AI 推演仅供参考 · 不作为核心决策依据</p>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-[var(--ui-accent)] text-white rounded-2xl font-semibold hover:bg-[var(--ui-accent-strong)] transition-all"
                >
                  <Download className="w-5 h-5" />
                  导出命理报告
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ErrorToast
          isVisible={!!error}
          message={error || ''}
          onClose={() => setError(null)}
        />
      </div>
    </motion.div>
  );
};

export default LifeKlinePage;
