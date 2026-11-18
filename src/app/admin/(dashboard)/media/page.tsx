import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">媒體庫</h1>
      <p className="mt-1 text-sm text-admin-text-muted">
        所有已上傳的圖片與影片，以及它們被哪些頁面使用。未使用的檔案可以勾選後一次清除。
      </p>
      <div className="mt-8">
        <MediaLibrary />
      </div>
    </div>
  );
}
