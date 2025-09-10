import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Heart,
  Zap
} from 'lucide-react';

export default function Guide() {
  const brandZCriteria = [
    {
      category: '财务价值评测',
      icon: DollarSign,
      description: '基于凯度BrandZ模型的财务价值计算',
      items: [
        { name: '收益表现', weight: '50%', description: '品牌产生的收益和现金流' },
        { name: '资产效率', weight: '30%', description: '剥离有形资产后的无形资产价值' },
        { name: '品牌倍数', weight: '20%', description: '品牌未来前景和增长潜力' }
      ]
    },
    {
      category: '品牌贡献评测',
      icon: Heart,
      description: '基于MDS模型 + 品牌一致性的贡献分析',
      items: [
        { name: '有意义度 (Meaningful)', weight: 'MDS模型', description: '品牌对消费者的意义和价值' },
        { name: '差异化度 (Different)', weight: 'MDS模型', description: '品牌与竞争对手的差异化程度' },
        { name: '显著度 (Salient)', weight: 'MDS模型', description: '品牌在消费者心中的显著性' },
        { name: '品牌一致性', weight: '额外加分', description: '品牌屋各维度的一致性和协调性' }
      ]
    }
  ];

  const consistencyCriteria = [
    {
      category: '品牌基础 (25%)',
      icon: Target,
      description: '评测品牌的基础信息和市场定位',
      items: [
        { name: '品牌名称识别度', weight: '5%', description: '品牌名称的独特性和记忆度' },
        { name: '品牌描述清晰度', weight: '5%', description: '品牌描述的准确性和吸引力' },
        { name: '行业定位准确性', weight: '5%', description: '行业分类的准确性和专业性' },
        { name: '市场定位明确性', weight: '5%', description: '目标市场的明确性和可行性' },
        { name: '地理覆盖合理性', weight: '5%', description: '地理布局的合理性和扩展性' }
      ]
    },
    {
      category: '品牌理念 (30%)',
      icon: Users,
      description: '评测品牌的核心理念和价值观',
      items: [
        { name: '使命陈述完整性', weight: '8%', description: '使命陈述的完整性和感召力' },
        { name: '愿景描述清晰度', weight: '8%', description: '愿景描述的清晰度和可实现性' },
        { name: '价值观一致性', weight: '7%', description: '价值观与品牌行为的一致性' },
        { name: '品牌定位独特性', weight: '7%', description: '品牌定位的独特性和差异化' }
      ]
    },
    {
      category: '品牌表达 (25%)',
      icon: Award,
      description: '评测品牌在各触点的表达一致性',
      items: [
        { name: '品牌口号感染力', weight: '6%', description: '品牌口号的感染力和记忆度' },
        { name: '核心承诺可信度', weight: '6%', description: '核心承诺的可信度和可实现性' },
        { name: '语言风格一致性', weight: '5%', description: '语言风格在各触点的一致性' },
        { name: '视觉风格协调性', weight: '4%', description: '视觉风格的协调性和识别度' },
        { name: '传播渠道有效性', weight: '4%', description: '传播渠道的有效性和覆盖度' }
      ]
    },
    {
      category: '财务表现 (20%)',
      icon: TrendingUp,
      description: '评测品牌的商业价值和市场表现',
      items: [
        { name: '营收规模', weight: '5%', description: '营收规模在行业中的地位' },
        { name: '增长率', weight: '5%', description: '营收增长率的可持续性' },
        { name: '盈利能力', weight: '3%', description: '利润率水平和盈利稳定性' },
        { name: '市场份额', weight: '3%', description: '市场份额和竞争地位' },
        { name: '品牌认知度', weight: '2%', description: '品牌在目标市场的认知度' },
        { name: '客户忠诚度', weight: '2%', description: '客户忠诚度和复购率' }
      ]
    }
  ];

  const tips = [
    {
      icon: DollarSign,
      title: '财务价值数据准备',
      content: [
        '营收数据要准确，建议使用年度财务数据',
        '增长率计算要基于可比较的时间段',
        '利润率要考虑行业平均水平',
        '市场份额数据要有可靠来源',
        '品牌倍数要基于行业标准和增长预期'
      ]
    },
    {
      icon: Heart,
      title: 'MDS模型理解要点',
      content: [
        '有意义度：品牌是否满足消费者需求',
        '差异化度：品牌是否与竞争对手区分开来',
        '显著度：品牌是否容易被消费者想起',
        '三者平衡：MDS三要素要协调发展',
        '品牌一致性：各维度表达要协调统一'
      ]
    },
    {
      icon: Target,
      title: '品牌理念构建要点',
      content: [
        '使命要回答"为什么存在"的问题',
        '愿景要描绘未来3-5年的目标状态',
        '价值观要与企业文化和行为保持一致',
        '品牌定位要在消费者心中占据独特位置',
        '目标人群要具体明确，避免过于宽泛'
      ]
    },
    {
      icon: Award,
      title: '品牌表达优化建议',
      content: [
        '品牌口号要简洁有力，朗朗上口',
        '核心承诺要可信可实现，避免夸大',
        '语言风格要与品牌个性保持一致',
        '视觉风格要在各触点保持统一',
        '传播渠道要根据目标人群选择'
      ]
    }
  ];

  const commonIssues = [
    {
      issue: '财务数据不准确',
      solution: '使用经过审计的财务数据，确保数据的准确性和可比性'
    },
    {
      issue: 'MDS三要素不平衡',
      solution: '确保有意义度、差异化度、显著度协调发展，避免偏重某一要素'
    },
    {
      issue: '品牌定位模糊',
      solution: '明确目标客群，突出差异化价值，避免大而全的定位'
    },
    {
      issue: '表达不一致',
      solution: '制定品牌标准手册，统一各触点的表达方式'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">BrandZ评测指南</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          了解BrandZ评测标准和填写建议，帮助您更好地完成品牌价值评测
        </p>
      </div>

      <Tabs defaultValue="brandz" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brandz" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>BrandZ模型</span>
          </TabsTrigger>
          <TabsTrigger value="consistency" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>一致性评测</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>填写建议</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>常见问题</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brandz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>BrandZ评测模型详解</span>
              </CardTitle>
              <CardDescription>
                基于凯度BrandZ全球品牌价值评测标准，采用财务价值 × 品牌贡献的科学公式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {brandZCriteria.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Icon className="h-5 w-5 text-purple-500" />
                          <span>{category.category}</span>
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                              </div>
                              <div className="text-sm font-semibold text-purple-600 ml-2">
                                {item.weight}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>品牌一致性评测标准</span>
              </CardTitle>
              <CardDescription>
                评测品牌屋各维度的一致性和协调性，总分100分
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {consistencyCriteria.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <span>{category.category}</span>
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                              </div>
                              <div className="text-sm font-semibold text-blue-600 ml-2">
                                {item.weight}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-500" />
                      <span>{tip.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tip.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>常见问题解答</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {commonIssues.map((item, index) => (
                  <div key={index} className="border-l-4 border-l-orange-500 pl-4">
                    <div className="flex items-start space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900">{item.issue}</h3>
                    </div>
                    <p className="text-gray-600 ml-7">{item.solution}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 