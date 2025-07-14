/**
 * HTTP API测试脚本
 * 使用input.json数据测试品牌价值评估API
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const API_BASE_URL = "http://localhost:3000";

// 配置axios禁用代理，避免代理干扰localhost访问
axios.defaults.proxy = false;

// 读取input.json数据
function loadTestData() {
  try {
    const inputPath = path.join(__dirname, "input.json");
    const inputContent = fs.readFileSync(inputPath, "utf-8");
    return JSON.parse(inputContent);
  } catch (error) {
    console.error("❌ 读取input.json失败:", error);
    process.exit(1);
  }
}



// 检查服务器健康状态
async function checkHealth() {
  try {
    console.log("🔍 检查服务器健康状态...");
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log("✅ 服务器健康检查通过:", response.data.message);
    return true;
  } catch (error) {
    console.log("❌ 服务器未启动，请先运行: npm run server");
    return false;
  }
}

// 测试品牌价值评估API
async function testBrandEvaluation(brandData: any) {
  try {
    console.log("\n🎯 开始品牌价值评估测试...");
    console.log("测试品牌:", brandData.brand_name);

    const startTime = Date.now();
    const response = await axios.post(
      `${API_BASE_URL}/api/brand/evaluate`,
      brandData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const endTime = Date.now();

    if (response.data.success) {
      console.log("✅ 品牌价值评估成功!");
      console.log(`⏱️  评估耗时: ${endTime - startTime}ms`);
      console.log("\n📊 评估结果摘要:");
      console.log("品牌名称:", response.data.data.brand_name);
      console.log("评估日期:", response.data.data.evaluation_date);
      console.log(
        "品牌等级:",
        response.data.data.brandz_evaluation.brand_grade
      );
      console.log(
        "BrandZ价值:",
        response.data.data.brandz_evaluation.brandz_value
      );
      console.log(
        "一致性等级:",
        response.data.data.consistency_evaluation.grade
      );
      console.log(
        "一致性分数:",
        response.data.data.consistency_evaluation.total_score
      );

      // 保存测试结果
      const resultPath = path.join(__dirname, "api-test-result.json");
      fs.writeFileSync(
        resultPath,
        JSON.stringify(response.data.data, null, 2),
        "utf-8"
      );
      console.log(`\n💾 测试结果已保存到: ${resultPath}`);

      return response.data;
    } else {
      console.error("❌ 品牌价值评估失败:", response.data.error);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ API请求失败:");
      console.error("状态码:", error.response?.status);
      console.error("错误信息:", error.response?.data?.error || error.message);
    } else {
      console.error("❌ 未知错误:", error);
    }
    return null;
  }
}


// 主测试函数
async function runTests() {
  console.log("🚀 开始HTTP API测试\n");
  console.log("=".repeat(50));

  // 检查服务器状态
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.log("\n💡 请先启动服务器:");
    console.log("   npm run server");
    console.log("\n然后重新运行测试:");
    console.log("   npx ts-node src/test-api.ts");
    return;
  }
  // 加载测试数据
  const testData = loadTestData();

  // 执行品牌评估测试
  const result = await testBrandEvaluation(testData);

  console.log("\n" + "=".repeat(50));
  if (result) {
    console.log("🎉 所有测试完成! API服务运行正常");
  } else {
    console.log("⚠️  测试完成，但存在问题，请检查日志");
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch((error) => {
    console.error("💥 测试运行失败:", error);
    process.exit(1);
  });
}

export { runTests, testBrandEvaluation, checkHealth };
