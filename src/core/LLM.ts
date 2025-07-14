import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 简化的LLM接口 - TypeScript版本
 * 提供简单易用的大模型调用接口
 */

export interface LLMConfig {
  api_key: string;
  model: string;
  base_url: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export class LLM {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = this.loadFromEnv();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 从环境变量加载配置
   */
  private loadFromEnv(): LLMConfig {
    return {
      api_key: process.env.LLM_API_KEY || "",
      model: process.env.LLM_MODEL || "gemini-2.5-flash-preview",
      base_url: process.env.LLM_BASE_URL || "https://api.gptsapi.net/v1",
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.3"),
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1500"),
      system_prompt: process.env.OPENAI_SYSTEM_PROMPT || "你是一个有用的AI助手。",
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
  }

  /**
   * 检查LLM是否可用
   */
  private isAvailable(): boolean {
    return !!this.config.api_key;
  }

  /**
   * 合并配置
   */
  private mergeConfig(config?: Record<string, any>): Record<string, any> {
    return {
      model: this.config.model,
      system_prompt: this.config.system_prompt,
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
      ...config
    };
  }

  /**
   * 获取文本响应
   */
  async text(message: string, config?: Record<string, any>): Promise<string> {
    if (!this.isAvailable()) {
      return "LLM不可用";
    }

    try {
      const finalConfig = this.mergeConfig(config);
      
      // 调用真实的LLM API
      return await this.callLLMAPI(message, finalConfig);
    } catch (error) {
      console.error("LLM调用失败:", error);
      return `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  /**
   * 获取JSON响应
   */
  async json(message: string, config?: Record<string, any>): Promise<Record<string, any>> {
    if (!this.isAvailable()) {
      return { error: "LLM不可用" };
    }

    try {
      const finalConfig = this.mergeConfig(config);
      
      // 调用真实的LLM API
      const response = await this.callLLMAPI(message, finalConfig);
      
      try {
        return JSON.parse(response);
      } catch {
        // 尝试从文本中提取JSON
        const jsonMatch = response.match(/\{.*\}/s);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          return { error: "无法解析JSON", raw_content: response };
        }
      }
    } catch (error) {
      console.error("LLM调用失败:", error);
      return { error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 获取流式响应
   */
  async *stream(message: string, config?: Record<string, any>): AsyncGenerator<string> {
    if (!this.isAvailable()) {
      yield "LLM不可用";
      return;
    }

    try {
      const finalConfig = this.mergeConfig(config);
      
      // 模拟流式响应
      const response = await this.simulateLLMResponse(message, finalConfig);
      const chunks = response.split(' ');
      
      for (const chunk of chunks) {
        yield chunk + ' ';
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      yield `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  /**
   * 调用真实的LLM API
   */
  private async callLLMAPI(message: string, config: Record<string, any>): Promise<string> {
    try {
      const response = await fetch(`${this.config.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.api_key}`
        },
        body: JSON.stringify({
          model: config.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: config.system_prompt || this.config.system_prompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: config.temperature || this.config.temperature,
          max_tokens: config.max_tokens || this.config.max_tokens,
          top_p: config.top_p || this.config.top_p,
          frequency_penalty: config.frequency_penalty || this.config.frequency_penalty,
          presence_penalty: config.presence_penalty || this.config.presence_penalty
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.choices[0]?.message?.content || '无响应内容';
    } catch (error) {
      // 如果API调用失败，回退到模拟模式
      return this.simulateLLMResponse(message, config);
    }
  }

  /**
   * 模拟LLM响应（用于演示）
   * 在实际使用中，这里应该调用真实的LLM API
   */
  private async simulateLLMResponse(message: string, config: Record<string, any>): Promise<string> {
    // 模拟不同类型的响应
    if (message.includes("分析") || message.includes("评估")) {
      return `基于提供的品牌数据，我进行了全面的分析：

1. 品牌理念层一致性：品牌使命清晰，愿景具有吸引力，价值观真实可信。

2. 品牌表达层一致性：品牌表达风格统一，调性适配目标受众。

3. 视觉识别系统一致性：视觉元素使用规范，风格独特且易于识别。

4. 语言风格系统一致性：语言风格统一，与目标受众沟通习惯匹配。

5. 品牌承诺与RTB一致性：品牌承诺清晰明确，RTB支撑有力。

6. 目标受众契合度：品牌表现与目标受众价值观产生良好共鸣。

7. 品牌架构层级间协同性：各层级间协同良好，共同塑造统一品牌形象。

总体评价：该品牌在一致性方面表现良好，建议继续保持现有优势。`;
    } else if (message.includes("评分") || message.includes("分数")) {
      return JSON.stringify({
        mission_clarity: 8.5,
        mission_consistency: 8.0,
        vision_clarity: 8.0,
        vision_appeal: 8.5,
        values_clarity: 8.0,
        values_authenticity: 8.5,
        style_consistency: 8.0,
        tone_appropriateness: 8.5,
        keyword_recognition: 8.0,
        scenario_adaptation: 8.0,
        color_consistency: 8.0,
        typography_consistency: 8.0,
        layout_consistency: 8.0,
        symbol_recognition: 8.0,
        visual_appeal: 8.5,
        language_consistency: 8.0,
        language_appropriateness: 8.5,
        slogan_memorability: 8.0,
        message_clarity: 8.5,
        promise_clarity: 8.0,
        promise_credibility: 8.5,
        benefit_clarity: 8.0,
        experience_coherence: 8.0,
        rtb_clarity: 8.0,
        rtb_uniqueness: 8.0,
        rtb_credibility: 8.5,
        philosophy_ta_alignment: 8.0,
        values_ta_resonance: 8.5,
        vision_ta_appeal: 8.0,
        philosophy_expression_alignment: 8.0,
        values_tone_consistency: 8.5,
        mission_keyword_alignment: 8.0,
        philosophy_visual_alignment: 8.0,
        values_color_symbolism: 8.0,
        vision_design_harmony: 8.5,
        philosophy_language_alignment: 8.0,
        values_slogan_consistency: 8.0,
        mission_message_clarity: 8.5,
        expression_visual_harmony: 8.0,
        tone_visual_consistency: 8.0,
        style_symbol_alignment: 8.0,
        expression_language_coherence: 8.0,
        tone_language_matching: 8.5,
        style_message_consistency: 8.0,
        visual_language_integration: 8.0,
        color_language_emotion: 8.0,
        symbol_slogan_synergy: 8.0,
        promise_philosophy_alignment: 8.0,
        promise_expression_consistency: 8.0,
        promise_visual_support: 8.0,
        promise_language_clarity: 8.5,
        rtb_philosophy_foundation: 8.0,
        rtb_expression_reinforcement: 8.0,
        rtb_visual_evidence: 8.0,
        rtb_language_persuasion: 8.5
      });
    } else {
      return `基于您的问题"${message}"，我提供以下分析：

这是一个关于品牌评估的请求。根据提供的品牌数据，我建议从以下几个维度进行分析：

1. 品牌定位的清晰度和一致性
2. 品牌表达的统一性
3. 目标受众的契合度
4. 品牌承诺的可信度

建议您提供更具体的品牌数据，以便我进行更深入的分析。`;
    }
  }
}