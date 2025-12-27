import { BAZI_SYSTEM_INSTRUCTION } from './constants';
import { getActiveApiKey, buildGeminiApiUrl, getActiveOpenaiApiKey, GEMINI_CONFIG } from '../../masters/config';
import { useAppStore } from '../../core/store';
import axios from 'axios';
import type { LifeKLineResult } from './types';

export const generateLifeAnalysis = async (input: any): Promise<LifeKLineResult> => {
    const state = useAppStore.getState();
    const isGemini = input.provider === 'gemini';
    const apiKey = isGemini
        ? getActiveApiKey(state.settings.apiKey)
        : getActiveOpenaiApiKey(state.settings.openaiApiKey);

    if (!apiKey) {
        throw new Error(`请先在设置中配置 ${isGemini ? 'Gemini' : 'OpenAI'} API Key`);
    }

    const genderStr = input.gender === '男' ? '男 (乾造)' : '女 (坤造)';
    const yearStem = input.yearPillar.trim().charAt(0);
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const yearStemPolarity = yangStems.includes(yearStem) ? 'YANG' : 'YIN';

    // 晚子时处理 logic mentioned in the prompt
    const isNightZi = input.isNightZi || false;
    const nightModeStr = isNightZi ? '【采取早晚子时：23-00点为当天日柱+下日时柱】' : '【采取传统子平：23点后即进入第二天】';

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

    const userPrompt = `
    ${nightModeStr}
    请根据以下**已经排好的**八字四柱和**指定的大运信息**进行分析。
    
    【基本信息】
    性别：${genderStr}
    姓名：${input.name || "未提供"}
    出生年份：${input.birthYear}年 (阳历)
    
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

    if (isGemini) {
        const modelId = GEMINI_CONFIG.MODELS.PRIMARY || 'gemini-3-flash-preview';
        const apiUrl = buildGeminiApiUrl(modelId, apiKey);
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
        });
        content = response.data.candidates[0].content.parts[0].text;
    } else {
        // OpenAI Call
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: BAZI_SYSTEM_INSTRUCTION },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        content = response.data.choices[0].message.content;
    }

    try {
        const data = JSON.parse(content);

        return {
            chartData: data.chartPoints,
            analysis: {
                bazi: data.bazi || [],
                summary: data.summary || "无摘要",
                summaryScore: data.summaryScore || 5,
                personality: data.personality || "无性格分析",
                personalityScore: data.personalityScore || 5,
                industry: data.industry || "无",
                industryScore: data.industryScore || 5,
                fengShui: data.fengShui || "建议多亲近自然。",
                fengShuiScore: data.fengShuiScore || 5,
                wealth: data.wealth || "无",
                wealthScore: data.wealthScore || 5,
                marriage: data.marriage || "无",
                marriageScore: data.marriageScore || 5,
                health: data.health || "无",
                healthScore: data.healthScore || 5,
                family: data.family || "无",
                familyScore: data.familyScore || 5,
                crypto: data.crypto || "暂无分析",
                cryptoScore: data.cryptoScore || 5,
                cryptoYear: data.cryptoYear || "待定",
                cryptoStyle: data.cryptoStyle || "未知",
            },
        };
    } catch (error: any) {
        console.error("🚨 [DEBUG] LifeKLine API Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        } else if (error.request) {
            console.error("No response received. Request details:", error.request);
            throw new Error(`网络连接失败 (Gemini/OpenAI 无法连接，请检查网络或代理)`);
        }
        throw error;
    }
};
