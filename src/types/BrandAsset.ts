/**
 * 品牌资产类型定义
 * 统一使用BrandInputData作为主要数据结构
 */

// 品牌环境信息
export interface BrandEnvironment {
  name: string;
  description: string;
  industry: string;
  category: string;
  market: string;
  geography: string;
  news: string;
  policy: string;
}

// 目标用户画像
export interface BrandTA {
  name: string;
  description: string;
  avatar: string;
  insight: string;
  behavior: string;
  model: string;
  comments: string[];
}

// 竞争对手信息
export interface BrandRival {
  name: string;
  description: string;
  market_position: string;
  key_advantages: string[];
  differentiation_points: string[];
}

// 品牌定位
export interface BrandPosition {
  position: string;
  forwhom: string;
  what: string;
  whyus: string;
}

// 品牌承诺
export interface BrandPromise {
  promise: Record<string, string>;
  rtb: string[];
}

// 品牌主张
export interface BrandProposition {
  value: string;
  vision: string;
  mission: string[];
}

// 品牌表达
export interface BrandExpression {
  slogan: string[];
  languageStyle: string[];
  colorStyle: string[];
  typographyStyle: string[];
  layoutStyle: string[];
  symbolStyle: string[];
  toneStyle: string[];
}

// 品牌档案
export interface BrandProfile {
  promises: BrandPromise;
  proposition: BrandProposition;
  expression: BrandExpression;
}

// 渠道信息
export interface BrandChannel {
  channel: string[];
  channel_type: string[];
  channel_name: string[];
  channel_description: string[];
}

// 产品信息
export interface BrandProduct {
  name: string;
  description: string;
  price: string;
}

// 品牌体验
export interface BrandExperience {
  touchpoint_consistency: string[];
  customer_journey: string[];
  service_standards: string[];
  experience_quality: string[];
  consistency_across_channels: string[];
}

// 客户反馈
export interface BrandCustomerFeedback {
  satisfaction_ratings: Record<string, number>;
  brand_perception: string[];
  improvement_suggestions: string[];
  loyalty_indicators: string[];
  word_of_mouth: string[];
}

// 竞争分析
export interface BrandCompetitiveAnalysis {
  main_competitors: BrandRival[];
  competitive_advantages: string[];
  market_differentiation: string[];
  positioning_comparison: Record<string, string>;
  unique_selling_propositions: string[];
}

// 市场研究
export interface BrandMarketResearch {
  market_trends: string[];
  consumer_insights: string[];
  brand_awareness: Record<string, number>;
  market_share_data: Record<string, number>;
  growth_opportunities: string[];
}

// 品牌传播
export interface BrandCommunication {
  key_messages: string[];
  communication_themes: string[];
  content_style_guide: Record<string, string>;
  messaging_consistency: string[];
  cross_platform_alignment: string[];
}

// 财务数据
export interface BrandFinancialData {
  revenue: number;
  revenue_growth: number;
  profit_margin: number;
  market_share: number;
  brand_image_level: string;
  user_repurchase_rate: number;
  store_rating: number;
  food_safety: string;
  member_count: number;
  user_reviews: string;
}

// 用户画像详情
export interface UserPersona {
  id: string;
  title: string;
  avatar: string;
  name: string;
  age_gender: string;
  percentage_in_group: string;
  description: string;
  pain_points: string[];
  user_characteristics: Array<{
    keyword: string;
    percentage: number;
  }>;
  user_scenarios: string[];
}

// 品牌定位详情
export interface BrandPositioning {
  title: string;
  description: string;
  we_believe: {
    title: string;
    points: string[];
  };
  we_oppose: {
    title: string;
    points: string[];
  };
  brand_mission: {
    title: string;
    description: string;
  };
  why_choose_us: {
    title: string;
    reason: string;
    statement: string;
    additional_info: string;
  };
}

// 品牌表达详情
export interface BrandExpressionDetail {
  title: string;
  description: string;
  language_style: {
    title: string;
    options: string[];
  };
  brand_slogan: {
    title: string;
    slogan: string;
  };
  color_style: {
    title: string;
    description: string;
    palettes: Array<{
      name: string;
      primary_color: string;
      secondary_color: string;
      background_color: string;
      secondary_background_color: string;
    }>;
  };
  tone: {
    title: string;
    description: string;
  };
  icon: {
    placeholder: string;
  };
  font_layout: {
    placeholder: string;
  };
  web_link: {
    url: string;
  };
}

// 用户画像集合
export interface UserPersonas {
  title: string;
  description: string;
  personas: UserPersona[];
}

// 品牌资产详情
export interface BrandAssets {
  title: string;
  description: string;
  brand_image: {
    title: string;
    description: string;
    brand_positioning: BrandPositioning;
    brand_expression: BrandExpressionDetail;
  };
  user_personas: UserPersonas;
}

// 主要输入数据结构（对应input.json）
export interface BrandInputData {
  brand_name: string;
  brand_assets: BrandAssets;
  financial_data?: BrandFinancialData;
  competitive_analysis?: BrandCompetitiveAnalysis;
  market_research?: BrandMarketResearch;
  communication?: BrandCommunication;
  experience?: BrandExperience;
  customer_feedback?: BrandCustomerFeedback;
}

// 为了向后兼容，保留BrandAsset别名
export type BrandAsset = BrandInputData; 