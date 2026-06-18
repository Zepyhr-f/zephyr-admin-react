import { Form, Input, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";

type Row = {
  id: string;
  api: string;
  method: string;
  operator: string;
  costMs: number;
  result: "成功" | "失败";
  time: string;
};

const data: Row[] = [
  {
    id: "o1",
    api: "/api/admin/user/list",
    method: "GET",
    operator: "admin",
    costMs: 42,
    result: "成功",
    time: "2026-06-06 09:10:21"
  },
  {
    id: "o2",
    api: "/api/admin/role/update",
    method: "POST",
    operator: "admin",
    costMs: 231,
    result: "失败",
    time: "2026-06-06 09:02:09"
  }
];

const columns: ColumnsType<Row> = [
  { title: "接口", dataIndex: "api" },
  { title: "方法", dataIndex: "method", width: 100 },
  { title: "操作者", dataIndex: "operator", width: 140 },
  { title: "耗时(ms)", dataIndex: "costMs", width: 120 },
  {
    title: "结果",
    dataIndex: "result",
    width: 110,
    render: (v) => (v === "成功" ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>)
  },
  { title: "时间", dataIndex: "time", width: 200 }
];

export function OperationLog() {
  const [form] = Form.useForm();

  return (
    <PageShell title="操作日志" description="记录业务接口调用，包含参数（脱敏）、耗时、结果。">
      <QueryForm form={form} onSearch={(values) => console.log("查询:", values)}>
        <Form.Item label="操作者" name="operator">
          <Input placeholder="输入账号" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="接口路径" name="api">
          <Input placeholder="输入路径" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="操作结果" name="result">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 200 }}
            options={[
              { label: "成功", value: "成功" },
              { label: "失败", value: "失败" }
            ]}
          />
        </Form.Item>
      </QueryForm>

      <DataTable rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10, total: 50 }} />
    </PageShell>
  );
}
