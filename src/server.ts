/**
 * Express服务器 - 品牌价值评估API
 */

import express, { Request, Response, NextFunction } from 'express';
import { brand_valuate, BrandInputData } from './index';

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
    message: '品牌价值评估服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 品牌价值评估接口
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

    console.log(`开始评估品牌: ${brandData.brand_name}`);
    
    // 执行品牌价值评估
    const result = await brand_valuate(brandData);
    
    if (result.success) {
      console.log(`品牌评估完成: ${brandData.brand_name}`);
      res.json(result);
    } else {
      console.error(`品牌评估失败: ${brandData.brand_name}`, result.error);
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
    availableEndpoints: ['/health', '/api/brand/evaluate']
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 品牌价值评估服务器启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
});

export default app;