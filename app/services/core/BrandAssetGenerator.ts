import { LLM } from "./LLM";
import { BrandInputData } from "../types/BrandAsset";

/**
 * 品牌资产生成器
 * 使用大模型从长文本内容生成结构化的品牌资产数据
 */
export class BrandAssetGenerator {
  /**
   * 从长文本内容生成品牌资产
   * @param content 包含品牌信息的长文本
   * @returns 结构化的品牌资产数据
   */
  async generateBrandAsset(content: string): Promise<BrandInputData> {
    try {
      console.log("开始分步生成品牌资产...");

      // 步骤1：生成基本品牌信息
      const basicInfo = await this.generateBasicBrandInfo(content);
      console.log("✅ 基本品牌信息生成完成");
      console.log("基本品牌信息:", basicInfo);

      // 步骤2-4：并行生成品牌定位、表达和用户画像（性能优化）
      console.log("🚀 开始并行生成品牌定位、表达和用户画像...");
      const [positioning, expression, personas] = await Promise.all([
        this.generateBrandPositioning(content, basicInfo.brand_name),
        this.generateBrandExpression(content, basicInfo.brand_name),
        this.generateUserPersonas(content, basicInfo.brand_name)
      ]);
      
      console.log("✅ 品牌定位生成完成");
      console.log("品牌定位:", positioning);
      console.log("✅ 品牌表达生成完成");
      console.log("品牌表达:", expression);
      console.log("✅ 用户画像生成完成");
      console.log("用户画像:", personas);

      // 步骤5：组合所有数据
      const brandAsset = this.assembleBrandAsset(
        basicInfo,
        positioning,
        expression,
        personas
      );
      console.log("品牌资产:", brandAsset);

      // 步骤6：验证和补全缺失字段
      const validatedData = await this.validateAndFixMissingFields(
        brandAsset,
        content
      );
      console.log("✅ 品牌资产验证和补全完成");
      console.log("验证后的品牌资产:", validatedData);

      return validatedData;
    } catch (error) {
      console.error("生成品牌资产失败:", error);
      throw new Error(
        `生成品牌资产失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  // 可选：对外暴露装配与校验（暂不用于路由）
  public assembleAsset(
    basicInfo: any,
    positioning: any,
    expression: any,
    personas: any
  ): any {
    return this.assembleBrandAsset(basicInfo, positioning, expression, personas);
  }

  public async validateAsset(brandAsset: any, originalContent: string): Promise<BrandInputData> {
    return await this.validateAndFixMissingFields(brandAsset, originalContent);
  }

  /**
   * 生成基本品牌信息
   */
  public async generateBasicBrandInfo(content: string): Promise<any> {
    const prompt = `请仔细分析以下品牌内容，并提取基本信息：
${content}
请根据上述内容分析并生成JSON格式的基本品牌信息, 包含以下结构:
重要：请根据品牌内容提取真实具体的信息，不要使用模板化的占位符文字。
请返回JSON格式:
{
  "brand_name": "品牌名称",
  "brand_description": "品牌简介",
  "industry": "所属行业",
  "main_products": ["主要产品1", "主要产品2"]
}

只返回JSON, 不要其他文字。`;

    const response = await new LLM({
      temperature: 0.5,
      system_prompt: "你是品牌分析专家，请提取品牌基本信息。",
    }).json(prompt);

    return this.extractJsonFromResponse(response);
  }

  /**
   * 生成品牌定位
   */
  public async generateBrandPositioning(
    content: string,
    brandName: string
  ): Promise<any> {
    const prompt = `请仔细分析以下${brandName}的品牌内容，并基于内容生成具体的品牌定位信息：

${content}
请根据上述内容分析并生成JSON格式的品牌定位, 包含以下结构:
- title: 固定为"品牌定位"
- description: 根据品牌内容总结的具体定位描述
- we_believe: 包含title"我们相信"和3个具体信念点的数组
- we_oppose: 包含title"我们反对"和3个具体反对点的数组  
- brand_mission: 包含title"品牌使命"和具体使命描述
- why_choose_us: 包含title"为什么选择我们"、具体选择理由、价值主张和补充信息

重要：请根据品牌内容生成真实具体的内容，不要使用模板化的占位符文字。

请返回JSON格式参考:
{
  "title": "品牌定位",
  "description": "品牌定位描述",
  "we_believe": {
    "title": "我们相信",
    "points": ["信念点1", "信念点2", "信念点3"]
  },
  "we_oppose": {
    "title": "我们反对",
    "points": ["反对点1", "反对点2", "反对点3"]
  },
  "brand_mission": {
    "title": "品牌使命",
    "description": "品牌使命描述"
  },
  "why_choose_us": {
    "title": "为什么选择我们",
    "reason": "选择理由",
    "statement": "价值主张",
    "additional_info": "补充信息"
  }
}

只返回JSON，不要其他文字。`;

    const response = await new LLM({
      system_prompt: "你是品牌定位专家，请生成品牌定位信息。",
    }).json(prompt);

    return this.extractJsonFromResponse(response);
  }

  /**
   * 生成品牌表达
   */
  public async generateBrandExpression(
    content: string,
    brandName: string
  ): Promise<any> {
    const prompt = `请仔细分析以下${brandName}的品牌内容，并基于内容生成具体的品牌表达信息：

${content}
请根据上述内容分析并生成JSON格式的品牌表达，包含以下结构：
- title: 固定为"品牌表达"
- description: 根据品牌内容总结的具体表达描述
- language_style: 包含title"语言风格"和3个具体语言风格选项的数组
- brand_slogan: 包含title"品牌口号"和根据品牌特色创作的具体口号
- color_style: 包含title"色彩风格"、具体描述和调色板数组，调色板包含主色调名称和具体的十六进制颜色值
- tone: 包含title"品牌调性"和具体的调性描述
- icon: 包含合适的图标占位符描述
- font_layout: 包含合适的字体布局占位符描述
- web_link: 包含品牌相关的网站链接（如果内容中有提及）

重要：
1. 请根据品牌内容生成真实具体的内容，不要使用模板化的占位符文字
2. 颜色值请使用标准十六进制格式（如#FF5733）
3. 语言风格要体现品牌特色
4. 品牌口号要朗朗上口且符合品牌定位

请返回JSON格式：
{
  "title": "品牌表达",
  "description": "品牌表达描述",
  "language_style": {
    "title": "语言风格",
    "options": ["风格1", "风格2", "风格3"]
  },
  "brand_slogan": {
    "title": "品牌口号",
    "slogan": "品牌口号内容"
  },
  "color_style": {
    "title": "色彩风格",
    "description": "色彩风格描述",
    "palettes": [
      {
        "name": "主色调",
        "primary_color": "#主色值",
        "secondary_color": "#辅助色值",
        "background_color": "#背景色值",
        "secondary_background_color": "#次背景色值"
      }
    ]
  },
  "tone": {
    "title": "品牌调性",
    "description": "品牌调性描述"
  },
  "icon": {
    "placeholder": "图标占位符"
  },
  "font_layout": {
    "placeholder": "字体布局占位符"
  },
  "web_link": {
    "url": "网站链接"
  }
}

颜色值请使用标准十六进制格式。只返回JSON，不要其他文字。`;

    const response = await new LLM({
      system_prompt: "你是品牌表达专家，请生成品牌视觉和语言表达信息。",
    }).json(prompt);

    return this.extractJsonFromResponse(response);
  }

  /**
   * 生成用户画像
   */
  public async generateUserPersonas(
    content: string,
    brandName: string
  ): Promise<any> {
    const prompt = `请仔细分析以下${brandName}的品牌内容，并基于内容生成具体的用户画像信息：

${content}
请根据上述内容分析并生成JSON格式的用户画像，包含以下结构：
- title: 固定为"用户画像"
- description: 根据品牌内容总结的具体用户画像描述
- personas: 包含1-3个不同用户画像的数组，每个画像包含：
  - id: 唯一标识符（如persona_1, persona_2等）
  - title: 具体的用户画像标题（如"年轻职场白领"、"资深技术专家"等）
  - avatar: 头像描述
  - name: 具体的用户名称
  - age_gender: 具体的年龄和性别信息（如"25-35岁女性"）
  - percentage_in_group: 在目标用户群体中的占比（如"35%"）
  - description: 详细的用户描述
  - pain_points: 3个具体的用户痛点
  - user_characteristics: 用户特征数组，包含关键词和百分比
  - user_scenarios: 2-3个具体的使用场景

重要：
1. 请根据品牌内容生成真实具体的用户画像，不要使用模板化的占位符文字
2. 用户画像要符合品牌的目标客户群体
3. 痛点和使用场景要贴合实际情况
4. 特征关键词要准确反映用户属性

请返回JSON格式：
{
  "title": "用户画像",
  "description": "用户画像描述",
  "personas": [
    {
      "id": "persona_1",
      "title": "用户画像1",
      "avatar": "头像占位符",
      "name": "用户名称",
      "age_gender": "年龄性别",
      "percentage_in_group": "占比",
      "description": "用户描述",
      "pain_points": ["痛点1", "痛点2", "痛点3"],
      "user_characteristics": [
        {
          "keyword": "特征关键词",
          "percentage": 80
        }
      ],
      "user_scenarios": ["使用场景1", "使用场景2"]
    }
  ]
}

请生成1-3个不同的用户画像。只返回JSON，不要其他文字。`;

    const response = await new LLM({
      system_prompt: "你是用户研究专家，请生成详细的用户画像。",
    }).json(prompt);

    return this.extractJsonFromResponse(response);
  }

  /**
   * 组合所有品牌资产数据
   */
  public assembleBrandAsset(
    basicInfo: any,
    positioning: any,
    expression: any,
    personas: any
  ): any {
    return {
      brand_name: basicInfo.brand_name || "未命名品牌",
      brand_assets: {
        title: "品牌资产",
        description: basicInfo.brand_description || "品牌资产描述",
        brand_image: {
          title: "品牌形象",
          description: "品牌形象描述",
          brand_positioning: positioning,
          brand_expression: expression,
        },
        user_personas: personas,
      },
    };
  }

  /**
   * 验证并修复缺失字段
   */
  public async validateAndFixMissingFields(
    brandAsset: any,
    originalContent: string
  ): Promise<BrandInputData> {
    const missingFields = this.findMissingFields(brandAsset);

    if (missingFields.length > 0) {
      console.log(`发现${missingFields.length}个缺失字段，正在补全...`);

      for (const field of missingFields) {
        try {
          const fixedValue = await this.generateMissingField(
            field,
            originalContent,
            brandAsset.brand_name
          );
          this.setNestedField(brandAsset, field, fixedValue);
        } catch (error) {
          console.warn(`补全字段${field}失败，使用默认值:`, error);
          this.setNestedField(
            brandAsset,
            field,
            this.getDefaultValueForField(field)
          );
        }
      }
    }

    return brandAsset as BrandInputData;
  }

  /**
   * 查找缺失的字段
   */
  public findMissingFields(data: any): string[] {
    const requiredPaths = [
      "brand_name",
      "brand_assets.title",
      "brand_assets.description",
      "brand_assets.brand_image.title",
      "brand_assets.brand_image.description",
      "brand_assets.brand_image.brand_positioning.title",
      "brand_assets.brand_image.brand_positioning.we_believe.points",
      "brand_assets.brand_image.brand_positioning.we_oppose.points",
      "brand_assets.brand_image.brand_positioning.brand_mission.description",
      "brand_assets.brand_image.brand_expression.language_style.options",
      "brand_assets.brand_image.brand_expression.brand_slogan.slogan",
      "brand_assets.brand_image.brand_expression.color_style.palettes",
      "brand_assets.user_personas.personas",
    ];

    const missing: string[] = [];

    for (const path of requiredPaths) {
      if (!this.getNestedField(data, path)) {
        missing.push(path);
      }
    }

    return missing;
  }

  /**
   * 生成缺失字段的值
   */
  public async generateMissingField(
    fieldPath: string,
    content: string,
    brandName: string
  ): Promise<any> {
    const prompt = `请为品牌"${brandName}"生成缺失的字段"${fieldPath}"的值。

品牌内容：${content}

请根据字段路径返回合适的值，格式为JSON。只返回该字段的值，不要包装在其他结构中。`;

    const response = await new LLM({
      system_prompt: "你是品牌数据补全专家，请生成缺失字段的合理值。",
    }).json(prompt);

    return this.extractJsonFromResponse(response);
  }

  /**
   * 从LLM响应中提取JSON
   */
  public extractJsonFromResponse(response: any): any {
    if (response.error) {
      throw new Error(`LLM调用失败: ${response.error}`);
    }

    // 如果响应包含raw_content，尝试从中提取JSON
    if (response.raw_content) {
      return this.extractBrandDataFromText(response.raw_content);
    }

    return response;
  }

  /**
   * 从文本中提取品牌数据
   */
  public extractBrandDataFromText(text: string): any {
    try {
      // 尝试提取JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("无法从响应中提取有效的JSON");
    } catch (error) {
      throw new Error(
        `JSON解析失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  /**
   * 获取嵌套字段的值
   */
  public getNestedField(obj: any, path: string): any {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (!current || current[key] === undefined || current[key] === null) {
        return null;
      }
      current = current[key];
    }

    // 检查数组是否为空
    if (Array.isArray(current) && current.length === 0) {
      return null;
    }

    return current;
  }

  /**
   * 设置嵌套字段的值
   */
  public setNestedField(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 获取字段的默认值
   */
  public getDefaultValueForField(fieldPath: string): any {
    const defaults: Record<string, any> = {
      brand_name: "未命名品牌",
      "brand_assets.title": "品牌资产",
      "brand_assets.description": "品牌资产描述",
      "brand_assets.brand_image.title": "品牌形象",
      "brand_assets.brand_image.description": "品牌形象描述",
      "brand_assets.brand_image.brand_positioning.title": "品牌定位",
      "brand_assets.brand_image.brand_positioning.we_believe.points": [
        "创新驱动价值",
        "用户体验至上",
      ],
      "brand_assets.brand_image.brand_positioning.we_oppose.points": [
        "低质量产品",
        "虚假宣传",
      ],
      "brand_assets.brand_image.brand_positioning.brand_mission.description":
        "为用户创造价值",
      "brand_assets.brand_image.brand_expression.language_style.options": [
        "专业",
        "友好",
      ],
      "brand_assets.brand_image.brand_expression.brand_slogan.slogan":
        "创新引领未来",
      "brand_assets.brand_image.brand_expression.color_style.palettes": [
        {
          name: "主色调",
          primary_color: "#2563eb",
          secondary_color: "#64748b",
          background_color: "#ffffff",
          secondary_background_color: "#f8fafc",
        },
      ],
      "brand_assets.user_personas.personas": [this.getDefaultPersona()],
    };

    return defaults[fieldPath] || "默认值";
  }

  /**
   * 获取默认用户画像
   */
  public getDefaultPersona(): any {
    return {
      id: "persona_1",
      title: "目标用户",
      avatar: "用户头像占位符",
      name: "典型用户",
      age_gender: "25-35岁，男女不限",
      percentage_in_group: "60%",
      description: "对品质有要求的消费者",
      pain_points: ["产品质量不稳定", "服务响应慢", "价格不透明"],
      user_characteristics: [
        {
          keyword: "品质导向",
          percentage: 85,
        },
        {
          keyword: "价格敏感",
          percentage: 70,
        },
      ],
      user_scenarios: ["日常使用", "特殊需求"],
    };
  }
}

/**
 * 便捷函数：从长文本生成品牌资产
 * @param content 包含品牌信息的长文本
 * @returns 结构化的品牌资产数据
 */
export async function generateBrandAsset(
  content: string
): Promise<BrandInputData> {
  const generator = new BrandAssetGenerator();
  return await generator.generateBrandAsset(content);
}
