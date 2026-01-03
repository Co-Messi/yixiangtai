import { BAZI_SYSTEM_INSTRUCTION } from './constants';
import { getActiveApiKey, buildGeminiApiUrl, GEMINI_CONFIG } from '../../masters/config';
import { useAppStore } from '../../core/store';
import axios from 'axios';
import { jsonrepair } from 'jsonrepair';
import { GANZHI_CYCLE } from '../../utils/ganzhiUtils';
import type { LifeKLineResult } from './types';


const normalizePillar = (value: string) => value.trim();

const validateLifeKlineInput = (input: any) => {
    const requiredFields = ['birthTime', 'yearPillar', 'monthPillar', 'dayPillar', 'hourPillar', 'startAge', 'firstDaYun'];
    requiredFields.forEach((field) => {
        if (!input[field] || String(input[field]).trim().length === 0) {
            throw new Error(`缺少必要参数：${field}`);
        }
    });

    const pillars = [
        normalizePillar(input.yearPillar),
        normalizePillar(input.monthPillar),
        normalizePillar(input.dayPillar),
        normalizePillar(input.hourPillar)
    ];

    pillars.forEach((pillar, index) => {
        if (!GANZHI_CYCLE.includes(pillar as any)) {
            const labels = ['年柱', '月柱', '日柱', '时柱'];
            throw new Error(`${labels[index]}格式不正确：${pillar}`);
        }
    });

    const firstDaYun = normalizePillar(input.firstDaYun);
    if (!GANZHI_CYCLE.includes(firstDaYun as any)) {
        throw new Error(`首步大运格式不正确：${firstDaYun}`);
    }

    const startAge = Number(input.startAge);
    if (!Number.isFinite(startAge) || startAge < 1 || startAge > 20) {
        throw new Error(`起运年龄不合理：${input.startAge}`);
    }
};

