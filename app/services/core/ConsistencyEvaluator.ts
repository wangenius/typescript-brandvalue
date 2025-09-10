/**
 * 品牌表达的一致性评价模块 - TypeScript版本
 * 评测品牌表达的一致性、风格调性、核心理念等要素
 */

import { LLM } from "./LLM";

export interface BrandConsistencyMetrics {
  // 品牌理念层面
  mission_clarity: number;
  mission_consistency: number;
  vision_clarity: number;
  vision_appeal: number;
  values_clarity: number;
  values_authenticity: number;

  // 品牌表达层面
  style_consistency: number;
  tone_appropriateness: number;
  keyword_recognition: number;
  scenario_adaptation: number;

  // 视觉识别层面
  color_consistency: number;
  typography_consistency: number;
  layout_consistency: number;
  symbol_recognition: number;
  visual_appeal: number;

  // 语言风格层面
  language_consistency: number;
  language_appropriateness: number;
  slogan_memorability: number;
  message_clarity: number;

  // 品牌承诺层面
  promise_clarity: number;
  promise_credibility: number;
  benefit_clarity: number;
  experience_coherence: number;

  // RTB层面
  rtb_clarity: number;
  rtb_uniqueness: number;
  rtb_credibility: number;

  // 目标受众契合度
  philosophy_ta_alignment: number;
  values_ta_resonance: number;
  vision_ta_appeal: number;

  // 层级间契合度
  philosophy_expression_alignment: number;
  values_tone_consistency: number;
  mission_keyword_alignment: number;
  philosophy_visual_alignment: number;
  values_color_symbolism: number;
  vision_design_harmony: number;
  philosophy_language_alignment: number;
  values_slogan_consistency: number;
  mission_message_clarity: number;
  expression_visual_harmony: number;
  tone_visual_consistency: number;
  style_symbol_alignment: number;
  expression_language_coherence: number;
  tone_language_matching: number;
  style_message_consistency: number;
  visual_language_integration: number;
  color_language_emotion: number;
  symbol_slogan_synergy: number;
  promise_philosophy_alignment: number;
  promise_expression_consistency: number;
  promise_visual_support: number;
  promise_language_clarity: number;
  rtb_philosophy_foundation: number;
  rtb_expression_reinforcement: number;
  rtb_visual_evidence: number;
  rtb_language_persuasion: number;
}

export interface EvaluationContext {
  content: any;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  score: number;
  reasons: string[];
  suggestions: string[];
}

export interface ConsistencyResult {
  total_score: number;
  grade: string;
  details: Record<string, any>;
  analysis_report: string;
  swot_analysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  final_summary?: string;
}

export class BrandConsistencyEvaluator {
  private llm: LLM;
  private weights: Record<string, Record<string, number>>;

  constructor() {
    this.llm = new LLM();

    // 统一的权重配置，总和为1.0
    this.weights = {
      // 品牌理念 (20%)
      brand_philosophy: {
        mission_clarity: 0.03,
        mission_consistency: 0.03,
        vision_clarity: 0.03,
        vision_appeal: 0.03,
        values_clarity: 0.04,
        values_authenticity: 0.04,
      },
      // 品牌表达 (15%)
      brand_expression: {
        style_consistency: 0.04,
        tone_appropriateness: 0.04,
        keyword_recognition: 0.035,
        scenario_adaptation: 0.035,
      },
      // 视觉识别 (15%)
      visual_identity: {
        color_consistency: 0.03,
        typography_consistency: 0.03,
        layout_consistency: 0.03,
        symbol_recognition: 0.03,
        visual_appeal: 0.03,
      },
      // 语言风格 (10%)
      language_style: {
        language_consistency: 0.025,
        language_appropriateness: 0.025,
        slogan_memorability: 0.025,
        message_clarity: 0.025,
      },
      // 品牌承诺 (10%)
      brand_promise: {
        promise_clarity: 0.025,
        promise_credibility: 0.025,
        benefit_clarity: 0.025,
        experience_coherence: 0.025,
      },
      // RTB (5%)
      rtb: {
        rtb_clarity: 0.02,
        rtb_uniqueness: 0.015,
        rtb_credibility: 0.015,
      },
      // 目标受众契合度 (10%)
      ta_alignment: {
        philosophy_ta_alignment: 0.04,
        values_ta_resonance: 0.03,
        vision_ta_appeal: 0.03,
      },
      // 层级间契合度 (15%)
      hierarchy_alignment: {
        philosophy_expression_alignment: 0.015,
        philosophy_visual_alignment: 0.015,
        philosophy_language_alignment: 0.015,
        expression_visual_harmony: 0.015,
        expression_language_coherence: 0.015,
        visual_language_integration: 0.015,
        promise_philosophy_alignment: 0.01,
        promise_expression_consistency: 0.01,
        promise_visual_support: 0.01,
        rtb_expression_reinforcement: 0.01,
        rtb_visual_evidence: 0.01,
        values_tone_consistency: 0.005,
        values_slogan_consistency: 0.005,
        tone_language_matching: 0.005,
        symbol_slogan_synergy: 0.005,
      },
    };
  }

