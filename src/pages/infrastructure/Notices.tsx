import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Notices() {
  return (
    <PlaceholderPage
      title="通知公告"
      description="发布系统公告并推送给用户；建议支持置顶、已读/未读、目标人群。"
      tips={["编辑器：Markdown/富文本（二选一）", "推送：站内信 + 邮件/IM（可选）"]}
    />
  );
}
