/**
 * 品牌价值评测系统 - TypeScript版本
 * 主要模块接口
 */

import { BrandInputData } from './types/BrandAsset';
import { BrandValuationResult } from './types/EvaluationResult';
import { BrandZCalculator } from './core/BrandZCalculator';

/**
 * 品牌价值评测主函数
 * @param input 品牌输入数据，格式参考input.json
 * @returns 评测结果
 */
export async function brand_valuate(input: BrandInputData): Promise<BrandValuationResult> {
  try {
    // 1. 品牌评测：使用BrandZ计算器进行综合评测
    const calculator = new BrandZCalculator();
    const comprehensiveReport = await calculator.evaluateBrandZ(input);
    
    // 2. 返回成功结果
    return {
      success: true,
      data: comprehensiveReport
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 导出类型定义
export type { BrandInputData } from './types/BrandAsset';
export type { BrandValuationResult, ComprehensiveReport } from './types/EvaluationResult';

// 导出工具类
export { BrandZCalculator } from './core/BrandZCalculator';
export { LLM } from './core/LLM';
export { BrandConsistencyEvaluator } from './core/ConsistencyEvaluator';
export { BrandContentAnalyzer } from './core/ConsistencyAnalyzer';
export { BrandAssetGenerator, generateBrandAsset } from './core/BrandAssetGenerator';