import React from 'react';
import { ScrollText, Briefcase, Coins, Heart, Activity, Users, Star, Info, Brain, Bitcoin, Compass } from 'lucide-react';
import type { AnalysisData } from '../types';
import LifeKlineMarkdown from './LifeKlineMarkdown';

interface NewAnalysisResultProps {
    analysis: AnalysisData;
}

const getScoreColors = (normalizedScore: number) => {
    if (normalizedScore >= 9) return { bar: 'bg-[var(--ui-success)]', text: 'text-[var(--ui-success)]' };
    if (normalizedScore >= 7) return { bar: 'bg-[var(--ui-accent)]', text: 'text-[var(--ui-accent)]' };
    if (normalizedScore >= 5) return { bar: 'bg-[var(--ui-accent-strong)]', text: 'text-[var(--ui-accent-strong)]' };
    if (normalizedScore >= 3) return { bar: 'bg-[var(--ui-muted)]', text: 'text-[var(--ui-muted)]' };
    return { bar: 'bg-[var(--ui-danger)]', text: 'text-[var(--ui-danger)]' };
};

const ScoreBar = ({ score }: { score: number }) => {
    const normalizedScore = score > 10 ? Math.round(score / 10) : score;
    const colors = getScoreColors(normalizedScore);

    return (
        <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-[var(--ui-surface-3)]/40 rounded-full overflow-hidden border border-[var(--ui-border)]">
                <div
                    className={`h-full ${colors.bar} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,94,234,0.2)]`}
                    style={{ width: `${normalizedScore * 10}%` }}
                />
            </div>
            <span className={`text-[10px] font-black min-w-[2.5rem] text-right uppercase tracking-tighter ${colors.text}`}>
                LV.{normalizedScore}
            </span>
        </div>
    );
};

