import * as dotenv from "dotenv";
import OpenAI from "openai";

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
  system_prompt: string;
}

export class LLM {
  private config: LLMConfig;
  private openai: OpenAI;

  constructor(config?: Partial<LLMConfig>) {
    this.config = this.loadFromEnv();
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // 初始化OpenAI客户端
    this.openai = new OpenAI({
      apiKey: this.config.api_key,
      baseURL: this.config.base_url || undefined,
    });
  }

  /**
   * 从环境变量加载配置
   */
  private loadFromEnv(): LLMConfig {
    return {
      api_key: process.env.LLM_API_KEY || "",
      model: process.env.LLM_MODEL || "qwen-plus-2025-04-28",
      base_url: process.env.LLM_BASE_URL || "",
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.3"),
      system_prompt: process.env.LLM_SYSTEM_PROMPT || "你是一个有用的AI助手。",
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
      ...config,
    };
  }

  /**
   * 获取文本响应
   */
  async text(message: string): Promise<string> {
    if (!this.isAvailable()) {
      return "LLM不可用";
    }

    try {
      // 调用真实的LLM API
      return await this.callLLMAPI(message);
    } catch (error) {
      console.error("LLM调用失败:", error);
      return `错误: ${error instanceof Error ? error.message : "未知错误"}`;
    }
  }

  /**
   * 获取JSON响应
   */
  async json(message: string): Promise<Record<string, any>> {
    if (!this.isAvailable()) {
      return { error: "LLM不可用" };
    }

    try {
      // 调用真实的LLM API
      const response = await this.callLLMAPI(message, true);

      try {
        const jsonResponse = JSON.parse(response);
        return jsonResponse;
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
      return { error: error instanceof Error ? error.message : "未知错误" };
    }
  }

  /**
   * 调用真实的LLM API - 使用OpenAI SDK
   */
  private async callLLMAPI(message: string, json?: boolean): Promise<string> {
    try {
      // 构建消息内容
      const userContent = json 
        ? `请以JSON格式返回结果。\n\n${message}` 
        : message;

      const params: any = {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: this.config.system_prompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        temperature: this.config.temperature,
      };

      // 只有支持response_format的模型才添加此参数
      // 检查模型是否为GPT-4或GPT-3.5系列
      const supportsResponseFormat = 
        this.config.model.includes('gpt-4') || 
        this.config.model.includes('gpt-3.5');
      
      if (json && supportsResponseFormat) {
        params.response_format = { type: "json_object" };
      }

      const completion = await this.openai.chat.completions.create(params);

      return completion.choices[0]?.message?.content || "无响应内容";
    } catch (error) {
      console.error("LLM调用失败:", error);
      throw error; // 抛出错误而不是返回错误字符串
    }
  }
}
