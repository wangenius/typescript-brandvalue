# 品牌价值评估系统 - TypeScript版本

基于凯度BrandZ模型和品牌一致性评估的品牌价值评估系统，使用TypeScript实现。

## 功能特性

- **品牌一致性评估**: 基于品牌屋模型的一致性分析
- **BrandZ价值计算**: 基于凯度BrandZ模型的品牌价值评估
- **LLM集成**: 支持大语言模型分析
- **模块化设计**: 清晰的模块接口，易于扩展
- **TypeScript支持**: 完整的类型定义

## 安装

```bash
npm install
```

## 构建

```bash
npm run build
```

## 使用方法

### 基本用法

```typescript
import { brand_valuate, BrandInputData } from './dist/index';

// 准备输入数据
const input: BrandInputData = {
  brand_assets: {
    title: "品牌资产",
    description: "品牌描述...",
    brand_image: {
      // ... 品牌形象数据
    },
    user_personas: {
      // ... 用户画像数据
    }
  }
};

// 执行评估
const result = await brand_valuate(input);

if (result.success) {
  console.log("品牌名称:", result.data.brand_name);
  console.log("品牌等级:", result.data.brandz_evaluation.brand_grade);
  console.log("一致性等级:", result.data.consistency_evaluation.grade);
  console.log("BrandZ价值:", result.data.brandz_evaluation.brandz_value);
} else {
  console.error("评估失败:", result.error);
}
```

### 同步版本

```typescript
import { brand_valuate_sync } from './dist/index';

const result = brand_valuate_sync(input);
```

### 直接使用核心模块

```typescript
import { 
  BrandZCalculator, 
  BrandConsistencyEvaluator, 
  BrandContentAnalyzer,
  DataConverter 
} from './dist/index';

// 数据转换
const brandAsset = DataConverter.convertToBrandAsset(input);

// 品牌一致性分析
const contentAnalyzer = new BrandContentAnalyzer();
const analysisResult = await contentAnalyzer.analyzeBrandConsistency(brandAsset);

// 一致性评估
const consistencyEvaluator = new BrandConsistencyEvaluator();
const consistencyResult = await consistencyEvaluator.evaluateBrandHouse(
  analysisResult.metrics, 
  analysisResult.report
);

// BrandZ价值评估
const brandzCalculator = new BrandZCalculator();
const comprehensiveReport = await brandzCalculator.evaluateBrandComprehensive(brandAsset);
```

## 输入数据格式

输入数据格式参考 `backend/input.json`，主要包含：

- `brand_assets`: 品牌资产信息
  - `description`: 品牌描述
  - `brand_image`: 品牌形象
    - `brand_positioning`: 品牌定位
    - `brand_expression`: 品牌表达
  - `user_personas`: 用户画像

## 输出结果

评估结果包含：

- **品牌名称**: 评估的品牌名称
- **评估日期**: 评估执行时间
- **方法论**: 使用的评估方法
- **一致性评估**: 品牌一致性分析结果
- **BrandZ评估**: 品牌价值评估结果
- **分析报告**: 详细的分析报告
- **评估总结**: 总体评价和建议

## 核心模块

### BrandZCalculator
基于凯度BrandZ模型的品牌价值计算器

### BrandConsistencyEvaluator
品牌一致性评估器，基于品牌屋模型

### BrandContentAnalyzer
品牌内容分析器，使用LLM进行智能分析

### LLM
大语言模型接口，支持文本和JSON响应

### DataConverter
数据转换器，将输入数据转换为BrandAsset格式

## 开发

### 开发模式

```bash
npm run dev
```

### 测试

```bash
npm test
```

### 清理

```bash
npm run clean
```

## 与Python版本的区别

1. **模块化接口**: 提供 `brand_valuate(input)` 的简单接口
2. **TypeScript类型**: 完整的类型定义和类型安全
3. **异步支持**: 支持异步评估操作
4. **简化部署**: 不需要服务器，直接作为模块使用

## 许可证

MIT License 