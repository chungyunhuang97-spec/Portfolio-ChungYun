import type { Metadata } from "next";
import { PhotoPosterHeader, PhotoPosterTool } from "@/components/tools/photo-poster/PhotoPosterTool";

export const metadata: Metadata = {
  title: "相片海報產生器 — Chung Yun Huang",
  description: "上傳一張照片，拖曳挖空方塊，生成帶有詩意文案的社群海報。",
};

export default function PhotoPosterPage() {
  return (
    <div className="min-h-screen bg-bg">
      <PhotoPosterHeader />
      <PhotoPosterTool />
    </div>
  );
}
