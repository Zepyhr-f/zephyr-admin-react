import { Table, Card } from "antd";
import type { TableProps } from "antd";
import type { ReactNode } from "react";

interface DataTableProps<RecordType> extends TableProps<RecordType> {
  /** 表格左上角的操作区（比如新增、导出按钮） */
  extraActions?: ReactNode;
}

/**
 * 统一的列表展示组件
 * 封装了 Card 容器，提供标准化的 extraActions 区域
 */
export function DataTable<RecordType extends object>({
  extraActions,
  pagination,
  ...tableProps
}: DataTableProps<RecordType>) {
  // 统一合并分页配置
  const mergedPagination =
    pagination !== false
      ? {
          position: ["bottomCenter"] as any,
          showTotal: (total: number) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
          locale: {
            items_per_page: "条/页",
            jump_to: "前往",
            page: "页",
            prev_page: "上一页",
            next_page: "下一页",
          },
          ...(typeof pagination === "object" ? pagination : {}),
        }
      : false;

  return (
    <Card styles={{ body: { padding: "16px 20px" } }}>
      {/* 自定义操作区：无下划线，位于左上角 */}
      {extraActions && <div style={{ marginBottom: 16 }}>{extraActions}</div>}

      <Table<RecordType>
        size="middle"
        pagination={mergedPagination}
        {...tableProps}
      />
    </Card>
  );
}
