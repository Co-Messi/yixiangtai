/**
 * 干支计算工具类
 * 提供天干地支相关的通用计算功能
 */

// 天干数组
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 地支数组
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// 生肖动物（与地支对应）
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const;

// 五行对应关系
export const WUXING_MAPPING = {
  // 天干五行
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  // 地支五行
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
} as const;

/**
 * 时辰信息接口
 */
export interface TimeSlot {
  name: string;      // 时辰名称（子时、丑时等）
  range: string;     // 时间范围（如：23:00-01:00）
  hours: number[];   // 对应的小时数组
  zhiIndex: number;  // 地支索引
}

/**
 * 十二时辰定义
 * 传统时辰划分：子丑寅卯辰巳午未申酉戌亥
 */
export const TIME_SLOTS: TimeSlot[] = [
  { name: '子时', range: '23:00-01:00', hours: [23, 0], zhiIndex: 0 },
  { name: '丑时', range: '01:00-03:00', hours: [1, 2], zhiIndex: 1 },
  { name: '寅时', range: '03:00-05:00', hours: [3, 4], zhiIndex: 2 },
  { name: '卯时', range: '05:00-07:00', hours: [5, 6], zhiIndex: 3 },
  { name: '辰时', range: '07:00-09:00', hours: [7, 8], zhiIndex: 4 },
  { name: '巳时', range: '09:00-11:00', hours: [9, 10], zhiIndex: 5 },
  { name: '午时', range: '11:00-13:00', hours: [11, 12], zhiIndex: 6 },
  { name: '未时', range: '13:00-15:00', hours: [13, 14], zhiIndex: 7 },
  { name: '申时', range: '15:00-17:00', hours: [15, 16], zhiIndex: 8 },
  { name: '酉时', range: '17:00-19:00', hours: [17, 18], zhiIndex: 9 },
  { name: '戌时', range: '19:00-21:00', hours: [19, 20], zhiIndex: 10 },
  { name: '亥时', range: '21:00-23:00', hours: [21, 22], zhiIndex: 11 }
];

/**
 * 根据小时数获取时辰信息
 * @param hour 小时数（0-23）
 * @returns TimeSlot 时辰信息
 */
export function getTimeSlotByHour(hour: number): TimeSlot {
  for (const timeSlot of TIME_SLOTS) {
    if (timeSlot.hours.includes(hour)) {
      return timeSlot;
    }
  }

  // 默认返回子时（不应该走到这里）
  return TIME_SLOTS[0];
}

/**
 * 根据小时数获取地支索引
 * @param hour 小时数（0-23）
 * @returns number 地支索引（0-11）
 */
export function getZhiIndexByHour(hour: number): number {
  return getTimeSlotByHour(hour).zhiIndex;
}

/**
 * 获取时辰对应的时间范围描述
 * @param hour 小时数（0-23）
 * @returns string 时间范围描述，如：'23:00-01:00 (子时)'
 */
export function getTimeRangeByHour(hour: number): string {
  const timeSlot = getTimeSlotByHour(hour);
  return `${timeSlot.range} (${timeSlot.name})`;
}

/**
 * 获取指定年份和节气的精确时间
 * @param year 年份
 * @param index 节气索引 (0-23, 0是小寒, 2是立春)
 */
export function getSolarTerm(year: number, index: number): Date {
  const sTermInfo = [
    0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
    218072, 240693, 263343, 285961, 308477, 330856, 353050, 375027, 396749,
    418202, 439384, 460312, 481030, 501583
  ];
  const baseDate = new Date(1900, 0, 6, 2, 5, 0);
  const msPerMin = 60000;
  const diffYearMin = (year - 1900) * 525948.76;
  const totalMin = diffYearMin + sTermInfo[index];
  return new Date(baseDate.getTime() + totalMin * msPerMin);
}

/**
 * 计算年干支（考虑立春节气）
 * @param date 时间对象
 * @returns string 年干支
 */
