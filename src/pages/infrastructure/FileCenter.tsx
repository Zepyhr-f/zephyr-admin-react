import { PlaceholderPage } from "@/components/PlaceholderPage";

export function FileCenter() {
  return (
    <PlaceholderPage
      title="文件管理"
      description="统一管理上传资源（本地/OSS/Minio），支持预览、权限、生命周期策略。"
      tips={["列表：文件名/类型/大小/存储桶/上传人/时间", "操作：预览/复制链接/禁用外链/删除（带回收站）"]}
    />
  );
}
