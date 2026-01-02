import { QimenChart } from '3meta';

// 九宫位置定义（洛书排列）
export const NINE_PALACES = [
  { position: 4, name: '四宫（巽）', direction: '东南' },
  { position: 9, name: '九宫（离）', direction: '南' },
  { position: 2, name: '二宫（坤）', direction: '西南' },
  { position: 3, name: '三宫（震）', direction: '东' },
  { position: 5, name: '五宫（中）', direction: '中央' },
  { position: 7, name: '七宫（兑）', direction: '西' },
  { position: 8, name: '八宫（艮）', direction: '东北' },
  { position: 1, name: '一宫（坎）', direction: '北' },
  { position: 6, name: '六宫（乾）', direction: '西北' }
] as const;

/**
 * 单个宫位的数据结构
 */
export interface PalaceData {
  position: number;        // 宫位号码（1-9）
  name: string;           // 宫位名称
  direction: string;      // 方位
  earthStem: string;      // 地盘天干
  heavenStem: string;     // 天盘天干
  star: string;           // 九星
  door: string;           // 八门
  deity: string;          // 八神
  isCenter: boolean;      // 是否为中宫
}

/**
 * 奇门遁甲盘数据结构
 */
export interface QiMenChartData {
  id: string;
  timestamp: number;
  dateTime: Date;

  // 时间信息
  year: string;           // 年干支
  month: string;          // 月干支
  day: string;            // 日干支
  hour: string;           // 时干支

  // 排盘信息
  escapeType: 'yang' | 'yin';  // 阳遁/阴遁
  bureauNumber: number;   // 局数（1-9）
  dutyChief: string;      // 值符
  dutyDoor: string;       // 值使

  // 九宫数据
  palaces: PalaceData[];

  // 分析要点
  keyPoints: string[];
}

const getPalaceMeta = (position: number) => {
  return NINE_PALACES.find((palace) => palace.position === position);
};

const normalizeGate = (gate: string) => (gate === '无门' ? '' : gate);
const normalizeDeity = (deity: string) => (deity === '无神' ? '' : deity);

/**
 * 生成九宫数据
 * @param chart 3meta排盘结果
 * @returns 九宫数据
 */
function generatePalaces(chart: QimenChart): PalaceData[] {
  return chart.palaces.map((palace) => {
    const meta = getPalaceMeta(palace.position);
    return {
      position: palace.position,
      name: meta?.name ?? `${palace.position}宫`,
      direction: meta?.direction ?? '',
      earthStem: palace.earthlyStem,
      heavenStem: palace.heavenlyStem,
      star: palace.star,
      door: normalizeGate(palace.gate),
      deity: normalizeDeity(palace.deity),
      isCenter: palace.position === 5
    };
  });
}

/**
 * 生成分析要点
 * @param chartData 盘数据
 * @returns 分析要点
 */
function generateKeyPoints(chartData: QiMenChartData): string[] {
  const points: string[] = [];

  points.push(`当前为${chartData.escapeType === 'yang' ? '阳' : '阴'}遁${chartData.bureauNumber}局`);
  points.push(`值符为${chartData.dutyChief}，值使为${chartData.dutyDoor}`);

  // 分析用神宫（简化）
  const centerPalace = chartData.palaces.find((palace) => palace.isCenter);
  if (centerPalace) {
    const doorLabel = centerPalace.door || '无门';
    points.push(`中宫${centerPalace.star}${doorLabel}，主事宜${centerPalace.door.includes('生') ? '生发' : '谨慎'}`);
  }

  // 寻找吉门
  const goodDoors = ['开门', '休门', '生门'];
  const goodPalaces = chartData.palaces.filter((palace) => goodDoors.includes(palace.door));
  if (goodPalaces.length > 0) {
    points.push(`吉门位于：${goodPalaces.map(palace => `${palace.direction}方${palace.door}`).join('、')}`);
  }

  return points;
}

/**
 * 生成奇门遁甲盘
 * @param dateTime 指定时间
 * @returns 奇门遁甲盘数据
 */
export function generateQiMenChart(dateTime: Date = new Date()): QiMenChartData {
  const chart = QimenChart.byDatetime(dateTime);

  const year = `${chart.fourPillars.year.stem}${chart.fourPillars.year.branch}`;
  const month = `${chart.fourPillars.month.stem}${chart.fourPillars.month.branch}`;
  const day = `${chart.fourPillars.day.stem}${chart.fourPillars.day.branch}`;
  const hour = `${chart.fourPillars.hour.stem}${chart.fourPillars.hour.branch}`;

  const escapeType = chart.ju.type === '阳遁' ? 'yang' : 'yin';
  const bureauNumber = chart.ju.number;
  const dutyChief = chart.zhiFu.star;
  const dutyDoor = chart.zhiShi.gate;

  const palaces = generatePalaces(chart);

  const chartData: QiMenChartData = {
    id: `qimen-${Date.now()}`,
    timestamp: dateTime.getTime(),
    dateTime,
    year,
    month,
    day,
    hour,
    escapeType,
    bureauNumber,
    dutyChief,
    dutyDoor,
    palaces,
    keyPoints: []
  };

  chartData.keyPoints = generateKeyPoints(chartData);

  return chartData;
}

/**
 * 格式化时间信息
 * @param chartData 盘数据
 * @returns 格式化的时间字符串
 */
export function formatDateTime(chartData: QiMenChartData): string {
  const date = chartData.dateTime;
  // 确保显示的是北京时间
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 获取宫位颜色
 * @param position 宫位号
 * @returns CSS颜色类名
 */
export function getPalaceColor(position: number): string {
  const colors = [
    'bg-blue-900/30',     // 1宫 坎水
    'bg-yellow-900/30',   // 2宫 坤土
    'bg-green-900/30',    // 3宫 震木
    'bg-green-800/30',    // 4宫 巽木
    'bg-orange-900/30',   // 5宫 中土
    'bg-gray-800/30',     // 6宫 乾金
    'bg-gray-700/30',     // 7宫 兑金
    'bg-brown-900/30',    // 8宫 艮土
    'bg-red-900/30'       // 9宫 离火
  ];

  return colors[position - 1] || 'bg-gray-800/30';
}

/**
 * 检查是否为吉门
 * @param door 门名
 * @returns 是否为吉门
 */
export function isGoodDoor(door: string): boolean {
  const goodDoors = ['开门', '休门', '生门'];
  return goodDoors.includes(door);
}

/**
 * 检查是否为吉星
 * @param star 星名
 * @returns 是否为吉星
 */
export function isGoodStar(star: string): boolean {
  const goodStars = ['天辅', '天心', '天任'];
  return goodStars.includes(star);
}
