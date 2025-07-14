# 品牌价值评估系统

## 使用方法

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
复制环境变量配置文件并填入相应的API密钥：
```bash
cp .env-example .env
# 编辑 .env 文件，填入你的 LLM API 配置
```

### 3. 运行测试示例

#### 3.1 品牌价值评估示例
```bash
# 使用现有input.json数据进行品牌价值评估
npx ts-node src/example-brand-calculator.ts
```

#### 3.2 品牌资产生成示例
```bash
# 从品牌描述文本生成结构化品牌资产
npx ts-node src/example-brand-generator.ts
```

#### 3.3 完整测试流程
```bash
# 运行完整的品牌资产生成 + 价值评估流程
npx ts-node src/example-complete-test.ts
```

### 4. 使用方式

#### 4.1 品牌价值评估

**方式一：使用现有品牌资产数据**
```typescript
import { brand_valuate, BrandInputData } from './src/index';

// 使用示例数据或自定义数据
const result = await brand_valuate(brandData);

if (result.success) {
  console.log('评估结果:', result.data);
} else {
  console.error('评估失败:', result.error);
}
```

**方式二：从品牌描述生成资产并评估**
```typescript
import { generateBrandAsset, brand_valuate } from './src/index';

// 1. 从品牌描述生成结构化品牌资产
const brandContent = `
  你的品牌描述文本...
  包括品牌理念、目标用户、品牌调性等信息
`;

const brandAsset = await generateBrandAsset(brandContent);

// 2. 使用生成的品牌资产进行价值评估
const result = await brand_valuate(brandAsset);

if (result.success) {
  console.log('品牌价值:', result.data.brandz_evaluation.brandz_value);
  console.log('品牌等级:', result.data.brandz_evaluation.brand_grade);
  console.log('一致性等级:', result.data.consistency_evaluation.grade);
} else {
  console.error('评估失败:', result.error);
}
```

#### 4.2 品牌资产生成
```typescript
import { generateBrandAsset } from './src/index';

// 品牌描述文本
const brandContent = `
星辰咖啡是一家专注于精品咖啡的连锁品牌，成立于2018年。
我们的使命是为每一位顾客提供最优质的咖啡体验。

品牌理念：
- 我们相信每一颗咖啡豆都有其独特的故事
- 我们相信匠心工艺能够释放咖啡的最佳风味

目标用户：
1. 都市白领（25-40岁）：注重品质生活
2. 咖啡爱好者（20-50岁）：对咖啡有深度了解

品牌调性：温暖、专业、精致、有温度
语言风格：亲切友好、专业可信、富有诗意
色彩风格：深棕色主色调，金色辅助色，米白色背景
`;

// 生成结构化品牌资产
const brandAsset = await generateBrandAsset(brandContent);
console.log('生成的品牌资产:', brandAsset);
```

#### 4.3 HTTP API调用

**方式一：使用测试脚本（推荐）**
```bash
# 启动服务器
npm run server

# 在另一个终端运行测试
npm run test-api
```

**方式二：手动curl命令**
```bash
# 启动服务器
npm run server

# 品牌价值评估
curl -X POST http://localhost:3000/api/brand/evaluate \
  -H "Content-Type: application/json" \
  -d @src/input.json

# 健康检查
curl http://localhost:3000/health

```

### 5. 核心功能

#### 5.1 品牌资产生成 (generateBrandAsset)
从自然语言的品牌描述中自动生成结构化的品牌资产数据。

**输入**: 品牌描述文本（包含品牌理念、目标用户、调性等信息）
**输出**: 结构化的BrandInputData对象

#### 5.2 品牌价值评估 (brand_valuate)
对品牌资产进行综合评估，包括一致性分析和BrandZ价值计算。

**输入**: BrandInputData对象
**输出**: 包含品牌价值、等级、详细报告的评估结果

### 6. 数据格式说明

#### 6.1 输入数据格式 (BrandInputData = BrandAsset)
```typescript
interface BrandInputData {
  xxxxxx
}
```

#### 6.2 输出结果格式 (BrandValuationResult)
```typescript
interface BrandValuationResult {
  success: boolean;                     // 是否成功
  data?: {                             // 评估结果数据
    brand_name: string;                // 品牌名称
    evaluation_date: string;           // 评估日期
    
    // 一致性评估结果
    consistency_evaluation: {
      total_score: number;             // 总分
      grade: string;                   // 等级
      analysis_report: string;         // 分析报告
    };
    
    // BrandZ评估结果
    brandz_evaluation: {
      brandz_value: number;            // BrandZ价值
      brand_grade: string;             // 品牌等级
      financial_value_score: number;   // 财务价值分数
      brand_contribution_score: number; // 品牌贡献分数
      consistency_score: number;       // 一致性分数
    };
    
    // 详细报告
    analysis_reports: {
      consistency_report: string;      // 一致性报告
      financial_report: string;        // 财务报告
      mds_report: string;             // MDS报告
    };
    
    // 评估总结
    evaluation_summary: {
      consistency_grade: string;       // 一致性等级
      brandz_grade: string;           // BrandZ等级
      overall_performance_summary: string; // 总体表现总结
    };
  };
  error?: string;                      // 错误信息（失败时）
}
```

### 7. 示例数据和文件

- **`src/input.json`**: 完整的品牌输入数据示例
- **`src/example-brand-calculator.ts`**: 品牌价值评估使用示例
- **`src/example-brand-generator.ts`**: 品牌资产生成使用示例
- **`src/example-complete-test.ts`**: 完整测试流程示例

### 9. 注意事项

- 确保在 `.env` 文件中正确配置LLM API密钥
- 品牌描述文本越详细，生成的品牌资产质量越高
- 评估结果会保存为JSON文件，便于查看和分析
- 建议先运行示例了解系统功能，再进行自定义使用