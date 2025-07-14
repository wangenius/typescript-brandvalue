/**
 * BrandZ计算器
 * 基于凯度BrandZ模型的品牌价值计算
 */

import { BrandInputData } from "../types/BrandAsset";
import {
  BrandZEvaluationResult,
  ConsistencyResult,
  ComprehensiveReport,
} from "../types/EvaluationResult";
import { BrandConsistencyEvaluator } from "./ConsistencyEvaluator";
import { BrandContentAnalyzer } from "./ConsistencyAnalyzer";

export const BRANDZ_WEIGHTS = {
  FINANCIAL_VALUE: 0.4,
  BRAND_CONTRIBUTION: 0.6,
};
export const BRANDZ_COMPONENT_WEIGHTS = {
  REVENUE_PERFORMANCE: 0.5,
  ASSET_EFFICIENCY: 0.3,
  BRAND_MULTIPLE: 0.2,
};

export const BRANDZ_CONTRIBUTION_COMPONENT_WEIGHTS = {
  MEANINGFUL: 0.25,
  DIFFERENT: 0.25,
  SALIENT: 0.25,
  CONSISTENCY: 0.25,
};

export class BrandZCalculator {
  /**
   * 综合品牌评估
   */
  async evaluateBrandZ(
    brandData: BrandInputData
  ): Promise<ComprehensiveReport> {
    // 1. 品牌一致性评估
    const consistencyResult = await this.evaluateConsistency(brandData);

    // 2. BrandZ价值评估
    const brandzResult = await this.evaluateBrandZValue(
      brandData,
      consistencyResult.total_score
    );

    // 3. 生成综合报告
    return this.generateComprehensiveReport(
      brandData,
      consistencyResult,
      brandzResult
    );
  }

  /**
   * 评估品牌一致性（使用新的分析器和评估器）
   */
  private async evaluateConsistency(
    brandData: BrandInputData
  ): Promise<ConsistencyResult> {
    const contentAnalyzer = new BrandContentAnalyzer();
    const consistencyEvaluator = new BrandConsistencyEvaluator();

    // 1. 分析品牌内容
    const analysisResult = await contentAnalyzer.analyzeBrandConsistency(
      brandData
    );

    // 2. 评估一致性
    const consistencyResult = await consistencyEvaluator.evaluateBrandHouse(
      analysisResult.metrics,
      analysisResult.report
    );

    return consistencyResult;
  }

  /**
   * 评估BrandZ价值
   */
  private async evaluateBrandZValue(
    brandData: BrandInputData,
    consistencyScore: number
  ): Promise<BrandZEvaluationResult> {
    const result: BrandZEvaluationResult = {
      financial_value_score: 0,
      revenue_performance: 0,
      asset_efficiency: 0,
      brand_multiple: 1.0,
      brand_contribution_score: 0,
      meaningful_score: 0,
      different_score: 0,
      salient_score: 0,
      consistency_score: 0,
      brandz_value: 0,
      brand_grade: "",
    };

    // 1. 评估财务价值
    const financialScores = this.evaluateFinancialValue(brandData);
    result.revenue_performance = financialScores.revenue_performance;
    result.asset_efficiency = financialScores.asset_efficiency;
    result.brand_multiple = financialScores.brand_multiple;

    result.financial_value_score =
      result.revenue_performance * BRANDZ_COMPONENT_WEIGHTS.REVENUE_PERFORMANCE +
      result.asset_efficiency * BRANDZ_COMPONENT_WEIGHTS.ASSET_EFFICIENCY +
      Math.min(result.brand_multiple * 20, 100) *
        BRANDZ_COMPONENT_WEIGHTS.BRAND_MULTIPLE;

    // 2. 评估品牌贡献
    const mdsScores = this.evaluateMDSScores(brandData);
    result.meaningful_score = mdsScores.meaningful;
    result.different_score = mdsScores.different;
    result.salient_score = mdsScores.salient;
    result.consistency_score = consistencyScore;

    result.brand_contribution_score =
      result.meaningful_score * BRANDZ_CONTRIBUTION_COMPONENT_WEIGHTS.MEANINGFUL +
      result.different_score * BRANDZ_CONTRIBUTION_COMPONENT_WEIGHTS.DIFFERENT +
      result.salient_score * BRANDZ_CONTRIBUTION_COMPONENT_WEIGHTS.SALIENT +
      result.consistency_score * BRANDZ_CONTRIBUTION_COMPONENT_WEIGHTS.CONSISTENCY;

    // 3. 计算BrandZ价值
    const baseScore =
      result.financial_value_score * BRANDZ_WEIGHTS.FINANCIAL_VALUE +
      result.brand_contribution_score * BRANDZ_WEIGHTS.BRAND_CONTRIBUTION;

    const multiplierFactor = result.brand_multiple / 2.5;
    result.brandz_value = baseScore * multiplierFactor;

    // 4. 确定品牌等级
    result.brand_grade = this.getBrandGrade(result.brandz_value);

    // 5. 生成评估详情
    result.evaluation_details = this.generateEvaluationDetails(
      result,
      financialScores,
      mdsScores
    );
    result.improvement_suggestions = this.generateImprovementSuggestions(
      brandData,
      result
    );

    return result;
  }

