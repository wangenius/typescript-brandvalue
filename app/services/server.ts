/**
 * Express服务器 - 品牌价值评测API
 */

import express, { Request, Response, NextFunction } from 'express';
import { brand_valuate, BrandInputData, generateBrandAsset } from './index';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS支持
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 健康检查接口
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: '品牌价值评测服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 品牌价值评测接口
app.post('/api/brand/evaluate', async (req: Request, res: Response) => {
  try {
    const brandData: BrandInputData = req.body;
    
    // 基本数据验证
    if (!brandData || !brandData.brand_name || !brandData.brand_assets) {
      return res.status(400).json({
        success: false,
        error: '请提供完整的品牌数据，包括brand_name和brand_assets字段'
      });
    }

    console.log(`开始评测品牌: ${brandData.brand_name}`);
    
    // 执行品牌价值评测
    const result = await brand_valuate(brandData);
    
    if (result.success) {
      console.log(`品牌评测完成: ${brandData.brand_name}`);
      res.json(result);
    } else {
      console.error(`品牌评测失败: ${brandData.brand_name}`, result.error);
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    });
  }
});

// 品牌资产生成接口
app.post('/api/brand/generate', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    
    // 基本数据验证
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的品牌内容文本（content字段）'
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        error: '品牌内容文本过长，请控制在10000字符以内'
      });
    }

    console.log(`开始生成品牌资产，内容长度: ${content.length}`);
    
    // 执行品牌资产生成
    const brandAsset = await generateBrandAsset(content);
    
    console.log(`品牌资产生成完成: ${brandAsset.brand_name}`);
    res.json({
      success: true,
      data: brandAsset
    });
    
  } catch (error) {
    console.error('品牌资产生成失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '品牌资产生成失败'
    });
  }
});

// 错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('未处理的错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 404处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    availableEndpoints: ['/health', '/api/brand/evaluate', '/api/brand/generate']
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 品牌价值评测服务器启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
});

export default app;