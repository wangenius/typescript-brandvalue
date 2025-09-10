/**
 * 评测结果类型定义
 */

export interface BrandZEvaluationResult {
  // 财务价值评测
  financial_value_score: number;
  revenue_performance: number;
  asset_efficiency: number;
  brand_multiple: number;
  
  // 品牌贡献评测
  brand_contribution_score: number;
  meaningful_score: number;
  different_score: number;
  salient_score: number;
  
  // 品牌一致性
  consistency_score: number;
  
  // 综合评测
  brandz_value: number;
  brand_grade: string;
  
  // 评测详情
  evaluation_details?: Record<string, any>;
  improvement_suggestions?: string;
}

export interface ConsistencyResult {
  total_score: number;
  grade: string;
  details: Record<string, any>;
  analysis_report: string;
}

export interface ComprehensiveReport {
  brand_name: string;
  evaluation_date: string;
  methodology: string;
  consistency_evaluation: ConsistencyResult;
  brandz_evaluation: BrandZEvaluationResult;
  analysis_reports: {
    consistency_report: string;
    financial_report: string;
    mds_report: string;
  };
  evaluation_summary: {
    consistency_grade: string;
    brandz_grade: string;
    overall_performance_summary: string;
  };
}

export interface BrandValuationResult {
  success: boolean;
  data?: ComprehensiveReport;
  error?: string;
} 