  /**
   * 评估财务价值
   */
  private evaluateFinancialValue(brandData: BrandInputData): {
    revenue_performance: number;
    asset_efficiency: number;
    brand_multiple: number;
  } {
    // 简化的财务评估，基于品牌资产信息
    const positioning = brandData.brand_assets.brand_image.brand_positioning;
    const mission = positioning.brand_mission.description;
    const value = positioning.description;

    let revenuePerformance = 70;
    let assetEfficiency = 70;
    let brandMultiple = 2.0;

    // 基于定位评估收益表现
    if (
      positioning.description.includes("领导") ||
      positioning.description.includes("领先")
    ) {
      revenuePerformance += 20;
    }

    // 基于使命评估资产效率
    if (mission.includes("专业") || mission.includes("品质")) {
      assetEfficiency += 20;
    }

    // 基于价值主张评估品牌倍数
    if (value.includes("独特") || value.includes("创新")) {
      brandMultiple += 0.5;
    }

    return {
      revenue_performance: Math.min(100, revenuePerformance),
      asset_efficiency: Math.min(100, assetEfficiency),
      brand_multiple: Math.min(5.0, Math.max(1.0, brandMultiple)),
    };
  }

  /**
   * 评估MDS分数
   */
  private evaluateMDSScores(brandData: BrandInputData): {
    meaningful: number;
    different: number;
    salient: number;
  } {
    const positioning = brandData.brand_assets.brand_image.brand_positioning;
    const expression = brandData.brand_assets.brand_image.brand_expression;

    let meaningful = 70;
    let different = 70;
    let salient = 70;

    // 评估有意义度
    if (
      positioning.brand_mission.description.includes("价值") ||
      positioning.brand_mission.description.includes("意义")
    ) {
      meaningful += 20;
    }

    // 评估差异化度
    if (
      positioning.description.includes("独特") ||
      positioning.description.includes("创新")
    ) {
      different += 20;
    }

    // 评估显著度
    if (expression.brand_slogan.slogan || expression.tone.description) {
      salient += 20;
    }

    return {
      meaningful: Math.min(100, meaningful),
      different: Math.min(100, different),
      salient: Math.min(100, salient),
    };
  }

  /**
   * 生成综合报告
   */
  private generateComprehensiveReport(
    brandData: BrandInputData,
    consistencyResult: ConsistencyResult,
    brandzResult: BrandZEvaluationResult
  ): ComprehensiveReport {
    const now = new Date();

    return {
      brand_name: brandData.brand_name,
      evaluation_date: now.toISOString(),
      methodology:
        "Kantar BrandZ Model + Brand Consistency Analysis (TypeScript v1.0)",
      consistency_evaluation: consistencyResult,
      brandz_evaluation: brandzResult,
      analysis_reports: {
        consistency_report: consistencyResult.analysis_report,
        financial_report: this.generateFinancialReport(brandData, brandzResult),
        mds_report: this.generateMDSReport(brandData, brandzResult),
      },
      evaluation_summary: {
        consistency_grade: consistencyResult.grade,
        brandz_grade: brandzResult.brand_grade,
        overall_performance_summary: this.generateOverallSummary(
          brandData,
          consistencyResult,
          brandzResult
        ),
      },
    };
  }

  /**
   * 生成财务报告
   */
  private generateFinancialReport(
    brandData: BrandInputData,
    result: BrandZEvaluationResult
  ): string {
    return `
财务价值分析报告

品牌名称: ${brandData.brand_name}

1. 收益表现: ${result.revenue_performance}/100
   - 评估: ${
     result.revenue_performance > 80
       ? "优秀"
       : result.revenue_performance > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 提升市场竞争力，扩大市场份额

2. 资产效率: ${result.asset_efficiency}/100
   - 评估: ${
     result.asset_efficiency > 80
       ? "优秀"
       : result.asset_efficiency > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 优化资源配置，提高运营效率

3. 品牌倍数: ${result.brand_multiple}
   - 评估: ${
     result.brand_multiple > 3.0
       ? "优秀"
       : result.brand_multiple > 2.0
       ? "良好"
       : "需要改进"
   }
   - 建议: 增强品牌影响力，提升品牌溢价能力

财务价值总分: ${result.financial_value_score}/100
`;
  }

