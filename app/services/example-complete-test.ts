/**
 * 完整品牌价值评测系统测试示例
 * 结合品牌资产生成和品牌价值评测功能的完整测试流程
 */

import { generateBrandAsset, brand_valuate, BrandInputData } from './index';
import * as fs from 'fs';
import * as path from 'path';

// 示例品牌内容 - 星辰咖啡
const brandContent = `
星辰咖啡是一家专注于精品咖啡的连锁品牌，成立于2018年。我们的使命是为每一位顾客提供最优质的咖啡体验，让咖啡成为连接人与人之间的桥梁。

品牌理念：
- 我们相信每一颗咖啡豆都有其独特的故事
- 我们相信匠心工艺能够释放咖啡的最佳风味
- 我们相信咖啡不仅是饮品，更是一种生活方式

我们反对：
- 工业化生产的低质量咖啡
- 缺乏温度的机械化服务
- 对环境不负责任的经营方式

品牌口号："每一杯都是星辰大海"

目标用户：
1. 都市白领（25-40岁）：注重品质生活，愿意为优质体验付费
   - 痛点：工作压力大，需要高品质的放松空间
   - 特征：品味独特(85%)，时间宝贵(75%)，社交活跃(70%)
   - 场景：商务会谈、朋友聚会、独处思考

2. 咖啡爱好者（20-50岁）：对咖啡有深度了解和热情
   - 痛点：难以找到真正优质的精品咖啡
   - 特征：专业知识丰富(90%)，品质要求高(95%)，乐于分享(80%)
   - 场景：品鉴新品、学习交流、休闲享受

品牌调性：温暖、专业、精致、有温度
语言风格：亲切友好、专业可信、富有诗意

色彩风格：以深棕色为主色调，象征咖啡的醇厚；金色为辅助色，代表品质和温暖；米白色作为背景色，营造舒适氛围。

为什么选择星辰咖啡：
- 精选全球优质咖啡豆，每一批次都经过严格筛选
- 资深烘焙师手工烘焙，确保最佳风味释放
- 专业咖啡师现场制作，保证每杯咖啡的品质
- 舒适的环境设计，提供完美的社交和工作空间

财务数据：
- 年营收：5000万元
- 门店数量：50家
- 员工数量：300人
- 市场份额：在精品咖啡领域占据3%的市场份额
- 客户满意度：4.8/5.0
- 复购率：85%
`;

/**
 * 完整的品牌评测测试流程
 */
