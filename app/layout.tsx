import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mitos Helper - AI 영업사원",
  description: "홈페이지를 학습한 AI 영업사원을 한 줄로 설치하세요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