  /**
   * 生成MDS报告
   */
  private generateMDSReport(
    brandData: BrandInputData,
    result: BrandZEvaluationResult
  ): string {
    return `
品牌贡献分析报告 (MDS模型)

品牌名称: ${brandData.brand_name}

1. 有意义度 (Meaningful): ${result.meaningful_score}/100
   - 评估: ${
     result.meaningful_score > 80
       ? "优秀"
       : result.meaningful_score > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 强化品牌价值主张，提升品牌意义

2. 差异化度 (Different): ${result.different_score}/100
   - 评估: ${
     result.different_score > 80
       ? "优秀"
       : result.different_score > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 突出品牌独特性，建立差异化优势

3. 显著度 (Salient): ${result.salient_score}/100
   - 评估: ${
     result.salient_score > 80
       ? "优秀"
       : result.salient_score > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 提升品牌知名度，增强品牌记忆点

4. 一致性 (Consistency): ${result.consistency_score}/100
   - 评估: ${
     result.consistency_score > 80
       ? "优秀"
       : result.consistency_score > 60
       ? "良好"
       : "需要改进"
   }
   - 建议: 保持品牌表达一致性，强化品牌识别

品牌贡献总分: ${result.brand_contribution_score}/100
`;
  }

  /**
   * 生成总体总结
   */
  private generateOverallSummary(
    brandData: BrandInputData,
    consistencyResult: ConsistencyResult,
    brandzResult: BrandZEvaluationResult
  ): string {
    const overallScore =
      (consistencyResult.total_score + brandzResult.brandz_value) / 2;
    const overallGrade = this.getBrandGrade(overallScore);

    return `
品牌综合评估总结

品牌名称: ${brandData.brand_name}

总体评分: ${overallScore.toFixed(1)}/100
品牌等级: ${overallGrade}

优势分析:
- 品牌一致性: ${consistencyResult.total_score > 70 ? "良好" : "需要改进"}
- 品牌价值: ${brandzResult.brandz_value > 70 ? "良好" : "需要改进"}

改进建议:
1. 持续优化品牌定位与表达的一致性
2. 提升品牌在目标用户中的认知度和美誉度
3. 加强品牌差异化建设，突出核心竞争优势
4. 完善品牌传播体系，提升品牌影响力

发展前景: ${
      overallScore > 70
        ? "良好"
        : overallScore > 50
        ? "需要重点关注"
        : "需要重点关注"
    }
`;
  }

  /**
   * 生成评估详情
   */
  private generateEvaluationDetails(
    result: BrandZEvaluationResult,
    financialScores: {
      revenue_performance: number;
      asset_efficiency: number;
      brand_multiple: number;
    },
    mdsScores: { meaningful: number; different: number; salient: number }
  ): Record<string, any> {
    return {
      financial_breakdown: financialScores,
      mds_breakdown: mdsScores,
      brandz_calculation: {
        financial_weight: BRANDZ_WEIGHTS.FINANCIAL_VALUE,
        brand_contribution_weight: BRANDZ_WEIGHTS.BRAND_CONTRIBUTION,
        final_score: result.brandz_value,
      },
    };
  }

  /**
   * 生成改进建议
   */
  private generateImprovementSuggestions(
    brandData: BrandInputData,
    result: BrandZEvaluationResult
  ): string {
    const suggestions = [];

    if (result.financial_value_score < 70) {
      suggestions.push("提升财务表现，优化资源配置");
    }

    if (result.brand_contribution_score < 70) {
      suggestions.push("加强品牌建设，提升品牌影响力");
    }

    if (result.consistency_score < 70) {
      suggestions.push("保持品牌表达一致性，强化品牌识别");
    }

    return suggestions.length > 0
      ? suggestions.join("；")
      : "建议继续优化品牌建设";
  }

  /**
   * 获取等级
   */
  private getGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    return "D级";
  }

  /**
   * 获取品牌等级
   */
  private getBrandGrade(brandzValue: number): string {
    if (brandzValue >= 90) return "A级";
    if (brandzValue >= 80) return "B级";
    if (brandzValue >= 70) return "C级";
    if (brandzValue >= 60) return "D级";
    return "E级";
  }
}
