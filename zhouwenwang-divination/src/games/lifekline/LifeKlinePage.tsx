import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Download } from 'lucide-react';
import BaziForm from './components/BaziForm';
import NewLifeKLineChart from './components/NewLifeKLineChart';
import NewAnalysisResult from './components/NewAnalysisResult';
import { generateLifeAnalysis } from './service';
import { useUI } from '../../core/store';
import { ErrorToast } from '../../components/common';
import { addRecord } from '../../core/history';
import { useMaster } from '../../core/store';

const LifeKlinePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { error, setError } = useUI();
  const { selectedMaster } = useMaster();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleFormSubmit = async (formData: any) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisResult = await generateLifeAnalysis(formData);
      setResult(analysisResult);

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
      setError(err.message || "推演失败，请检查 API 配置或网络");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
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
      className="min-h-screen bg-transparent text-[var(--ui-text)] selection:bg-[var(--ui-accent)]/30 overflow-x-hidden relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--ui-accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--ui-accent)]/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[var(--ui-surface-3)] border border-[var(--ui-border)] text-[var(--ui-accent)] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Quantum Fate Intelligence
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-b from-[var(--ui-text)] to-[var(--ui-muted-2)] bg-clip-text text-transparent font-serif tracking-tighter"
          >
            人生<span className="text-[var(--ui-accent)]">K</span>线
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--ui-muted-2)] max-w-2xl mx-auto font-medium leading-relaxed"
          >
            融合子平八字精粹与现代金融量化思维，<br />
            为您绘制生命周期的宏观走势与财富命理。
          </motion.p>
        </div>

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
                    <span className="text-[10px] text-[var(--ui-muted)] uppercase tracking-widest">Analysis Completed</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--ui-surface-3)] hover:bg-[var(--ui-surface-2)] text-[var(--ui-muted-2)] hover:text-[var(--ui-accent)] rounded-2xl border border-[var(--ui-border)] transition-all text-sm font-bold uppercase tracking-widest"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    重新排盘
                  </button>
                </div>
              </div>

              <div className="space-y-16">
                <NewLifeKLineChart data={result.chartData} />
                <NewAnalysisResult analysis={result.analysis} />
              </div>

              <div className="text-center pt-8 pb-32">
                <p className="text-[var(--ui-muted)] text-xs mb-6 uppercase tracking-widest font-black">AI 推演仅供参考 · 不作为核心决策依据</p>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-[var(--ui-accent)] text-white rounded-2xl font-black hover:bg-[var(--ui-accent-strong)] hover:shadow-[0_0_30px_rgba(37,94,234,0.25)] transition-all uppercase tracking-widest"
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
