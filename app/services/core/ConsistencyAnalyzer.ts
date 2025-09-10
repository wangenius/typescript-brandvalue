/**
 * 品牌内容智能分析器 - TypeScript版本
 * 基于LLM的品牌内容分析, 自动生成品牌一致性评分
 */

import { BrandInputData } from '../types/BrandAsset';
import { BrandConsistencyMetrics } from './ConsistencyEvaluator';
import { LLM } from './LLM';

export interface AnalysisResult {
  report: string;
  metrics: BrandConsistencyMetrics;
}

export class BrandContentAnalyzer {
  private llm: LLM;

  constructor() {
    this.llm = new LLM();
  }

  /**
   * 分析品牌内容，生成一致性分析报告和评分
   */
  async analyzeBrandConsistency(brandData: BrandInputData): Promise<AnalysisResult> {
    // 1. 生成完整的文本分析报告
    const analysisReport = await this.generateConsistencyAnalysisReport(brandData);

    // 2. 从报告中提取结构化评分
    const consistencyMetrics = await this.extractConsistencyScoresFromReport(analysisReport);

    return {
      report: analysisReport,
      metrics: consistencyMetrics
    };
  }

  /**
   * 基于品牌所有数据，生成一份详细的文本分析报告
   */
  private async generateConsistencyAnalysisReport(brandData: BrandInputData): Promise<string> {
    // 将BrandInputData转换为JSON字符串，以便在提示中轻松使用
    const brandDataJson = JSON.stringify(brandData, null, 2);

    const prompt = `
作为一名资深的品牌战略专家，请对品牌"${brandData.brand_name}"进行一次全面、深入、系统性的品牌一致性分析。请严格基于以下提供的品牌数据，撰写一份详细的分析报告。

### 品牌核心数据:
\`\`\`json
${brandDataJson}
\`\`\`

### 分析报告撰写要求:
请围绕"品牌一致性"这一核心，从以下七个维度展开详细论述。请确保你的分析逻辑严谨，论据充分，并直接引用上述JSON数据中的关键信息来支撑你的观点。

1.  **品牌理念层一致性 (Brand Philosophy Consistency)**:
    *   **使命 (Mission)**、**愿景 (Vision)** 和 **价值观 (Values)** 是否清晰、独特且鼓舞人心？
    *   这三者之间是否存在内在的逻辑统一和互相支撑？
    *   品牌定位 (Positioning) 是否与品牌理念保持一致？

2.  **品牌表达层一致性 (Brand Expression Consistency)**:
    *   品牌口号 (Slogan)、语言风格 (Language Style)、调性 (Tone) 是否统一？
    *   核心信息 (Key Messages) 在不同传播渠道中是否保持一致？
    *   品牌表达是否准确反映了品牌理念和定位？

3.  **视觉识别系统一致性 (Visual Identity Consistency)**:
    *   色彩 (Color)、字体 (Typography)、布局 (Layout)、符号 (Symbol) 等视觉元素的使用是否遵循了统一的规范？
    *   视觉风格是否独特，并能在众多品牌中被快速识别？
    *   视觉系统是否有效地传达了品牌个性和理念？

4.  **语言风格系统一致性 (Language Style Consistency)**:
    *   品牌的口号、广告文案、社交媒体内容、客服沟通语言是否展现出统一的风格和调性？
    *   语言风格是否与目标受众的沟通习惯相匹配？
    *   信息传递是否清晰、准确、易于理解？

5.  **品牌承诺与RTB一致性 (Brand Promise & RTB Consistency)**:
    *   品牌承诺 (Promise) 是否清晰明确，并对消费者有吸引力？
    *   RTB (Reason to Believe) 是否能强有力地支撑品牌承诺，使其显得真实可信？
    *   品牌的产品/服务体验 (Experience) 是否兑现了其承诺？

6.  **目标受众契合度 (Target Audience Alignment)**:
    *   品牌的所有表现（理念、视觉、语言、承诺）是否能与目标受众 (Target Audience) 的价值观、审美和需求产生共鸣？
    *   从客户反馈 (Customer Feedback) 和市场研究 (Market Research) 数据来看，品牌在目标用户心中的认知 (Perception) 是否与品牌方期望的一致？

7.  **品牌架构层级间协同性 (Hierarchy Alignment)**:
    *   这是一个综合性评估。请分析以上 **理念、表达、视觉、语言、承诺** 等不同层级之间是否相互协同、无缝整合，共同塑造了一个立体、统一的品牌形象？
    *   例如，视觉设计是否强化了品牌口号？语言调性是否体现了品牌价值观？

请将你的分析整合成一份流畅、专业的报告。
`;

    try {
      const report = await this.llm.text(prompt);
      return report;
    } catch (error) {
      console.error("生成一致性分析报告失败:", error);
      return `生成报告失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  /**
   * 基于分析报告，提取所有BrandConsistencyMetrics的评分
   */
  private async extractConsistencyScoresFromReport(reportText: string): Promise<BrandConsistencyMetrics> {
    // 获取BrandConsistencyMetrics所有字段的描述
    const allMetricNames = [
      'mission_clarity', 'mission_consistency', 'vision_clarity', 'vision_appeal',
      'values_clarity', 'values_authenticity', 'style_consistency', 'tone_appropriateness',
      'keyword_recognition', 'scenario_adaptation', 'color_consistency', 'typography_consistency',
      'layout_consistency', 'symbol_recognition', 'visual_appeal', 'language_consistency',
      'language_appropriateness', 'slogan_memorability', 'message_clarity', 'promise_clarity',
      'promise_credibility', 'benefit_clarity', 'experience_coherence', 'rtb_clarity',
      'rtb_uniqueness', 'rtb_credibility', 'philosophy_ta_alignment', 'values_ta_resonance',
      'vision_ta_appeal', 'philosophy_expression_alignment', 'values_tone_consistency',
      'mission_keyword_alignment', 'philosophy_visual_alignment', 'values_color_symbolism',
      'vision_design_harmony', 'philosophy_language_alignment', 'values_slogan_consistency',
      'mission_message_clarity', 'expression_visual_harmony', 'tone_visual_consistency',
      'style_symbol_alignment', 'expression_language_coherence', 'tone_language_matching',
      'style_message_consistency', 'visual_language_integration', 'color_language_emotion',
      'symbol_slogan_synergy', 'promise_philosophy_alignment', 'promise_expression_consistency',
      'promise_visual_support', 'promise_language_clarity', 'rtb_philosophy_foundation',
      'rtb_expression_reinforcement', 'rtb_visual_evidence', 'rtb_language_persuasion'
    ];

    const prompt = `
作为一名量化分析专家，请仔细阅读以下品牌一致性分析报告，并基于报告内容，为下列所有指标进行精确评分。

### 品牌一致性分析报告:
---
${reportText}
---

### 评分要求:
1.  **评分标准**: 请对以下每一个指标给出 **0-10** 分的评分，支持一位小数。**0分代表完全不一致或缺失，10分代表完美一致**。
2.  **评分依据**: 你的评分必须严格依据上述报告的内容。请仔细寻找报告中与各指标相关的论述，并据此进行判断。
3.  **完整性**: **必须为清单中的每一个指标都提供评分**。如果报告中没有直接提及某个非常具体的指标，请根据最相关的宏观分析进行推断和评估。
4.  **输出格式**: 请以一个JSON对象的形式返回所有评分，key为指标名称，value为评分。不要添加任何额外的解释或注释。

### 待评分指标清单:
\`\`\`json
${JSON.stringify(allMetricNames, null, 2)}
\`\`\`

请现在开始评分，并返回完整的JSON对象。
`;

    try {
      const scoresDict = await this.llm.json(prompt);

      // 验证并填充默认值
      const finalScores: any = {};
      for (const field of allMetricNames) {
        const score = scoresDict[field];
        if (typeof score === 'number') {
          finalScores[field] = Math.max(0.0, Math.min(10.0, score));
        } else {
          console.warn(`警告: 指标 '${field}' 的评分无效或缺失，使用默认值5.0`);
          finalScores[field] = 5.0;
        }
      }

      return finalScores as BrandConsistencyMetrics;

    } catch (error) {
      console.error("从报告中提取一致性评分失败:", error);
      // 在失败时返回一个所有评分为5.0的默认对象
      const defaultScores: any = {};
      for (const field of allMetricNames) {
        defaultScores[field] = 5.0;
      }
      return defaultScores as BrandConsistencyMetrics;
    }
  }
} 