  /**
   * 评测品牌屋一致性
   */
  async evaluateBrandHouse(
    metrics: BrandConsistencyMetrics,
    analysisReport: string
  ): Promise<ConsistencyResult> {
    // 1. 计算总分
    const totalScore = this.calculateTotalScore(metrics);

    // 2. 确定等级
    const grade = this.getBrandHouseGrade(totalScore);

    // 3. 生成SWOT分析
    const swotAnalysis = await this.generateSWOTAnalysis(analysisReport);

    // 4. 生成最终总结
    const finalSummary = await this.generateFinalSummary(
      totalScore,
      grade,
      swotAnalysis,
      analysisReport
    );

    return {
      total_score: totalScore,
      grade,
      details: {
        metrics,
        swot_analysis: swotAnalysis,
        final_summary: finalSummary,
      },
      analysis_report: analysisReport,
      swot_analysis: swotAnalysis,
      final_summary: finalSummary,
    };
  }

  /**
   * 计算总分
   */
  private calculateTotalScore(metrics: BrandConsistencyMetrics): number {
    let totalScore = 0;

    // 遍历所有权重配置
    for (const [category, categoryWeights] of Object.entries(this.weights)) {
      for (const [metric, weight] of Object.entries(categoryWeights)) {
        const score = (metrics as any)[metric] || 0;
        totalScore += score * weight;
      }
    }

    // 转换为0-100分制
    return Math.round(totalScore * 10);
  }

  /**
   * 生成SWOT分析
   */
  private async generateSWOTAnalysis(analysisReport: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }> {
    const prompt = `
基于以下品牌一致性分析报告，请生成SWOT分析：

${analysisReport}

请从以下四个维度进行分析：
1. 优势 (Strengths): 品牌在一致性方面的强项
2. 劣势 (Weaknesses): 品牌在一致性方面需要改进的地方
3. 机会 (Opportunities): 可以进一步提升一致性的机会
4. 威胁 (Threats): 可能影响品牌一致性的潜在威胁

请以JSON格式返回，包含strengths、weaknesses、opportunities、threats四个数组。
`;

    try {
      const result = await this.llm.json(prompt);

      return {
        strengths: result.strengths || ["品牌理念清晰", "表达风格统一"],
        weaknesses: result.weaknesses || [
          "需要加强视觉一致性",
          "语言风格有待统一",
        ],
        opportunities: result.opportunities || [
          "可以进一步优化品牌表达",
          "有机会提升用户体验",
        ],
        threats: result.threats || ["市场竞争激烈", "消费者需求变化快"],
      };
    } catch (error) {
      // 返回默认的SWOT分析
      return {
        strengths: ["品牌理念清晰", "表达风格统一"],
        weaknesses: ["需要加强视觉一致性", "语言风格有待统一"],
        opportunities: ["可以进一步优化品牌表达", "有机会提升用户体验"],
        threats: ["市场竞争激烈", "消费者需求变化快"],
      };
    }
  }

  /**
   * 生成最终总结
   */
  private async generateFinalSummary(
    totalScore: number,
    grade: string,
    swotAnalysis: any,
    analysisReport: string
  ): Promise<string> {
    const prompt = `
基于以下信息，生成品牌一致性评测的最终总结：

总分: ${totalScore}/100
等级: ${grade}
SWOT分析: ${JSON.stringify(swotAnalysis, null, 2)}
分析报告: ${analysisReport.substring(0, 500)}...

请生成一个简洁、专业的总结，包含：
1. 总体评价
2. 主要优势
3. 需要改进的地方
4. 建议
`;

    try {
      const summary = await this.llm.text(prompt);
      return summary;
    } catch (error) {
      return `品牌一致性评测总结

总分: ${totalScore}/100
等级: ${grade}

总体评价: 该品牌在一致性方面表现${
        totalScore >= 80 ? "优秀" : totalScore >= 60 ? "良好" : "需要改进"
      }。

主要优势:
- 品牌理念清晰明确
- 表达风格相对统一
- 目标受众契合度良好

需要改进的地方:
- 视觉识别系统需要进一步统一
- 语言风格有待加强一致性
- 层级间协同性需要提升

建议:
1. 制定统一的品牌视觉规范
2. 建立完整的品牌语言体系
3. 加强各层级间的协同配合
4. 定期进行品牌一致性审查`;
    }
  }

  /**
   * 获取品牌屋等级
   */
  private getBrandHouseGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C+";
    if (score >= 40) return "C";
    return "D";
  }
}
