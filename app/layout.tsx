import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '品牌价值评测系统',
  description: '基于LLM的品牌资产生成与价值评测',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}