/**
 * 品牌资产生成API测试脚本
 * 测试新的 /api/brand/generate 接口
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// 配置axios禁用代理，避免代理干扰localhost访问
axios.defaults.proxy = false;

// 测试用的品牌内容
const testBrandContent = `
绿野仙踪茶业是一家专注于有机茶叶的品牌，成立于2020年。我们致力于为消费者提供最纯净、最健康的茶叶产品。

品牌使命：传承千年茶文化，守护自然纯净之美

品牌理念：
- 我们相信自然的力量能够带来最纯正的味道
- 我们相信传统工艺与现代科技的完美结合
- 我们相信每一片茶叶都承载着大地的馈赠

我们反对：
- 使用化学农药和添加剂
- 破坏生态环境的种植方式
- 缺乏文化内涵的商业化经营

品牌口号："一叶知秋，品味自然"

目标用户群体：
1. 健康生活追求者（30-50岁）
   - 注重食品安全和健康
   - 愿意为高品质产品付费
   - 痛点：市面上茶叶品质参差不齐，难以辨别真正的有机产品
   - 特征：健康意识强(90%)，品质要求高(85%)，环保理念(80%)
   - 使用场景：日常养生、商务招待、礼品赠送

2. 茶文化爱好者（25-60岁）
   - 对茶文化有深度了解和兴趣
   - 追求茶叶的文化价值和精神享受
   - 痛点：传统茶文化在现代社会中逐渐式微
   - 特征：文化素养高(95%)，传统偏好(85%)，社交活跃(75%)
   - 使用场景：茶艺表演、文化交流、冥想静心

品牌调性：自然、纯净、文雅、传统
语言风格：诗意优雅、温和亲切、专业可信

色彩设计：
- 主色调：深绿色，象征茶叶的自然本色
- 辅助色：金黄色，代表茶汤的醇厚
- 背景色：米白色，营造清雅氛围
- 点缀色：棕色，体现传统工艺

为什么选择绿野仙踪：
- 严格的有机认证，确保每一片茶叶都来自无污染的生态茶园
- 传承古法制茶工艺，结合现代保鲜技术
- 专业的茶艺师团队，提供个性化的茶叶推荐
- 完善的溯源体系，让消费者了解茶叶的完整生产过程
`;

async function testBrandGeneratorAPI() {
  console.log('=== 品牌资产生成API测试 ===\n');
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查接口...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    const healthData = healthResponse.data;
    console.log('健康检查结果:', healthData.status === 'ok' ? '✅ 正常' : '❌ 异常');
    
    // 2. 测试品牌资产生成接口
    console.log('\n2. 测试品牌资产生成接口...');
    console.log('发送品牌内容长度:', testBrandContent.length, '字符');
    
    const generateResponse = await axios.post(`${API_BASE_URL}/api/brand/generate`, {
      content: testBrandContent
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const generateData = generateResponse.data;
    
    if (generateData.success) {
      console.log('✅ 品牌资产生成成功！');
      console.log('\n📋 生成结果概览：');
      console.log('- 品牌名称:', generateData.data.brand_name);
      console.log('- 品牌定位信念点:', generateData.data.brand_assets.brand_image.brand_positioning.we_believe.points.length, '个');
      console.log('- 品牌口号:', generateData.data.brand_assets.brand_image.brand_expression.brand_slogan.slogan);
      console.log('- 用户画像数量:', generateData.data.brand_assets.user_personas.personas.length, '个');
      console.log('- 色彩方案数量:', generateData.data.brand_assets.brand_image.brand_expression.color_style.palettes.length, '个');
      
      // 保存生成的结果到文件
      const fs = require('fs');
      const outputPath = './generated-brand-asset.json';
      fs.writeFileSync(outputPath, JSON.stringify(generateData.data, null, 2));
      console.log('\n💾 完整结果已保存到:', outputPath);
      
      // 3. 测试生成的数据是否可以用于品牌评测
      console.log('\n3. 测试生成的品牌资产是否可用于评测...');
      const evaluateResponse = await axios.post(`${API_BASE_URL}/api/brand/evaluate`, generateData.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const evaluateData = evaluateResponse.data;
      
      if (evaluateData.success) {
        console.log('✅ 生成的品牌资产可以成功用于评测！');
        console.log('- 一致性评测分数:', evaluateData.data.consistency_evaluation.total_score);
        console.log('- 一致性等级:', evaluateData.data.consistency_evaluation.grade);
        console.log('- BrandZ价值:', evaluateData.data.brandz_evaluation.brandz_value);
        console.log('- 品牌等级:', evaluateData.data.brandz_evaluation.brand_grade);
      } else {
        console.log('❌ 评测失败:', evaluateData.error);
      }
      
    } else {
      console.log('❌ 品牌资产生成失败:', generateData.error);
    }
    
    // 4. 测试错误情况
    console.log('\n4. 测试错误处理...');
    
    // 测试空内容
    try {
      const emptyResponse = await axios.post(`${API_BASE_URL}/api/brand/generate`, {
        content: ''
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const emptyData = emptyResponse.data;
      console.log('空内容测试:', emptyData.success ? '❌ 应该失败' : '✅ 正确拒绝');
    } catch (error) {
      console.log('空内容测试: ✅ 正确拒绝');
    }
    
    // 测试过长内容
    const longContent = 'a'.repeat(15000);
    try {
      const longResponse = await axios.post(`${API_BASE_URL}/api/brand/generate`, {
        content: longContent
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const longData = longResponse.data;
      console.log('过长内容测试:', longData.success ? '❌ 应该失败' : '✅ 正确拒绝');
    } catch (error) {
      console.log('过长内容测试: ✅ 正确拒绝');
    }
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.log('\n💡 请确保服务器已启动：npm run server');
  }
}

// 运行测试
if (require.main === module) {
  testBrandGeneratorAPI();
}

export { testBrandGeneratorAPI };