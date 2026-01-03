import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, Clock } from 'lucide-react';
import { 
  generateQiMenChart, 
  formatDateTime, 
  isGoodDoor, 
  isGoodStar,
  type QiMenChartData 
} from './logic';
import { getAIAnalysisStream, isAbortError } from '../../masters/service';
import { addRecord } from '../../core/history';
import { useDivinationSession, useMaster, useUI } from '../../core/store';
import { StreamingMarkdown, ErrorToast, useAutoScroll } from '../../components/common';
import DivinationAnimation from '../../components/DivinationAnimation';
import { getRandomQuestions } from '../../core/quickQuestions';
import type { DivinationRecord } from '../../types';

// 时间处理工具函数
const getBeijingTime = () => {
  // 创建当前时间的 Date 对象，并转换为北京时间
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (8 * 3600000)); // UTC+8
  return beijingTime;
};

const formatDateTimeForInput = (date: Date) => {
  // 直接使用传入的时间进行格式化，假设它已经是北京时间
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const QiMenPage = () => {
  const [chartData, setChartData] = useState<QiMenChartData | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(getBeijingTime());
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [question, setQuestion] = useState<string>('');
  const [hasPerformedDivination, setHasPerformedDivination] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const animationDurationMs = 1800;
  const animationTimeoutRef = useRef<number | null>(null);

  const { selectedMaster } = useMaster();
  const { error, setError } = useUI();
  const navigate = useNavigate();
  const { session, setSessionData, setSessionAnalysis, resetSession, stopSession } = useDivinationSession('qimen');
  
  // 使用通用的自动滚动Hook
  const { contentRef: analysisRef } = useAutoScroll({
    isAnalyzing: isAnalyzing,
    content: aiAnalysis
  });

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.data !== chartData) {
      setChartData(session.data);
    }

    if (session.analysis.text !== aiAnalysis) {
      setAIAnalysis(session.analysis.text);
    }

    const nextAnalyzing = session.analysis.status === 'running';
    if (nextAnalyzing !== isAnalyzing) {
      setIsAnalyzing(nextAnalyzing);
    }

    const nextComplete = session.analysis.status === 'completed';
    if (nextComplete !== analysisComplete) {
      setAnalysisComplete(nextComplete);
    }

    const nextHasPerformed = !!session.data;
    if (nextHasPerformed !== hasPerformedDivination) {
      setHasPerformedDivination(nextHasPerformed);
    }
  }, [session, chartData, aiAnalysis, isAnalyzing, analysisComplete, hasPerformedDivination]);

  // 自动清除错误提示
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 初始化随机问题
  useEffect(() => {
    setQuickQuestions(getRandomQuestions('qimen', 3));
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

  // 初始化时间，但不自动生成盘
  useEffect(() => {
    // 确保使用北京时间进行初始化
    setSelectedTime(getBeijingTime());
  }, []);

  // 快速开始占卜
  const quickStart = async (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
    
    // 稍微延迟一下让用户看到问题填充，然后开始占卜
    setTimeout(() => {
      performDivinationWithQuestion(selectedQuestion);
    }, 200);
  };

  // 动画完成的回调
  const completeGeneration = () => {
    generateChart();
    setIsGenerating(false);
    setHasPerformedDivination(true);
  };

  // 执行起盘（带问题参数）
  const performDivinationWithQuestion = async (questionText: string) => {
    if (!questionText.trim()) {
      setError('请输入您要占卜的问题');
      return;
    }

    setIsGenerating(true);
    setChartData(null);
    setAIAnalysis('');
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setHasPerformedDivination(false);
    stopSession('qimen');
    resetSession('qimen');
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = window.setTimeout(() => {
      completeGeneration();
      animationTimeoutRef.current = null;
    }, animationDurationMs);
  };

  // 执行起盘
  const performDivination = async () => {
    await performDivinationWithQuestion(question);
  };

  const generateChart = () => {
    try {
      const targetTime = useCurrentTime ? getBeijingTime() : selectedTime;
      const chart = generateQiMenChart(targetTime);
      setChartData(chart);
      setSessionData('qimen', chart);
      setAIAnalysis(''); // 清除之前的分析
      

      
      console.log('奇门遁甲起盘成功:', {
        targetTime: targetTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        beijingTime: targetTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        useCurrentTime,
        chart
      });
    } catch (error) {
      console.error('生成奇门盘失败:', error);
      setError('起盘失败，请重试');
    }
  };

  // 处理时间变化
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 将 datetime-local 的值转换为北京时间
    const inputDateTime = e.target.value;
    const localDate = new Date(inputDateTime);
    // 假设用户输入的是北京时间，不需要时区转换
    setSelectedTime(localDate);
    setUseCurrentTime(false);
    // 清理当前盘局，需要重新起盘
    setChartData(null);
    setHasPerformedDivination(false);
    setAIAnalysis('');
    setAnalysisComplete(false);
    stopSession('qimen');
    resetSession('qimen');
  };

  // 处理使用当前时间的变化
  const handleUseCurrentTimeChange = (useNow: boolean) => {
    setUseCurrentTime(useNow);
    if (useNow) {
      setSelectedTime(getBeijingTime());
    }
    // 清理当前盘局，需要重新起盘
    setChartData(null);
    setHasPerformedDivination(false);
    setAIAnalysis('');
    setAnalysisComplete(false);
    stopSession('qimen');
    resetSession('qimen');
  };

  const resetChart = () => {
    stopSession('qimen');
    resetSession('qimen');
    setChartData(null);
    setAIAnalysis('');
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setHasPerformedDivination(false);
  };

  // 获取AI分析（流式处理）
  const getAnalysis = async () => {
    if (!chartData) {
      setError('请先进行起盘');
      return;
    }

    if (!question.trim()) {
      setError('请输入占卜问题');
      return;
    }

    if (!selectedMaster) {
      setError('请先在设置中选择一位大师');
      return;
    }

    const controller = new AbortController();

    setSessionAnalysis('qimen', {
      status: 'running',
      text: '',
      error: null,
      startedAt: Date.now(),
      completedAt: null,
      controller
    });

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);
    setAIAnalysis(''); // 清空之前的分析结果

    try {
      // 准备分析数据
      const analysisData = {
        type: 'qimen',
        question: question.trim(),
        chart: chartData,
        escapeType: chartData.escapeType,
        bureauNumber: chartData.bureauNumber,
        dutyChief: chartData.dutyChief,
        dutyDoor: chartData.dutyDoor,
        keyPoints: chartData.keyPoints,
        timestamp: chartData.timestamp
      };

      console.log('准备发送给AI的奇门数据:', analysisData);

      // 使用流式分析，实时更新结果
      const analysisResult = await getAIAnalysisStream(
        analysisData,
        selectedMaster,
        'qimen',
        undefined,
        (streamText) => {
          setSessionAnalysis('qimen', { text: streamText });
        },
        controller.signal
      );

      // 分析完成
      setAnalysisComplete(true);
      setSessionAnalysis('qimen', {
        status: 'completed',
        completedAt: Date.now(),
        controller: null
      });

      // 保存到历史记录
      const record: DivinationRecord = {
        id: `qimen-${Date.now()}`,
        type: 'qimen',
        timestamp: Date.now(),
        data: analysisData,
        master: {
          id: selectedMaster.id,
          name: selectedMaster.name,
          description: selectedMaster.description
        },
        analysis: analysisResult
      };
      await addRecord(record);

      console.log('奇门遁甲AI分析完成，结果已保存到历史记录');

    } catch (error) {
      if (isAbortError(error)) {
        setSessionAnalysis('qimen', {
          status: 'stopped',
          completedAt: Date.now(),
          controller: null
        });
        return;
      }

      console.error('AI分析失败:', error);
      const message = error instanceof Error ? error.message : '分析过程中发生错误';
      setSessionAnalysis('qimen', {
        status: 'error',
        error: message,
        completedAt: Date.now(),
        controller: null
      });
      setError(message);
      setAnalysisComplete(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取五行颜色
  const getWuxingColor = (wuxing: string) => {
    const colorMap: { [key: string]: string } = {
      '木': '#34d399',
      '火': '#f87171',
      '土': '#d97706',
      '金': '#f5c542',
      '水': '#60a5fa'
    };
    return colorMap[wuxing] || 'var(--ui-muted-2)';
  };

  const getGlowTextStyle = (color: string, glowColor: string = color, intensity: number = 12) => ({
    color,
    textShadow: `0 0 3px ${glowColor}, 0 0 ${intensity}px ${glowColor}`
  });

  const getSoftGlowTextStyle = (color: string, glowColor: string = color) => ({
    color,
    textShadow: `0 0 4px ${glowColor}`
  });

  // 获取宫位的五行属性
  const getPalaceWuxing = (position: number) => {
    const wuxingMap: { [key: number]: string } = {
      1: '水', 2: '土', 3: '木', 4: '木',
      5: '土', 6: '金', 7: '金', 8: '土', 9: '火'
    };
    return wuxingMap[position] || '土';
  };

  // 获取宫位名称（去掉方位信息）
  const getPalaceName = (position: number) => {
    const nameMap: { [key: number]: string } = {
      1: '坎', 2: '坤', 3: '震', 4: '巽',
      5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离'
    };
    return nameMap[position] || '中';
  };

  // 渲染九宫格
  const renderNinePalaces = () => {
    if (!chartData) return null;

    // 按照标准九宫格布局排列
    const layout = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ];

    return (
      <div
        className="grid grid-cols-3 gap-0 max-w-2xl mx-auto"
        style={{
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.65)',
          background: 'rgba(16,16,16,0.8)'
        }}
      >
          {layout.map((row, rowIndex) =>
            row.map((position, colIndex) => {
            const palace = chartData.palaces.find(p => p.position === position);
            if (!palace) return null;

            const hasGoodDoor = isGoodDoor(palace.door);
            const hasGoodStar = isGoodStar(palace.star);
            const isExcellentPosition = hasGoodDoor && hasGoodStar;
            const isGoodPosition = hasGoodDoor || hasGoodStar;
            
            const palaceName = getPalaceName(position);
            const wuxing = getPalaceWuxing(position);
            const wuxingColor = getWuxingColor(wuxing);
            const wuxingGlowColor = wuxingColor.startsWith('#')
              ? `${wuxingColor}66`
              : 'rgba(255,255,255,0.3)';
            const panelGlow = isExcellentPosition
              ? '0 0 12px rgba(255,255,255,0.06), inset 0 0 10px rgba(255,255,255,0.05)'
              : isGoodPosition
                ? '0 0 10px rgba(255,255,255,0.04), inset 0 0 8px rgba(255,255,255,0.03)'
                : 'inset 0 0 8px rgba(255,255,255,0.02)';

            return (
              <motion.div
                key={position}
                className={`
                  aspect-square p-2 border transition-all duration-300 relative overflow-hidden
                `}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  position: 'relative',
                  transition: `all 0.3s ease`,
                  transitionDelay: `${(rowIndex * 3 + colIndex) * 0.05}s`,
                  borderColor: 'rgba(255,255,255,0.2)',
                  background: palace.isCenter
                    ? 'linear-gradient(160deg, rgba(42,32,18,0.88), rgba(12,10,8,0.98))'
                    : 'linear-gradient(160deg, rgba(26,26,26,0.92), rgba(10,10,10,0.98))',
                  boxShadow: panelGlow
                }}
              >
                <div 
                  className="flex flex-col justify-between"
                  style={{ height: '90%', padding: '8px' }}
                >
                  
                  {/* 顶部：八神（小字，居中） */}
                  <div className="text-center" style={{ minHeight: '20px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        ...getSoftGlowTextStyle('rgba(232,236,243,0.75)', 'rgba(255,255,255,0.25)')
                      }}
                    >
                      {palace.deity}
                    </span>
                  </div>

                  {/* 主体布局：左侧信息 + 右侧宫位名和五行 */}
                  <div 
                    className="flex items-center justify-between"
                    style={{ paddingLeft: '4px', paddingRight: '16px' }}
                  >
                    
                    {/* 左侧：垂直排列信息 */}
                    <div 
                      className="flex flex-col items-start justify-center"
                      style={{ gap: '8px', minWidth: '80px', maxWidth: '80px' }}
                    >
                      {/* 天盘天干（中等大小，突出） */}
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          letterSpacing: '1px',
                          lineHeight: '1',
                          ...getSoftGlowTextStyle('#f1f5f9', 'rgba(248,250,252,0.35)')
                        }}
                      >
                        {palace.heavenStem}
                      </div>
                      
                      {/* 九星（中字，颜色区分） */}
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          lineHeight: '1.1',
                          whiteSpace: 'nowrap',
                          ...(isGoodStar(palace.star)
                            ? getSoftGlowTextStyle('#7dd3fc', 'rgba(125,211,252,0.35)')
                            : getSoftGlowTextStyle('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.2)'))
                        }}
                      >
                        {palace.star}
                      </div>
                      
                      {/* 八门（中字，颜色区分） */}
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          lineHeight: '1.1',
                          whiteSpace: 'nowrap',
                          ...(isGoodDoor(palace.door)
                            ? getSoftGlowTextStyle('#fca5a5', 'rgba(252,165,165,0.35)')
                            : getSoftGlowTextStyle('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.2)'))
                        }}
                      >
                        {palace.door}
                      </div>
                    </div>

                    {/* 右侧：宫位名 + 五行 */}
                    <div 
                      className="flex flex-col justify-center"
                      style={{ marginLeft: '8px', flex: '1', alignItems: 'center', paddingRight: '20px', marginTop: '12px' }}
                    >
                      {/* 宫位名称（特大字，艺术效果） */}
                      <div
                        style={{
                          fontSize: '48px',
                          fontWeight: '900',
                          fontFamily: '"Noto Serif SC", "STKaiti", "STSong", serif',
                          letterSpacing: '2px',
                          lineHeight: '1',
                          marginBottom: '8px',
                          textAlign: 'center',
                          ...getGlowTextStyle(wuxingColor, wuxingGlowColor, 22)
                        }}
                      >
                        {palaceName}
                      </div>
                      
                      {/* 五行标识（小而精致） */}
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: wuxingColor,
                          backgroundColor: 'rgba(8,8,8,0.6)',
                          border: `1.5px solid ${wuxingColor}`,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          boxShadow: `0 0 8px ${wuxingGlowColor}, inset 0 0 4px ${wuxingGlowColor}`
                        }}
                      >
                        {wuxing}
                      </div>
                    </div>

                  </div>

                  {/* 底部：地盘天干 */}
                  <div className="text-left">
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        ...getSoftGlowTextStyle('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.2)')
                      }}
                    >
                      {palace.earthStem}
                    </span>
                  </div>
                </div>


              </motion.div>
            );
          })
        )}
      </div>
    );
  };

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
            奇门遁甲
          </h1>
          <p className="text-xl text-[var(--ui-muted-2)] max-w-3xl mx-auto leading-relaxed">
            古代最高层次的预测学，以时间、空间、人和为三要素，探寻吉凶祸福的运行规律
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* 问题输入区域 */}
          <motion.div 
            className="p-8"
            variants={itemVariants}
          >
            <motion.div variants={itemVariants}>
              
              {/* 输入框和按钮水平排列 - 居中 */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <motion.input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="您想算点什么？"
                  className="w-[300px] h-[46px] px-6 py-3 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] rounded-xl !text-[var(--ui-text)] !text-lg !font-bold placeholder:!text-[var(--ui-muted-2)] focus:border-[var(--ui-accent)] focus:outline-none transition-all duration-300"
                  style={{ 
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--ui-border)',
                    borderRadius: '12px',
                    height: '46px'
                  }}
                  whileFocus={{ scale: 1.01 }}
                  disabled={isGenerating}
                />
                <motion.button 
                  onClick={performDivination}
                  disabled={isGenerating || !question.trim()}
                  className={`px-8 py-3 h-[46px] rounded-xl font-bold text-lg transition-all duration-300 shadow-lg whitespace-nowrap flex items-center justify-center ${
                    isGenerating || !question.trim()
                      ? 'bg-[var(--ui-muted)] text-[var(--ui-muted-2)] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] text-white hover:from-[var(--ui-accent-strong)] hover:to-[var(--ui-accent-strong)] hover:shadow-xl hover:shadow-[0_12px_30px_rgba(37,94,234,0.25)]'
                  }`}
                  whileHover={!isGenerating && question.trim() ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isGenerating && question.trim() ? { scale: 0.98 } : {}}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      正在起盘...
                    </span>
                  ) : (
                    '开始起盘'
                  )}
                </motion.button>
              </div>

              {/* 快速开始水平布局 - 居中 */}
              <div className="flex justify-center items-center gap-3 mb-8">
                <h4 className="text-lg font-medium text-[var(--ui-text)] whitespace-nowrap">快速开始：</h4>
                <div className="flex flex-wrap gap-4">
                  {quickQuestions.map((quickQuestion, index) => (
                    <motion.span
                      key={index}
                      onClick={() => !isGenerating && quickStart(quickQuestion)}
                      className={`px-4 py-2 text-[var(--ui-muted-2)] text-sm cursor-pointer hover:text-[var(--ui-accent)] transition-all duration-300 ${
                        isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      whileHover={!isGenerating ? { scale: 1.05, y: -2 } : {}}
                      whileTap={!isGenerating ? { scale: 0.98 } : {}}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {quickQuestion}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* 时间选择区域 - 简洁版本 */}
              <div className="flex justify-center items-center gap-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[var(--ui-accent)]" />
                  <h4 className="text-lg font-medium text-[var(--ui-text)] whitespace-nowrap">起盘时间：</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useCurrentTime}
                      onChange={() => handleUseCurrentTimeChange(true)}
                      className="text-[var(--ui-accent)] focus:ring-[var(--ui-accent)]"
                      disabled={isGenerating}
                    />
                    <span className="text-[var(--ui-muted-2)]">当前时间</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useCurrentTime}
                      onChange={() => handleUseCurrentTimeChange(false)}
                      className="text-[var(--ui-accent)] focus:ring-[var(--ui-accent)]"
                      disabled={isGenerating}
                    />
                    <span className="text-[var(--ui-muted-2)]">选择时间</span>
                  </label>
                  
                  {!useCurrentTime && (
                    <motion.input
                      type="datetime-local"
                      value={formatDateTimeForInput(selectedTime)}
                      onChange={handleTimeChange}
                      className="bg-[var(--ui-surface-2)] border border-black rounded-lg px-3 py-2 text-[var(--ui-text)] text-base focus:border-[var(--ui-accent)] focus:outline-none [&::-webkit-datetime-edit]:text-[var(--ui-text)] [&::-webkit-datetime-edit-text]:text-[var(--ui-text)] [&::-webkit-datetime-edit-month-field]:text-[var(--ui-text)] [&::-webkit-datetime-edit-day-field]:text-[var(--ui-text)] [&::-webkit-datetime-edit-year-field]:text-[var(--ui-text)] [&::-webkit-datetime-edit-hour-field]:text-[var(--ui-text)] [&::-webkit-datetime-edit-minute-field]:text-[var(--ui-text)] [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
                      style={{
                        colorScheme: 'dark',
                        color: 'white !important',
                        WebkitTextFillColor: 'white',
                        minHeight: '36px',
                        height: '36px',
                        lineHeight: '1.4',
                        fontSize: '16px',
                        marginLeft: '5px'
                      }}
                      disabled={isGenerating}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 起盘动画区域 */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-[var(--ui-text)] mb-6">奇门起盘，时空定局</h3>
                  
                  {/* 起盘动画区域 */}
                  <div className="flex justify-center">
                    <div className="bg-[var(--ui-surface-2)] flex items-center justify-center relative overflow-hidden rounded-xl" style={{ width: '560px', height: '315px' }}>
                      <DivinationAnimation symbol="遁" label="奇门" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 奇门盘结果显示 */}
          {chartData && !isGenerating && hasPerformedDivination && (
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 与视频相同尺寸的奇门盘显示容器 */}
              <div className="flex justify-center">
                <div style={{ width: '560px', minHeight: '315px' }}>
                  {/* 基本信息条 */}
                  <motion.div 
                    style={{
                      background: 'var(--ui-surface-2)',
                      border: '1px solid var(--ui-border)',
                      padding: '20px 24px',
                      borderRadius: '12px 12px 0 0'
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '32px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: 'var(--ui-muted-2)', fontSize: '14px', fontWeight: '500' }}>时间</div>
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap' }}>{formatDateTime(chartData)}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: 'var(--ui-muted-2)', fontSize: '14px', fontWeight: '500' }}>遁甲</div>
                        <div style={{ color: 'var(--ui-accent)', fontSize: '16px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {chartData.escapeType === 'yang' ? '阳' : '阴'}遁{chartData.bureauNumber}局
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: 'var(--ui-muted-2)', fontSize: '14px', fontWeight: '500' }}>值符</div>
                        <div style={{ color: 'var(--ui-accent)', fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap' }}>{chartData.dutyChief}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: 'var(--ui-muted-2)', fontSize: '14px', fontWeight: '500' }}>值使</div>
                        <div style={{ color: 'var(--ui-success)', fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap' }}>{chartData.dutyDoor}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 奇门盘主体 - 深色卡片 */}
                  <motion.div 
                    className="bg-[var(--ui-surface-2)] border border-[var(--ui-border)] p-6 flex flex-col"
                    style={{ 
                      minHeight: '400px',
                      borderRadius: '0 0 16px 16px',
                      overflow: 'hidden'
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* 九宫图 */}
                    <div className="flex-1 overflow-hidden mb-4">
                      <h4 className="text-lg font-medium text-[var(--ui-text)] mb-4 text-center">九宫布局</h4>
                      <div className="flex justify-center">
                        {renderNinePalaces()}
                      </div>
                    </div>

                    {/* 大师分析按钮 - 底部固定 */}
                    <div style={{ margin: '15px' }}>
                      <motion.button 
                        onClick={getAnalysis}
                        disabled={isAnalyzing || !selectedMaster || analysisComplete}
                        className={`w-full px-4 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center ${
                          isAnalyzing || !selectedMaster || analysisComplete
                            ? 'bg-[var(--ui-muted)] cursor-not-allowed'
                            : 'bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] hover:from-[var(--ui-accent-strong)] hover:to-[var(--ui-accent-strong)] hover:shadow-xl hover:shadow-[0_12px_30px_rgba(37,94,234,0.25)]'
                        }`}
                        style={{
                          color: isAnalyzing || !selectedMaster || analysisComplete ? 'var(--ui-muted-2)' : 'var(--ui-text)'
                        }}
                        whileHover={!isAnalyzing && selectedMaster && !analysisComplete ? { scale: 1.02 } : {}}
                        whileTap={!isAnalyzing && selectedMaster && !analysisComplete ? { scale: 0.98 } : {}}
                      >
                        {isAnalyzing ? (
                          <span 
                            className="flex items-center justify-center gap-3"
                            style={{ color: 'var(--ui-muted-2)' }}
                          >
                            <div 
                              className="animate-spin rounded-full h-4 w-4 border-b-2"
                              style={{ borderColor: 'var(--ui-muted-2)' }}
                            ></div>
                            <span style={{ color: 'var(--ui-muted-2)' }}>
                              {aiAnalysis ? `${selectedMaster?.name}正在分析...` : `${selectedMaster?.name}解盘中...`}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: isAnalyzing || !selectedMaster || analysisComplete ? 'var(--ui-muted-2)' : 'var(--ui-text)' }}>
                            {analysisComplete ? `${selectedMaster?.name}解盘完成` : '大师解盘'}
                          </span>
                        )}
                      </motion.button>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {chartData && !isAnalyzing && (
                          <motion.button
                            onClick={resetChart}
                            className="flex-1 px-4 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-[var(--ui-text)] text-sm font-semibold hover:bg-[var(--ui-surface-3)] transition-all flex items-center justify-center"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            重新生成
                          </motion.button>
                        )}
                        {isAnalyzing && (
                          <motion.button
                            onClick={() => stopSession('qimen')}
                            className="flex-1 px-4 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-[var(--ui-danger)] text-sm font-semibold hover:bg-[var(--ui-surface-3)] transition-all flex items-center justify-center"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            停止生成
                          </motion.button>
                        )}
                      </div>

                      {!selectedMaster && (
                        <motion.button 
                          onClick={() => navigate('/settings')}
                          className="w-full mt-2 bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] text-white px-4 py-3 rounded-xl font-bold text-sm hover:from-[var(--ui-accent-strong)] hover:to-[var(--ui-accent-strong)] transition-all duration-300 shadow-lg hover:shadow-[0_12px_30px_rgba(37,94,234,0.25)] flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          前往设置选择大师
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 大师分析结果 */}
          {aiAnalysis && (
            <motion.div 
              ref={analysisRef}
              className="p-4"
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
                  content={aiAnalysis}
                  showCursor={isAnalyzing && !analysisComplete}
                  isStreaming={isAnalyzing}
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

export default QiMenPage;