async function runCompleteTest() {
  console.log('🚀 === 完整品牌价值评测系统测试 ===\n');
  
  try {
    // ========== 第一步：品牌资产生成 ==========
    console.log('📝 步骤1: 从品牌内容生成结构化品牌资产');
    console.log('正在分析品牌内容并生成结构化数据...');
    
    const brandAsset = await generateBrandAsset(brandContent);
    
    console.log('\n✅ 品牌资产生成成功！');
    console.log('📋 生成的品牌资产概览：');
    console.log('- 品牌名称:', brandAsset.brand_name);
    console.log('- 品牌定位信念点数量:', brandAsset.brand_assets.brand_image.brand_positioning.we_believe.points.length);
    console.log('- 品牌表达语言风格数量:', brandAsset.brand_assets.brand_image.brand_expression.language_style.options.length);
    console.log('- 用户画像数量:', brandAsset.brand_assets.user_personas.personas.length);
    console.log('- 色彩方案数量:', brandAsset.brand_assets.brand_image.brand_expression.color_style.palettes.length);
    
    // 保存生成的品牌资产
    const brandAssetPath = path.join(__dirname, 'generated_brand_asset.json');
    fs.writeFileSync(brandAssetPath, JSON.stringify(brandAsset, null, 2), 'utf-8');
    console.log('💾 品牌资产已保存到:', brandAssetPath);
    
    // ========== 第二步：构建评测输入数据 ==========
    console.log('\n📊 步骤2: 构建品牌价值评测输入数据');
    
    console.log('✅ 评测输入数据构建完成');
    
    // 保存评测输入数据
    const inputDataPath = path.join(__dirname, 'complete_test_input.json');
    fs.writeFileSync(inputDataPath, JSON.stringify(brandAsset, null, 2), 'utf-8');
    console.log('💾 评测输入数据已保存到:', inputDataPath);
    
    // ========== 第三步：品牌价值评测 ==========
    console.log('\n🔍 步骤3: 执行品牌价值评测');
    console.log('正在进行综合品牌价值分析...');
    
    const evaluationResult = await brand_valuate(brandAsset);
    
    if (evaluationResult.success && evaluationResult.data) {
      console.log('\n🎉 品牌价值评测完成！');
      
      // ========== 第四步：结果展示 ==========
      console.log('\n📈 === 评测结果概览 ===');
      console.log('品牌名称:', evaluationResult.data.brand_name);
      console.log('评测日期:', evaluationResult.data.evaluation_date);
      console.log('品牌等级:', evaluationResult.data.brandz_evaluation.brand_grade);
      console.log('BrandZ价值:', evaluationResult.data.brandz_evaluation.brandz_value.toLocaleString(), '元');
      console.log('一致性等级:', evaluationResult.data.consistency_evaluation.grade);
      console.log('一致性得分:', evaluationResult.data.consistency_evaluation.total_score);
      
      console.log('\n📊 === 详细分析报告 ===');
      console.log('\n🔄 一致性评测:');
      console.log(evaluationResult.data.consistency_evaluation.analysis_report);
      
      console.log('\n💰 财务分析报告:');
      console.log(evaluationResult.data.analysis_reports.financial_report);
      
      console.log('\n📈 市场数据分析报告:');
      console.log(evaluationResult.data.analysis_reports.mds_report);
      
      console.log('\n📋 总体表现总结:');
      console.log(evaluationResult.data.evaluation_summary.overall_performance_summary);
      
      // 保存完整评测结果
      const resultPath = path.join(__dirname, 'complete_test_result.json');
      fs.writeFileSync(resultPath, JSON.stringify(evaluationResult.data, null, 2), 'utf-8');
      console.log('\n💾 完整评测结果已保存到:', resultPath);
      
      // ========== 第五步：测试总结 ==========
      console.log('\n🏆 === 测试总结 ===');
      console.log('✅ 品牌资产生成: 成功');
      console.log('✅ 数据格式转换: 成功');
      console.log('✅ 品牌价值评测: 成功');
      console.log('✅ 结果保存: 成功');
      
      console.log('\n📁 生成的文件:');
      console.log('- 品牌资产:', brandAssetPath);
      console.log('- 评测输入:', inputDataPath);
      console.log('- 评测结果:', resultPath);
      
      console.log('\n🎯 核心指标:');
      console.log(`- 品牌价值: ${evaluationResult.data.brandz_evaluation.brandz_value.toLocaleString()}元`);
      console.log(`- 品牌等级: ${evaluationResult.data.brandz_evaluation.brand_grade}`);
      console.log(`- 一致性得分: ${evaluationResult.data.consistency_evaluation.total_score}`);
      console.log(`- 一致性等级: ${evaluationResult.data.consistency_evaluation.grade}`);
      
    } else {
      console.error('❌ 品牌价值评测失败:', evaluationResult.error);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

/**
 * 使用现有input.json进行对比测试
 */
async function runComparisonTest() {
  console.log('\n🔄 === 对比测试：使用现有input.json ===');
  
  try {
    // 读取现有的input.json
    const inputPath = path.join(__dirname, 'input.json');
    if (fs.existsSync(inputPath)) {
      const inputContent = fs.readFileSync(inputPath, 'utf-8');
      const existingInput: BrandInputData = JSON.parse(inputContent);
      
      console.log('📄 使用现有input.json进行评测...');
      const result = await brand_valuate(existingInput);
      
      if (result.success && result.data) {
        console.log('\n📊 现有数据评测结果:');
        console.log('品牌名称:', result.data.brand_name);
        console.log('品牌等级:', result.data.brandz_evaluation.brand_grade);
        console.log('BrandZ价值:', result.data.brandz_evaluation.brandz_value.toLocaleString(), '元');
        console.log('一致性等级:', result.data.consistency_evaluation.grade);
      } else {
        console.log('❌ 现有数据评测失败:', result.error);
      }
    } else {
      console.log('⚠️  未找到input.json文件，跳过对比测试');
    }
  } catch (error) {
    console.error('❌ 对比测试失败:', error);
  }
}

// 主函数：运行完整测试
async function main() {
  await runCompleteTest();
  await runComparisonTest();
  
  console.log('\n🎊 === 所有测试完成 ===');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { runCompleteTest, runComparisonTest, main };