export function getYearGanZhi(date: Date): string {
  const year = date.getFullYear();
  const liChun = getSolarTerm(year, 2);

  let actualYear = year;
  if (date < liChun) {
    actualYear = year - 1;
  }

  // 以1984年甲子年为基准
  const baseYear = 1984;
  const yearDiff = actualYear - baseYear;

  let ganIndex = (yearDiff % 10 + 10) % 10;
  let zhiIndex = (yearDiff % 12 + 12) % 12;

  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

/**
 * 计算月干支（考虑节气月份）
 * @param date 时间对象
 * @returns string 月干支
 */
export function getMonthGanZhi(date: Date): string {
  const year = date.getFullYear();

  // 修正算法：
  // 立春(Index 2) 之后是 寅月 (Zhi Index 2)
  // 惊蛰(Index 4) 之后是 卯月 (Zhi Index 3)
  // ...以此类推
  // 我们重新写一遍逻辑以防混淆
  const monthTerms = [];
  // 丑月开始
  monthTerms.push({ date: getSolarTerm(year - 1, 22), zhi: 0 }); // 去年的大雪 -> 子月 (Zhi Index 0)
  monthTerms.push({ date: getSolarTerm(year, 0), zhi: 1 });  // 本年小寒 -> 丑月 (Zhi Index 1)
  monthTerms.push({ date: getSolarTerm(year, 2), zhi: 2 });  // 立春 -> 寅月 (Zhi Index 2)
  monthTerms.push({ date: getSolarTerm(year, 4), zhi: 3 });  // 惊蛰 -> 卯月 (Zhi Index 3)
  monthTerms.push({ date: getSolarTerm(year, 6), zhi: 4 });  // 清明 -> 辰月 (Zhi Index 4)
  monthTerms.push({ date: getSolarTerm(year, 8), zhi: 5 });  // 立夏 -> 巳月 (Zhi Index 5)
  monthTerms.push({ date: getSolarTerm(year, 10), zhi: 6 }); // 芒种 -> 午月 (Zhi Index 6)
  monthTerms.push({ date: getSolarTerm(year, 12), zhi: 7 }); // 小暑 -> 未月 (Zhi Index 7)
  monthTerms.push({ date: getSolarTerm(year, 14), zhi: 8 }); // 立秋 -> 申月 (Zhi Index 8)
  monthTerms.push({ date: getSolarTerm(year, 16), zhi: 9 }); // 白露 -> 酉月 (Zhi Index 9)
  monthTerms.push({ date: getSolarTerm(year, 18), zhi: 10 }); // 寒露 -> 戌月 (Zhi Index 10)
  monthTerms.push({ date: getSolarTerm(year, 20), zhi: 11 }); // 立冬 -> 亥月 (Zhi Index 11)
  monthTerms.push({ date: getSolarTerm(year, 22), zhi: 0 });  // 大雪 -> 子月 (Zhi Index 0)

  let monthZhi = 0; // Default to 子月 (Zhi Index 0)
  for (let i = monthTerms.length - 1; i >= 0; i--) {
    if (date >= monthTerms[i].date) {
      monthZhi = monthTerms[i].zhi;
      break;
    }
  }

  // 月干推算：根据年干确定月干
  const yearGan = getYearGanZhi(date).charAt(0);
  const yearGanIndex = TIANGAN.indexOf(yearGan as typeof TIANGAN[number]);

  // 月干计算公式：甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
  const monthGanBase = [2, 4, 6, 8, 0]; // 对应甲己、乙庚、丙辛、丁壬、戊癸年的寅月起始天干
  const baseGanIndex = monthGanBase[yearGanIndex % 5];

  // 计算实际月干：从寅月开始计算
  const monthGanIndex = (baseGanIndex + (monthZhi + 10) % 12) % 10; // +10是因为寅=2，要调整到从寅开始

  return TIANGAN[monthGanIndex] + DIZHI[monthZhi];
}

/**
 * 计算日干支
 * @param date 时间对象
 * @returns string 日干支
 */
export function getDayGanZhi(date: Date): string {
  // 使用更准确的基准日期：2000年1月1日是戊午日
  // 取本地正午避免夏令时导致的跨日误差
  const baseDate = new Date(2000, 0, 1, 12, 0, 0);
  const baseGanIndex = 4; // 戊
  const baseZhiIndex = 6; // 午

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const timeDiff = targetDate.getTime() - baseDate.getTime();
  const dayDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

  const ganIndex = (baseGanIndex + dayDiff) % 10;
  const zhiIndex = (baseZhiIndex + dayDiff) % 12;

  // 处理负数情况
  const finalGanIndex = ganIndex >= 0 ? ganIndex : (ganIndex + 10);
  const finalZhiIndex = zhiIndex >= 0 ? zhiIndex : (zhiIndex + 12);

  return TIANGAN[finalGanIndex] + DIZHI[finalZhiIndex];
}

/**
 * 计算时干支
 * @param date 时间对象
 * @returns string 时干支
 */
export function getHourGanZhi(date: Date, dayBaseDate: Date = date): string {
  const hour = date.getHours();

  // 使用工具函数获取地支索引
  const zhiIndex = getZhiIndexByHour(hour);

  // 时干计算：根据日干推算
  const dayGan = getDayGanZhi(dayBaseDate).charAt(0);
  const dayGanIndex = TIANGAN.indexOf(dayGan as typeof TIANGAN[number]);

  // 时干计算公式：甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
  const hourGanBase = [0, 2, 4, 6, 8]; // 对应甲己、乙庚、丙辛、丁壬、戊癸日的子时起始天干
  const baseGanIndex = hourGanBase[dayGanIndex % 5];

  // 计算实际时干
  const hourGanIndex = (baseGanIndex + zhiIndex) % 10;

  return TIANGAN[hourGanIndex] + DIZHI[zhiIndex];
}

/**
 * 计算完整的四柱干支
 * @param date 时间对象
 * @returns object 包含年月日时四柱干支
 */
export interface FourPillarsGanZhi {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export type ZiRule = 'modern' | 'traditional' | 'earlyLate';

function resolveZiRule(rule: boolean | ZiRule | undefined): ZiRule {
  if (rule === true) return 'traditional';
  if (rule === false || rule === undefined) return 'modern';
  return rule;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function getFourPillarsGanZhi(date: Date, ziRule: boolean | ZiRule = false): FourPillarsGanZhi {
  // Modern: 00:00 换天
  // Traditional: 23:00 换天 (传统子平)
  // EarlyLate: 23:00 子时日柱不变，时柱按次日
  const rule = resolveZiRule(ziRule);
  const hour = date.getHours();
  const isLateZi = hour === 23;

  let dayBaseDate = date;
  let hourBaseDate = date;

  if (rule === 'traditional' && isLateZi) {
    dayBaseDate = addDays(date, 1);
    hourBaseDate = dayBaseDate;
  } else if (rule === 'earlyLate' && isLateZi) {
    hourBaseDate = addDays(date, 1);
  }

  return {
    year: getYearGanZhi(date),
    month: getMonthGanZhi(date),
    day: getDayGanZhi(dayBaseDate),
    hour: getHourGanZhi(date, hourBaseDate)
  };
}

/**
 * 获取干支对应的五行
 * @param ganZhi 干支字符（如：甲、子等）
 * @returns string 对应的五行
 */
export function getWuxing(ganZhi: string): string {
  return WUXING_MAPPING[ganZhi as keyof typeof WUXING_MAPPING] || '土';
}

/**
 * 计算生肖动物
 * @param year 年份
 * @returns string 生肖动物
 */
export function getZodiacAnimal(year: number): string {
  // 以1900年（鼠年）为基准
  const baseYear = 1900;
  const offset = (year - baseYear) % 12;
  const index = offset >= 0 ? offset : (offset + 12);
  return ZODIAC_ANIMALS[index];
}

// 六十甲子循环表
export const GANZHI_CYCLE = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
] as const;

/**
 * 验证时间对象是否有效
 * @param date 时间对象
 * @returns boolean 是否有效
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
} 
