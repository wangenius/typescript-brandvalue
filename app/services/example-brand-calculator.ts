/**
 * 品牌价值评估示例
 * 演示如何使用brand_valuate函数
 */

import { brand_valuate, BrandInputData } from "./index";
import * as fs from "fs";
import * as path from "path";

// 读取input.json文件
function loadInputData(): BrandInputData {
  try {
    const inputPath = path.join(__dirname, "input.json");
    const inputContent = fs.readFileSync(inputPath, "utf-8");
    return JSON.parse(inputContent);
  } catch (error) {
    console.error("读取input.json失败:", error);
    throw error;
  }
}

// 从input.json加载测试数据
const sampleInput: BrandInputData = loadInputData();

/**
 * 异步评估示例
 */
async function runAsyncExample() {
  console.log("=== 异步品牌评估示例 ===");
  console.log("使用input.json数据");

  try {
    const result = await brand_valuate(sampleInput);

    if (result.success && result.data) {
      console.log("评估成功！");
      console.log("品牌名称:", result.data.brand_name);
      console.log("评估日期:", result.data.evaluation_date);
      console.log("品牌等级:", result.data.brandz_evaluation.brand_grade);
      console.log("一致性等级:", result.data.consistency_evaluation.grade);
      console.log("BrandZ价值:", result.data.brandz_evaluation.brandz_value);

      console.log("\n=== 详细报告 ===");
      console.log(
        "一致性评估:",
        result.data.consistency_evaluation.analysis_report
      );
      console.log("财务报告:", result.data.analysis_reports.financial_report);
      console.log("MDS报告:", result.data.analysis_reports.mds_report);
      console.log(
        "总体总结:",
        result.data.evaluation_summary.overall_performance_summary
      );

      // 保存结果到本地文件
      try {
        const outputPath = path.join(__dirname, "evaluation_result.json");
        const resultJson = JSON.stringify(result.data, null, 2);
        fs.writeFileSync(outputPath, resultJson, "utf-8");
        console.log("\n评估结果已保存到:", outputPath);
      } catch (saveError) {
        console.error("保存结果失败:", saveError);
      }
    } else {
      console.log("评估失败:", result.error);
    }
  } catch (error) {
    console.error("执行评估时出错:", error);
  }
}

// 执行示例
runAsyncExample().catch(console.error);

export { sampleInput, runAsyncExample };
