import React from 'react';
import { ScrollText, Briefcase, Coins, Heart, Activity, Users, Star, Info, Brain, Bitcoin, Compass } from 'lucide-react';
import type { AnalysisData } from '../types';
import LifeKlineMarkdown from './LifeKlineMarkdown';

interface NewAnalysisResultProps {
    analysis: AnalysisData;
}

const ScoreBar = ({ score }: { score: number }) => {
    const normalizedScore = score > 10 ? Math.round(score / 10) : score;

    let colorClass = "bg-[#444444]";
    if (normalizedScore >= 9) colorClass = "bg-[#FF9900]";
    else if (normalizedScore >= 7) colorClass = "bg-orange-400";
    else if (normalizedScore >= 5) colorClass = "bg-yellow-600";
    else if (normalizedScore >= 3) colorClass = "bg-orange-800";
    else colorClass = "bg-red-900";

    return (
        <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-[#222222]">
                <div
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,153,0,0.3)]`}
                    style={{ width: `${normalizedScore * 10}%` }}
                />
            </div>
            <span className="text-[10px] font-black text-[#FF9900] min-w-[2.5rem] text-right uppercase tracking-tighter">
                LV.{normalizedScore}
            </span>
        </div>
    );
};

const Card = ({ title, icon: Icon, content, score, colorClass, extraBadges }: any) => {
    return (
        <div className="bg-[#111111]/80 backdrop-blur-xl p-6 rounded-3xl border border-[#222222] hover:border-[#FF9900]/30 transition-all duration-500 flex flex-col h-full relative overflow-hidden group shadow-xl">
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12">
                <Icon className="w-32 h-32" />
            </div>

            <div className={`flex items-center justify-between mb-6 ${colorClass}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-lg tracking-tight">{title}</h3>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
            </div>

            {extraBadges && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {extraBadges}
                </div>
            )}

            <div className="text-[#888888] text-sm leading-relaxed whitespace-pre-wrap flex-grow font-medium">
                {typeof content === 'string' ? <LifeKlineMarkdown content={content} /> : content}
            </div>

            {typeof score === 'number' && (
                <div className="pt-6 mt-6 border-t border-white/5">
                    <div className="text-[10px] text-[#444444] font-black uppercase tracking-[0.2em] mb-1">Energy Rating</div>
                    <ScoreBar score={score} />
                </div>
            )}
        </div>
    );
};

const NewAnalysisResult: React.FC<NewAnalysisResultProps> = ({ analysis }) => {
    return (
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Bazi Pillars */}
            <div className="flex justify-center gap-6 md:gap-16 bg-[#0f0f0f] p-10 rounded-3xl border border-[#222222] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {analysis.bazi.map((pillar, index) => {
                    const labels = ['年柱', '月柱', '日柱', '时柱'];
                    return (
                        <div key={index} className="text-center min-w-[80px] relative z-10">
                            <div className="text-[10px] text-[#444444] font-black mb-4 uppercase tracking-[0.3em]">{labels[index]}</div>
                            <div className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white to-[#666666] bg-clip-text text-transparent tracking-tighter hover:from-[#FF9900] hover:to-[#FF6B00] transition-all duration-500 cursor-default">
                                {pillar}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-[#111111]/80 backdrop-blur-xl p-10 rounded-3xl border border-[#222222] border-l-[6px] border-l-[#FF9900] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                    <ScrollText className="w-48 h-48" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
                    <h3 className="flex items-center gap-4 font-black text-3xl text-white tracking-tight">
                        <div className="p-3 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/20">
                            <ScrollText className="w-8 h-8 text-[#FF9900]" />
                        </div>
                        命理乾坤总评
                    </h3>
                    <div className="w-full md:w-1/3">
                        <ScoreBar score={analysis.summaryScore} />
                    </div>
                </div>
                <div className="text-[#AAAAAA] leading-relaxed whitespace-pre-wrap text-xl font-medium bg-black/40 p-8 rounded-3xl border border-white/5 relative z-10">
                    <LifeKlineMarkdown content={analysis.summary} />
                </div>
            </div>

            {/* Grid Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                    title="智联交易运势"
                    icon={Bitcoin}
                    content={analysis.crypto}
                    score={analysis.cryptoScore}
                    colorClass="text-[#FF9900]"
                    extraBadges={
                        <>
                            <span className="px-3 py-1 bg-[#FF9900]/10 text-[#FF9900] text-[10px] font-black rounded-full border border-[#FF9900]/20 uppercase tracking-widest">
                                ⚡️ 暴富窗口: {analysis.cryptoYear}
                            </span>
                            <span className="px-3 py-1 bg-white/5 text-[#888888] text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                                💠 核心特质: {analysis.cryptoStyle}
                            </span>
                        </>
                    }
                />

                <Card
                    title="性格解析"
                    icon={Brain}
                    content={analysis.personality}
                    score={analysis.personalityScore}
                    colorClass="text-[#22C55E]"
                />
                <Card
                    title="事业行业"
                    icon={Briefcase}
                    content={analysis.industry}
                    score={analysis.industryScore}
                    colorClass="text-blue-500"
                />
                <Card
                    title="发展风水"
                    icon={Compass}
                    content={analysis.fengShui}
                    score={analysis.fengShuiScore}
                    colorClass="text-cyan-500"
                />
                <Card
                    title="财富层级"
                    icon={Coins}
                    content={analysis.wealth}
                    score={analysis.wealthScore}
                    colorClass="text-amber-500"
                />
                <Card
                    title="婚姻情感"
                    icon={Heart}
                    content={analysis.marriage}
                    score={analysis.marriageScore}
                    colorClass="text-pink-500"
                />
                <Card
                    title="身体健康"
                    icon={Activity}
                    content={analysis.health}
                    score={analysis.healthScore}
                    colorClass="text-emerald-500"
                />
                <Card
                    title="六亲关系"
                    icon={Users}
                    content={analysis.family}
                    score={analysis.familyScore}
                    colorClass="text-purple-500"
                />

                <Card
                    title="推演指南"
                    icon={Info}
                    colorClass="text-[#888888]"
                    content={
                        <div className="space-y-4">
                            <ul className="space-y-2 font-mono text-[11px]">
                                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[#444444]">0-2分</span>
                                    <span className="text-red-900 font-black">极度波动</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[#444444]">3-4分</span>
                                    <span className="text-orange-800 font-black">时运不齐</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[#444444]">5-6分</span>
                                    <span className="text-yellow-700 font-black">中平守势</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[#444444]">7-8分</span>
                                    <span className="text-orange-400 font-black">小有斩获</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[#444444]">9-10分</span>
                                    <span className="text-[#FF9900] font-black">天命所归</span>
                                </li>
                            </ul>
                            <p className="text-[10px] text-[#555555] leading-relaxed border-t border-[#222222] pt-3 text-justify">
                                注：一命二运三风水，四积阴德五读书。本报告仅供娱乐与决策参考，人生之舵终需亲手掌控。
                            </p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewAnalysisResult;
