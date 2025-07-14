# 品牌价值评估系统

## 使用方法

### 1. 安装依赖
```bash
npm install
```

### 2. 运行测试示例
```bash
npx ts-node src/example.ts
```

### 2.1 启动API服务器
```bash
npm run server
```
服务器将在 http://localhost:3000 启动

### 2.2 测试HTTP API
```bash
# 在另一个终端窗口运行
npm run test-api
```
自动测试所有API接口，使用input.json数据

### 3. 使用方式

#### 3.1 直接调用
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

#### 3.2 HTTP API调用

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

# 获取示例数据
curl http://localhost:3000/api/brand/example

# 健康检查
curl http://localhost:3000/health

# API文档
curl http://localhost:3000/api/docs
```

### 4. 输入数据格式 (Input)
```typescript
interface BrandInputData {
  brand_name: string;                    // 品牌名称
  brand_assets: {                       // 品牌资产
    title: string;
    description: string;
    brand_image: {
      brand_positioning: {              // 品牌定位
        we_believe: { points: string[] };
        we_oppose: { points: string[] };
        brand_mission: { description: string };
        // ... 更多定位信息
      };
      brand_expression: {               // 品牌表达
        language_style: { options: string[] };
        brand_slogan: { slogan: string };
        color_style: { palettes: any[] };
        // ... 更多表达信息
      };
    };
    user_personas: {                    // 用户画像
      personas: Array<{
        name: string;
        age_gender: string;
        pain_points: string[];
        user_characteristics: Array<{
          keyword: string;
          percentage: number;
        }>;
        // ... 更多用户信息
      }>;
    };
  };
  // 可选字段
  financial_data?: any;                 // 财务数据
  competitive_analysis?: any;           // 竞争分析
  market_research?: any;                // 市场研究
}
```

### 5. 输出结果格式 (Output)
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

### 6. 示例数据
完整的输入数据示例请参考 `src/input.json` 文件。