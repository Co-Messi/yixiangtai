import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { getFourPillarsGanZhi, GANZHI_CYCLE, getSolarTerm, TIANGAN } from '../../../utils/ganzhiUtils';

interface BaziFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

const BaziForm: React.FC<BaziFormProps> = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        gender: '男' as '男' | '女',
        birthTime: '1990-01-01T12:00',
        birthYear: 1990,
        yearPillar: '',
        monthPillar: '',
        dayPillar: '',
        hourPillar: '',
        startAge: '6',
        firstDaYun: '',
        luckStartDate: '',
        provider: 'gemini' as 'gemini' | 'openai',
    });

    const calculatePillars = (dateTimeStr: string, gender: '男' | '女') => {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return;

        const pillars = getFourPillarsGanZhi(date, 'traditional'); // 传统子平：23点后换天

        // Calculate Start Age and Direction
        const yearStem = pillars.year.charAt(0);
        const yangStems = ['甲', '丙', '戊', '庚', '壬'];
        const isYangYear = yangStems.includes(yearStem);
        const isForward = (gender === '男' && isYangYear) || (gender === '女' && !isYangYear);

        // Find relevant Jie Terms
        const year = date.getFullYear();
        const jieIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
        let targetJie: Date | null = null;

        // Find previous and next Jie
        let allJies: Date[] = [];
        for (let y = year - 1; y <= year + 1; y++) {
            jieIndices.forEach(idx => allJies.push(getSolarTerm(y, idx)));
        }
        allJies.sort((a, b) => a.getTime() - b.getTime());

        let prevJie = allJies[0];
        let nextJie = allJies[allJies.length - 1];
        for (let i = 0; i < allJies.length - 1; i++) {
            if (date >= allJies[i] && date < allJies[i + 1]) {
                prevJie = allJies[i];
                nextJie = allJies[i + 1];
                break;
            }
        }

        targetJie = isForward ? nextJie : prevJie;
        const diffMs = Math.abs(date.getTime() - targetJie.getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // 3 days = 1 year, 1 day = 4 months, 1 hour = 5 days, 1 min = 2 hours
        const startAge = Math.max(1, Math.round(diffDays / 3));

        // Accurate Start Luck Date
        const luckStartDate = new Date(date.getTime() + diffDays * (10 / 3) * 365.25 * 24 * 60 * 60 * 1000 / 10);
        // Simple formula: 3 days -> 1 year. So luck starts after (diffDays * (365.25 / 3)) days? No.
        // Rule: Start Date = BirthDate + (diffDays / 3) years.
        const luckStartDateExact = new Date(date.getTime());
        luckStartDateExact.setDate(date.getDate() + Math.floor(diffDays / 3 * 365.25));

        // Calculate First Da Yun
        const monthPillar = pillars.month;
        const monthIndex = GANZHI_CYCLE.indexOf(monthPillar as any);
        let firstDaYun = '';
        if (monthIndex !== -1) {
            const nextIndex = isForward
                ? (monthIndex + 1) % 60
                : (monthIndex - 1 + 60) % 60;
            firstDaYun = GANZHI_CYCLE[nextIndex];
        }

        setFormData(prev => ({
            ...prev,
            birthYear: date.getFullYear(),
            yearPillar: pillars.year,
            monthPillar: pillars.month,
            dayPillar: pillars.day,
            hourPillar: pillars.hour,
            startAge: startAge.toString(),
            luckStartDate: luckStartDateExact.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            firstDaYun: firstDaYun
        }));
    };

    useEffect(() => {
        calculatePillars(formData.birthTime, formData.gender);
    }, [formData.birthTime, formData.gender]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const daYunDirectionInfo = useMemo(() => {
        if (!formData.yearPillar) return '等待输入年柱...';

        const firstChar = formData.yearPillar.trim().charAt(0);
        const yinStems = ['乙', '丁', '己', '辛', '癸'];

        let isYangYear = true;
        if (yinStems.includes(firstChar)) isYangYear = false;

        let isForward = false;
        if (formData.gender === '男') {
            isForward = isYangYear;
        } else {
            isForward = !isYangYear;
        }

        return isForward ? '顺行 (阳男/阴女)' : '逆行 (阴男/阳女)';
    }, [formData.yearPillar, formData.gender]);

    const selectionPreview = useMemo(() => {
        const date = new Date(formData.birthTime);
        if (isNaN(date.getTime())) return null;
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            isNightZi: date.getHours() >= 23
        };
    }, [formData.birthTime]);

    return (

        <div className="w-full max-w-2xl mx-auto bg-[var(--ui-surface-2)]/80 backdrop-blur-xl p-8 rounded-3xl border border-[var(--ui-border)] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[var(--ui-text)] to-[var(--ui-muted-2)] bg-clip-text text-transparent mb-3">精准八字排盘</h2>
                <p className="text-[var(--ui-muted-2)] text-sm uppercase tracking-[0.2em]">Fate Analysis & Life K-Line</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name, Gender & Provider */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--ui-muted-2)] ml-1">姓名 (可选)</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] text-[var(--ui-text)] rounded-2xl focus:border-[var(--ui-accent)] outline-none transition-all placeholder:text-[var(--ui-muted-2)] text-lg"
                                placeholder="输入姓名以生成报告"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--ui-muted-2)] ml-1">AI 推演服务商</label>
                            <div className="flex bg-[var(--ui-surface-2)] rounded-2xl p-1.5 border-2 border-[var(--ui-border)] h-[64px]">
                                {(['gemini', 'openai'] as const).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, provider: p })}
                                        className={`flex-1 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest ${formData.provider === p
                                            ? 'bg-[var(--ui-accent)] text-white shadow-lg'
                                            : 'text-[var(--ui-muted)] hover:text-[var(--ui-muted-2)]'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--ui-muted-2)] ml-1">性别 (决定大运方向)</label>
                        <div className="flex bg-[var(--ui-surface-2)] rounded-2xl p-1.5 border-2 border-[var(--ui-border)] h-[136px] flex-col gap-1.5">
                            {(['男', '女'] as const).map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 rounded-xl text-lg font-bold transition-all duration-300 ${formData.gender === g
                                        ? 'bg-[var(--ui-accent)] text-white shadow-[0_0_20px_rgba(37,94,234,0.35)]'
                                        : 'text-[var(--ui-muted)] hover:text-[var(--ui-muted-2)]'
                                        }`}
                                >
                                    {g === '男' ? '乾造 (男)' : '坤造 (女)'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Four Pillars */}
                <div className="bg-[var(--ui-surface-2)]/50 p-8 rounded-3xl border border-[var(--ui-border)] space-y-6">
                    <div className="flex items-center gap-3 text-[var(--ui-accent)] text-sm font-black uppercase tracking-widest mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span>四柱干支 (自动计算)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-xs font-bold text-[var(--ui-muted)] ml-1 uppercase tracking-widest flex justify-between items-center">
                                <span>出生日期及精确时间 (公历)</span>
                                <span className="text-[10px] text-[var(--ui-accent)]/50 font-black">DD / MM / YYYY</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="datetime-local"
                                    name="birthTime"
                                    required
                                    value={formData.birthTime}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] group-hover:border-[var(--ui-border)] text-[var(--ui-text)] rounded-2xl focus:border-[var(--ui-accent)] outline-none font-bold text-lg transition-all"
                                />
                                <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ui-muted-2)] group-hover:text-[var(--ui-accent)] transition-colors" />
                            </div>
                            {selectionPreview && (
                                <div className="flex flex-wrap gap-3 px-4 py-2 bg-[var(--ui-accent)]/5 rounded-xl border border-[var(--ui-accent)]/10 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-[var(--ui-accent)] uppercase">Year</span>
                                        <span className="text-sm font-bold text-[var(--ui-text)]">{selectionPreview.year}年</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-[var(--ui-border)] self-center" />
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-[var(--ui-accent)] uppercase">Month</span>
                                        <span className="text-sm font-bold text-[var(--ui-text)]">{selectionPreview.month}月</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-[var(--ui-border)] self-center" />
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-[var(--ui-accent)] uppercase">Day</span>
                                        <span className="text-sm font-bold text-[var(--ui-text)]">{selectionPreview.day}日</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-[var(--ui-border)] self-center" />
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-[var(--ui-accent)] uppercase">Time</span>
                                        <span className="text-sm font-bold text-[var(--ui-text)]">{selectionPreview.hour}:{selectionPreview.minute.toString().padStart(2, '0')}</span>
                                    </div>

                                </div>
                            )}
                            <div className="text-[10px] text-[var(--ui-muted-2)] font-bold uppercase tracking-widest mt-2">
                                排盘规则：传统子平（23:00后换日）
                            </div>
                        </div>

                        {(['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'] as const).map(p => (
                            <div key={p} className="space-y-1.5">
                                <label className="block text-[11px] font-black text-[var(--ui-muted-2)] uppercase tracking-[0.2em] ml-1 mb-1">
                                    {p === 'yearPillar' ? (
                                        <span className="flex justify-between">
                                            <span>YEAR 年柱</span>
                                            <span className="text-[9px] opacity-50">属相基准</span>
                                        </span>
                                    ) : p === 'monthPillar' ? (
                                        <span className="flex justify-between">
                                            <span>MONTH 月柱</span>
                                            <span className="text-[9px] opacity-70 text-[var(--ui-accent)]">依据节气</span>
                                        </span>
                                    ) : p === 'dayPillar' ? (
                                        <span className="flex justify-between">
                                            <span>DAY 日柱</span>
                                            <span className="text-[9px] opacity-70 text-[var(--ui-accent)]">核心元神</span>
                                        </span>
                                    ) : (
                                        <span className="flex justify-between">
                                            <span>HOUR 时柱</span>
                                            <span className="text-[9px] opacity-50">归宿之位</span>
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    name={p}
                                    required
                                    readOnly
                                    value={formData[p as keyof typeof formData] as string}
                                    placeholder="..."
                                    className="w-full px-4 py-4 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] text-[var(--ui-accent)] rounded-2xl text-center font-black text-2xl shadow-inner cursor-default"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Da Yun */}
                <div className="bg-[var(--ui-surface-2)]/50 p-8 rounded-3xl border border-[var(--ui-border)] space-y-6">
                    <div className="flex items-center gap-3 text-[var(--ui-accent)] text-sm font-black uppercase tracking-widest mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>大运推演 (智能估算)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-[var(--ui-muted)] uppercase tracking-widest ml-1">起运年龄</label>
                            <input
                                type="number"
                                name="startAge"
                                required
                                min="1"
                                max="11"
                                value={formData.startAge}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] text-[var(--ui-text)] rounded-2xl focus:border-[var(--ui-accent)] outline-none text-center font-black text-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-[var(--ui-muted)] uppercase tracking-widest ml-1">首步大运</label>
                            <input
                                type="text"
                                name="firstDaYun"
                                required
                                value={formData.firstDaYun}
                                onChange={handleChange}
                                placeholder="..."
                                className="w-full px-6 py-4 bg-[var(--ui-surface-2)] border-2 border-[var(--ui-border)] text-[var(--ui-accent)] rounded-2xl text-center font-black text-2xl"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                        <div className="bg-[var(--ui-surface-2)] py-2 px-4 rounded-full border border-[var(--ui-border)] inline-block w-fit">
                            <p className="text-[10px] text-[var(--ui-muted)] font-bold uppercase tracking-wider">
                                阴阳顺逆：<span className="text-[var(--ui-accent)]">{daYunDirectionInfo}</span>
                            </p>
                        </div>
                        {formData.luckStartDate && (
                            <div className="bg-[var(--ui-accent)]/10 py-2 px-4 rounded-full border border-[var(--ui-accent)]/20 inline-block w-fit">
                                <p className="text-[10px] text-[var(--ui-accent)] font-black uppercase tracking-wider">
                                    起运日期：<span className="text-[var(--ui-text)]">{formData.luckStartDate} (约{formData.startAge}岁)</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group ${isLoading
                        ? 'bg-[var(--ui-surface-2)] text-[var(--ui-muted)] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[var(--ui-accent)] to-[var(--ui-accent-strong)] text-white hover:shadow-[0_0_30px_rgba(37,94,234,0.35)] hover:scale-[1.01] active:scale-[0.99]'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin h-6 w-6" />
                            <span>天机推演中...</span>
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[var(--ui-surface)]/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                            <Sparkles className="h-6 w-6" />
                            <span>推演百年命理K线</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BaziForm;