export const generateLifeAnalysis = async (input: any, signal?: AbortSignal): Promise<LifeKLineResult> => {
    const state = useAppStore.getState();
    const apiKey = getActiveApiKey(state.settings.apiKey);

    const cleanApiKey = apiKey ? apiKey.trim() : '';
    if (!cleanApiKey) {
        throw new Error('请先在设置中配置 Gemini API Key');
    }
    if (/[^\x00-\x7F]/.test(cleanApiKey)) {
        throw new Error('API Key 包含非法字符（如中文或全角符号），请检查输入是否正确。');
    }
    validateLifeKlineInput(input);

    const genderStr = input.gender === '男' ? '男 (乾造)' : '女 (坤造)';
    const yearStem = input.yearPillar.trim().charAt(0);
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const yearStemPolarity = yangStems.includes(yearStem) ? 'YANG' : 'YIN';

    const nightModeStr = '【采取传统子平：23点后即进入第二天】';

    let isForward = false;
    if (input.gender === '男') {
        isForward = yearStemPolarity === 'YANG';
    } else {
        isForward = yearStemPolarity === 'YIN';
    }

    const daYunDirectionStr = isForward ? '顺行 (Forward)' : '逆行 (Backward)';
    const directionExample = isForward
        ? "例如：第一步是【戊申】，第二步则是【己酉】（顺排）"
        : "例如：第一步是【戊申】，第二步则是【丁未】（逆排）";

    const birthDate = new Date(input.birthTime);
    const birthYear = Number.isFinite(birthDate.getTime()) ? birthDate.getFullYear() : Number(input.birthYear || 0);
    const requestId = Date.now();

    const userPrompt = `
    ${nightModeStr}
    请根据以下**已经排好的**八字四柱和**指定的大运信息**进行分析。
    
    【基本信息】
    性别：${genderStr}
    姓名：${input.name || "未提供"}
    出生日期时间：${input.birthTime} (阳历)
    出生年份：${birthYear}年 (阳历)
    请求编号：${requestId}
    
    【八字四柱】
    年柱：${input.yearPillar} (天干属性：${yearStemPolarity === 'YANG' ? '阳' : '阴'})
    月柱：${input.monthPillar}
    日柱：${input.dayPillar}
    时柱：${input.hourPillar}
    
    【大运核心参数】
    1. 起运年龄：${input.startAge} 岁 (虚岁)。
    2. 第一步大运：${input.firstDaYun}。
    3. **排序方向**：${daYunDirectionStr}。
    
    【必须执行的算法 - 大运序列生成】
    请严格按照以下步骤生成数据：
    
    1. **锁定第一步**：确认【${input.firstDaYun}】为第一步大运。
    2. **计算序列**：根据六十甲子顺序和方向（${daYunDirectionStr}），推算出接下来的 9 步大运。
       ${directionExample}
    3. **填充 JSON**：
       - Age 1 到 ${parseInt(input.startAge) - 1}: daYun = "童限"
       - Age ${input.startAge} 到 ${parseInt(input.startAge) + 9}: daYun = [第1步大运: ${input.firstDaYun}]
       - ...以此类推直到 100 岁。
    
    任务：
    1. 确认格局与喜忌。
    2. 生成 **1-100 岁 (虚岁)** 的人生流年K线数据。
    3. 在 \`reason\` 字段中提供流年详批 (20-30字)。
    4. 生成带评分的命理分析报告。
    
    请严格按照系统指令生成 JSON 数据。
  `;

    let content = '';
    const extractJsonContent = (raw: string): string => {
        let jsonContent = raw.trim();
        const fenced = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenced) {
            jsonContent = fenced[1].trim();
        } else {
            const start = jsonContent.indexOf('{');
            const end = jsonContent.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                jsonContent = jsonContent.slice(start, end + 1);
            }
        }
        return jsonContent;
    };
    const normalizeJsonPunctuation = (input: string): string => {
        let result = '';
        let inString = false;
        let escaped = false;
        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];
            if (inString) {
                result += ch;
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                }
                continue;
            }

            if (ch === '"') {
                inString = true;
                result += ch;
                continue;
            }

            if (ch === '，') {
                result += ',';
                continue;
            }
            if (ch === '：') {
                result += ':';
                continue;
            }

            result += ch;
        }
        return result;
    };
    const escapeNewlinesInStrings = (input: string): string => {
        let result = '';
        let inString = false;
        let escaped = false;
        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];
            if (inString) {
                if (escaped) {
                    result += ch;
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    result += ch;
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                    result += ch;
                    continue;
                }
                if (ch === '\n') {
                    result += '\\\\n';
                    continue;
                }
                if (ch === '\r') {
                    result += '\\\\r';
                    continue;
                }
            } else if (ch === '"') {
                inString = true;
            }
            result += ch;
        }
        return result;
    };
    const escapeUnescapedQuotesInStrings = (input: string): string => {
        let result = '';
        let inString = false;
        let escaped = false;
        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];
            if (inString) {
                if (escaped) {
                    result += ch;
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    result += ch;
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    let j = i + 1;
                    while (j < input.length && /\s/.test(input[j])) {
                        j += 1;
                    }
                    const next = input[j];
                    if (next && next !== ',' && next !== '}' && next !== ']') {
                        result += '\\"';
                        continue;
                    }
                    inString = false;
                    result += ch;
                    continue;
                }
                result += ch;
                continue;
            }

            if (ch === '"') {
                inString = true;
            }
            result += ch;
        }
        return result;
    };
    const insertMissingCommasInArrays = (input: string): string => {
        const isWhitespace = (ch: string) => ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
        const isValueStart = (ch: string) =>
            ch === '{' ||
            ch === '[' ||
            ch === '"' ||
            ch === '-' ||
            (ch >= '0' && ch <= '9') ||
            ch === 't' ||
            ch === 'f' ||
            ch === 'n';

        let output = '';
        let inString = false;
        let escaped = false;
        let lastSignificant = '';
        const stack: Array<'array' | 'object'> = [];

        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];

            if (inString) {
                output += ch;
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                    lastSignificant = '"';
                }
                continue;
            }

            if (isWhitespace(ch)) {
                output += ch;
                continue;
            }

            const inArray = stack[stack.length - 1] === 'array';
            if (
                inArray &&
                isValueStart(ch) &&
                lastSignificant &&
                lastSignificant !== '[' &&
                lastSignificant !== ',' &&
                lastSignificant !== ':'
            ) {
                output += ',';
            }

            if (ch === '"') {
                inString = true;
            } else if (ch === '[') {
                stack.push('array');
            } else if (ch === '{') {
                stack.push('object');
            } else if (ch === ']' || ch === '}') {
                stack.pop();
            }

            output += ch;
            lastSignificant = ch;
        }

        return output;
    };
    const insertMissingCommasInObjects = (input: string): string => {
        const isWhitespace = (ch: string) => ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
        let output = '';
        let inString = false;
        let escaped = false;
        let lastSignificant = '';
        const stack: Array<'array' | 'object'> = [];

        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];

            if (inString) {
                output += ch;
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                    lastSignificant = '"';
                }
                continue;
            }

            if (isWhitespace(ch)) {
                output += ch;
                continue;
            }

            const inObject = stack[stack.length - 1] === 'object';
            if (
                inObject &&
                ch === '"' &&
                lastSignificant &&
                lastSignificant !== '{' &&
                lastSignificant !== ',' &&
                lastSignificant !== ':'
            ) {
                output += ',';
            }

            if (ch === '"') {
                inString = true;
            } else if (ch === '[') {
                stack.push('array');
            } else if (ch === '{') {
                stack.push('object');
            } else if (ch === ']' || ch === '}') {
                stack.pop();
            }

            output += ch;
            lastSignificant = ch;
        }

        return output;
    };
    const repairJson = (input: string): string => {
        let output = normalizeJsonPunctuation(input);
        output = output.replace(/\uFEFF/g, '');
        output = output.replace(/,\s*([}\]])/g, '$1');
        output = output.replace(/}\s*{/g, '},{');
        output = output.replace(/]\s*\[/g, '],[');
        output = escapeNewlinesInStrings(output);
        output = escapeUnescapedQuotesInStrings(output);
        output = insertMissingCommasInArrays(output);
        output = insertMissingCommasInObjects(output);
        return output;
    };
    const safeJsonRepair = (input: string): string | null => {
        try {
            return jsonrepair(input);
        } catch (error) {
            console.warn('🚨 [DEBUG] jsonrepair failed:', error);
            return null;
        }
    };
    const parseLifeKlineJson = (raw: string) => {
        const jsonContent = extractJsonContent(raw);
        const repairedByLib = safeJsonRepair(jsonContent);
        const candidates = [
            jsonContent,
            repairJson(jsonContent),
            repairedByLib
        ].filter((value): value is string => typeof value === 'string' && value.length > 0);
        let lastError: Error | null = null;
        for (const candidate of candidates) {
            try {
                const data = JSON.parse(candidate);
                if (!data || !Array.isArray(data.chartPoints) || data.chartPoints.length === 0) {
                    throw new Error('模型返回的数据格式不正确（缺失 chartPoints）。');
                }
                return data;
            } catch (error: any) {
                lastError = error;
            }
        }
        const err = lastError ? lastError.message : 'JSON 解析失败';
        throw new Error(`JSON解析失败：${err}`);
    };

    const modelId = GEMINI_CONFIG.MODELS.PRIMARY || 'gemini-3-flash-preview';
    const apiUrl = buildGeminiApiUrl(modelId, cleanApiKey);
    console.log(`🚨 [DEBUG] LifeKLine starting Gemini analysis with model: ${modelId}`);
    console.log(`🚨 [DEBUG] Full API URL (redacted key):`, apiUrl.replace(/key=.+$/, 'key=REDACTED'));
    const response = await axios.post(apiUrl, {
        contents: [
            {
                role: "user",
                parts: [{ text: BAZI_SYSTEM_INSTRUCTION + "\n\n" + userPrompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        }
    }, {
        headers: { 'Cache-Control': 'no-store' },
        signal
    });
    content = response.data.candidates[0].content.parts[0].text;

    try {
        const data = parseLifeKlineJson(content);
        const chartData = data.chartPoints.map((point: any, index: number) => ({
            age: Number(point.age ?? index + 1),
            year: Number(point.year ?? 0),
            ganZhi: String(point.ganZhi ?? ''),
            daYun: point.daYun ? String(point.daYun) : undefined,
            open: Number(point.open ?? 0),
            close: Number(point.close ?? 0),
            high: Number(point.high ?? 0),
            low: Number(point.low ?? 0),
            score: Number(point.score ?? 0),
            reason: String(point.reason ?? '')
        }));
        const bazi = Array.isArray(data.bazi) ? data.bazi.map((item: any) => String(item)) : [];

        return {
            chartData,
            analysis: {
                bazi,
                summary: data.summary ? String(data.summary) : "无摘要",
                summaryScore: data.summaryScore || 5,
                personality: data.personality ? String(data.personality) : "无性格分析",
                personalityScore: data.personalityScore || 5,
                industry: data.industry ? String(data.industry) : "无",
                industryScore: data.industryScore || 5,
                fengShui: data.fengShui ? String(data.fengShui) : "建议多亲近自然。",
                fengShuiScore: data.fengShuiScore || 5,
                wealth: data.wealth ? String(data.wealth) : "无",
                wealthScore: data.wealthScore || 5,
                marriage: data.marriage ? String(data.marriage) : "无",
                marriageScore: data.marriageScore || 5,
                health: data.health ? String(data.health) : "无",
                healthScore: data.healthScore || 5,
                family: data.family ? String(data.family) : "无",
                familyScore: data.familyScore || 5,
                crypto: data.crypto ? String(data.crypto) : "暂无分析",
                cryptoScore: data.cryptoScore || 5,
                cryptoYear: data.cryptoYear ? String(data.cryptoYear) : "待定",
                cryptoStyle: data.cryptoStyle ? String(data.cryptoStyle) : "未知",
            },
        };
    } catch (error: any) {
        console.error("🚨 [DEBUG] LifeKLine API Error:", error.message);
        if (typeof content === 'string' && content.trim().length > 0) {
            const head = content.slice(0, 800);
            const tail = content.slice(-400);
            console.error("🚨 [DEBUG] LifeKLine raw content (head):", head);
            console.error("🚨 [DEBUG] LifeKLine raw content (tail):", tail);
        }
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        } else if (error.request) {
            console.error("No response received. Request details:", error.request);
            throw new Error('网络连接失败 (Gemini 无法连接，请检查网络或代理)');
        }
        throw error;
    }
};
