/**
 * 品牌资产生成器使用示例
 * 演示如何使用generateBrandAsset函数从长文本生成品牌资产
 */

import { generateBrandAsset } from './index';

// 示例品牌内容
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
`;

async function demonstrateGenerator() {
  console.log('=== 品牌资产生成器演示 ===\n');
  
  try {
    console.log('正在分析品牌内容并生成结构化数据...');
    
    // 调用generateBrandAsset函数
    const brandAsset = await generateBrandAsset(brandContent);
    
    console.log('\n✅ 品牌资产生成成功！\n');
    
    // 输出生成的品牌资产结构
    console.log('📋 生成的品牌资产结构：');
    console.log('品牌名称:', brandAsset.brand_name);
    console.log('品牌定位信念点数量:', brandAsset.brand_assets.brand_image.brand_positioning.we_believe.points.length);
    console.log('品牌表达语言风格数量:', brandAsset.brand_assets.brand_image.brand_expression.language_style.options.length);
    console.log('用户画像数量:', brandAsset.brand_assets.user_personas.personas.length);
    
    // 输出详细的JSON结构（格式化）
    console.log('\n📄 完整的品牌资产JSON：');
    console.log(JSON.stringify(brandAsset, null, 2));
    
    // 验证数据完整性
    console.log('\n🔍 数据完整性检查：');
    console.log('- 品牌名称:', brandAsset.brand_name ? '✅' : '❌');
    console.log('- 品牌定位:', brandAsset.brand_assets.brand_image.brand_positioning ? '✅' : '❌');
    console.log('- 品牌表达:', brandAsset.brand_assets.brand_image.brand_expression ? '✅' : '❌');
    console.log('- 用户画像:', brandAsset.brand_assets.user_personas.personas.length > 0 ? '✅' : '❌');
    console.log('- 色彩方案:', brandAsset.brand_assets.brand_image.brand_expression.color_style.palettes.length > 0 ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
  }
}

// 运行演示
if (require.main === module) {
  demonstrateGenerator();
}

export { demonstrateGenerator };