const Card = ({ title, icon: Icon, content, score, colorClass, extraBadges }: any) => {
    return (
        <div className="bg-[var(--ui-surface-2)]/80 backdrop-blur-xl p-6 rounded-3xl border border-[var(--ui-border)] hover:border-[var(--ui-accent)]/30 transition-all duration-500 flex flex-col h-full relative overflow-hidden group shadow-xl">
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12">
                <Icon className="w-32 h-32" />
            </div>

            <div className={`flex items-center justify-between mb-6 ${colorClass}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--ui-surface-3)]/70 border border-[var(--ui-border)]">
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

            <div className="text-[var(--ui-muted-2)] text-sm leading-relaxed whitespace-pre-wrap flex-grow font-medium">
                {typeof content === 'string' ? <LifeKlineMarkdown content={content} /> : content}
            </div>

            {typeof score === 'number' && (
                <div className="pt-6 mt-6 border-t border-[var(--ui-border)]">
                    <div className="text-[10px] text-[var(--ui-muted)] font-black uppercase tracking-[0.2em] mb-1">Energy Rating</div>
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
            <div className="flex justify-center gap-6 md:gap-16 bg-[var(--ui-surface-2)] p-10 rounded-3xl border border-[var(--ui-border)] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--ui-surface-3)]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {analysis.bazi.map((pillar, index) => {
                    const labels = ['年柱', '月柱', '日柱', '时柱'];
                    return (
                        <div key={index} className="text-center min-w-[80px] relative z-10">
                            <div className="text-[10px] text-[var(--ui-muted)] font-black mb-4 uppercase tracking-[0.3em]">{labels[index]}</div>
                            <div className="text-3xl md:text-5xl font-black bg-gradient-to-b from-[var(--ui-text)] to-[var(--ui-muted-2)] bg-clip-text text-transparent tracking-tighter hover:from-[var(--ui-accent)] hover:to-[var(--ui-accent-strong)] transition-all duration-500 cursor-default">
                                {pillar}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-[var(--ui-surface-2)]/80 backdrop-blur-xl p-10 rounded-3xl border border-[var(--ui-border)] border-l-[6px] border-l-[var(--ui-accent)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                    <ScrollText className="w-48 h-48" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
                    <h3 className="flex items-center gap-4 font-black text-3xl text-[var(--ui-text)] tracking-tight">
                        <div className="p-3 rounded-2xl bg-[var(--ui-accent)]/10 border border-[var(--ui-accent)]/20">
                            <ScrollText className="w-8 h-8 text-[var(--ui-accent)]" />
                        </div>
                        命理乾坤总评
                    </h3>
                    <div className="w-full md:w-1/3">
                        <ScoreBar score={analysis.summaryScore} />
                    </div>
                </div>
                <div className="text-[var(--ui-muted)] leading-relaxed whitespace-pre-wrap text-xl font-medium bg-[var(--ui-surface-3)]/40 p-8 rounded-3xl border border-[var(--ui-border)] relative z-10">
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
                    colorClass="text-[var(--ui-accent)]"
                    extraBadges={
                        <>
                            <span className="px-3 py-1 bg-[var(--ui-accent)]/10 text-[var(--ui-accent)] text-[10px] font-black rounded-full border border-[var(--ui-accent)]/20 uppercase tracking-widest">
                                ⚡️ 暴富窗口: {analysis.cryptoYear}
                            </span>
                            <span className="px-3 py-1 bg-[var(--ui-surface-3)]/60 text-[var(--ui-muted-2)] text-[10px] font-black rounded-full border border-[var(--ui-border)] uppercase tracking-widest">
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
                    colorClass="text-[var(--ui-success)]"
                />
                <Card
                    title="事业行业"
                    icon={Briefcase}
                    content={analysis.industry}
                    score={analysis.industryScore}
                    colorClass="text-[var(--ui-accent)]"
                />
                <Card
                    title="发展风水"
                    icon={Compass}
                    content={analysis.fengShui}
                    score={analysis.fengShuiScore}
                    colorClass="text-[var(--ui-accent-strong)]"
                />
                <Card
                    title="财富层级"
                    icon={Coins}
                    content={analysis.wealth}
                    score={analysis.wealthScore}
                    colorClass="text-[var(--ui-success)]"
                />
                <Card
                    title="婚姻情感"
                    icon={Heart}
                    content={analysis.marriage}
                    score={analysis.marriageScore}
                    colorClass="text-[var(--ui-danger)]"
                />
                <Card
                    title="身体健康"
                    icon={Activity}
                    content={analysis.health}
                    score={analysis.healthScore}
                    colorClass="text-[var(--ui-success)]"
                />
                <Card
                    title="六亲关系"
                    icon={Users}
                    content={analysis.family}
                    score={analysis.familyScore}
                    colorClass="text-[var(--ui-accent)]"
                />

                <Card
                    title="推演指南"
                    icon={Info}
                    colorClass="text-[var(--ui-muted-2)]"
                    content={
                        <div className="space-y-4">
                            <ul className="space-y-2 font-mono text-[11px]">
                                <li className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2">
                                    <span className="text-[var(--ui-muted)]">0-2分</span>
                                    <span className="text-[var(--ui-danger)] font-black">极度波动</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2">
                                    <span className="text-[var(--ui-muted)]">3-4分</span>
                                    <span className="text-[var(--ui-muted)] font-black">时运不齐</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2">
                                    <span className="text-[var(--ui-muted)]">5-6分</span>
                                    <span className="text-[var(--ui-accent-strong)] font-black">中平守势</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-[var(--ui-border)] pb-2">
                                    <span className="text-[var(--ui-muted)]">7-8分</span>
                                    <span className="text-[var(--ui-accent)] font-black">小有斩获</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[var(--ui-muted)]">9-10分</span>
                                    <span className="text-[var(--ui-success)] font-black">天命所归</span>
                                </li>
                            </ul>
                            <p className="text-[10px] text-[var(--ui-muted)] leading-relaxed border-t border-[var(--ui-border)] pt-3 text-justify">
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
