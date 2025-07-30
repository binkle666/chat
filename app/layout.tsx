import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '聊天室',
  description: '一个支持两人在线聊天的应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
