import React from 'react';
import type { KLinePoint } from '../types';
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Label,
    LabelList
} from 'recharts';

interface NewLifeKLineChartProps {
    data: KLinePoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as KLinePoint;
        const isUp = data.close >= data.open;
        return (
            <div className="bg-[#111111]/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-[#333333] z-50 w-[300px] md:w-[350px]">
                <div className="flex justify-between items-start mb-3 border-b border-[#222222] pb-3">
                    <div>
                        <p className="text-xl font-bold text-white font-serif">
                            {data.year} {data.ganZhi}年 <span className="text-sm text-[#888888] font-sans">({data.age}岁)</span>
                        </p>
                        <p className="text-sm text-[#FF9900] font-medium mt-1">
                            大运：{data.daYun || '未知'}
                        </p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'bg-red-500/20 text-red-500'}`}>
                        {isUp ? '吉 ▲' : '凶 ▼'}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] text-[#888888] mb-4 bg-[#1A1A1A] p-2 rounded-xl">
                    <div className="text-center">
                        <span className="block opacity-60">开盘</span>
                        <span className="font-mono text-[#CCCCCC] font-bold">{data.open}</span>
                    </div>
                    <div className="text-center">
                        <span className="block opacity-60">收盘</span>
                        <span className="font-mono text-[#CCCCCC] font-bold">{data.close}</span>
                    </div>
                    <div className="text-center">
                        <span className="block opacity-60">最高</span>
                        <span className="font-mono text-[#CCCCCC] font-bold">{data.high}</span>
                    </div>
                    <div className="text-center">
                        <span className="block opacity-60">最低</span>
                        <span className="font-mono text-[#CCCCCC] font-bold">{data.low}</span>
                    </div>
                </div>

                <div className="text-sm text-[#CCCCCC] leading-relaxed text-justify max-h-[150px] overflow-y-auto custom-scrollbar italic font-serif">
                    "{data.reason}"
                </div>
            </div>
        );
    }
    return null;
};

const CandleShape = (props: any) => {
    const { x, y, width, height, payload, yAxis } = props;

    const isUp = payload.close >= payload.open;
    const color = isUp ? '#22c55e' : '#ef4444';
    const strokeColor = isUp ? '#166534' : '#991b1b';

    let highY = y;
    let lowY = y + height;

    if (yAxis && typeof yAxis.scale === 'function') {
        try {
            highY = yAxis.scale(payload.high);
            lowY = yAxis.scale(payload.low);
        } catch (e) {
            highY = y;
            lowY = y + height;
        }
    }

    const center = x + width / 2;
    const renderHeight = height < 2 ? 2 : height;

    return (
        <g>
            <line x1={center} y1={highY} x2={center} y2={lowY} stroke={color} strokeWidth={1} />
            <rect
                x={x}
                y={y}
                width={width}
                height={renderHeight}
                fill={color}
                fillOpacity={0.8}
                stroke={strokeColor}
                strokeWidth={1}
                rx={1}
            />
        </g>
    );
};

const PeakLabel = (props: any) => {
    const { x, y, width, value, maxHigh } = props;
    if (value !== maxHigh) return null;

    return (
        <g>
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                transform={`translate(${x + width / 2 - 8}, ${y - 28}) scale(0.6)`}
                fill="#F59E0B"
                className="animate-pulse"
            />
            <text
                x={x + width / 2}
                y={y - 32}
                fill="#F59E0B"
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
            >
                人生巅峰
            </text>
        </g>
    );
};

const NewLifeKLineChart: React.FC<NewLifeKLineChartProps> = ({ data }) => {
    const transformedData = data.map(d => ({
        ...d,
        bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
        labelPoint: d.high
    }));

    const daYunChanges = data.filter((d, i) => {
        if (i === 0) return true;
        return d.daYun !== data[i - 1].daYun;
    });

    const maxHigh = data.length > 0 ? Math.max(...data.map(d => d.high)) : 100;

    if (!data || data.length === 0) {
        return <div className="h-[500px] flex items-center justify-center text-[#444444]">无推演数据</div>;
    }

    return (
        <div className="w-full h-[600px] bg-[#0A0A0A] p-4 md:p-8 rounded-2xl border border-[#222222] shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent" />

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-white font-serif mb-1">人生流年大运走势图</h3>
                    <p className="text-xs text-[#666666]">基于虚岁 1-100 年的量化分析</p>
                </div>
                <div className="flex gap-4 text-[10px] font-medium">
                    <span className="flex items-center text-[#FF9900] bg-[#FF9900]/10 px-2 py-1 rounded-full border border-[#FF9900]/20 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-[#FF9900] mr-2 rounded-full shadow-[0_0_8px_#FF9900]" /> 吉运 (UP)
                    </span>
                    <span className="flex items-center text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-red-500 mr-2 rounded-full shadow-[0_0_8px_#ef4444]" /> 凶运 (DOWN)
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={transformedData} margin={{ top: 40, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />

                    <XAxis
                        dataKey="age"
                        tick={{ fontSize: 11, fill: '#444444' }}
                        interval={9}
                        axisLine={{ stroke: '#222222' }}
                        tickLine={false}
                    />

                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#444444' }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    {daYunChanges.map((point, index) => (
                        <ReferenceLine
                            key={`dayun-${index}`}
                            x={point.age}
                            stroke="#222222"
                            strokeDasharray="3 3"
                        >
                            <Label
                                value={point.daYun}
                                position="top"
                                fill="#FF9900"
                                fontSize={10}
                                fontWeight="bold"
                                className="opacity-60"
                            />
                        </ReferenceLine>
                    ))}

                    <Bar
                        dataKey="bodyRange"
                        shape={<CandleShape />}
                        isAnimationActive={true}
                        animationDuration={2000}
                    >
                        <LabelList
                            dataKey="high"
                            position="top"
                            content={<PeakLabel maxHigh={maxHigh} />}
                        />
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default NewLifeKLineChart;
