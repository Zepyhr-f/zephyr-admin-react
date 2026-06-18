import { Form, Input, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";

type Row = {
  id: string;
  username: string;
  ip: string;
  ua: string;
  result: "成功" | "失败";
  time: string;
};

const data: Row[] = [
  {
    id: "l1",
    username: "admin",
    ip: "10.0.1.23",
    ua: "Chrome 126 / macOS",
    result: "成功",
    time: "2026-06-06 09:12:03"
  },
  {
    id: "l2",
    username: "auditor",
    ip: "10.0.3.19",
    ua: "Edge 126 / Windows",
    result: "失败",
    time: "2026-06-06 08:01:45"
  }
];

const columns: ColumnsType<Row> = [
  { title: "账号", dataIndex: "username", width: 160 },
  { title: "IP", dataIndex: "ip", width: 160 },
  { title: "浏览器", dataIndex: "ua" },
  {
    title: "结果",
    dataIndex: "result",
    width: 120,
    render: (v) => (v === "成功" ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>)
  },
  { title: "时间", dataIndex: "time", width: 200 }
];

export function LoginLog() {
  const [form] = Form.useForm();

  return (
    <PageShell title="登录日志" description="记录登录/登出行为及 IP、浏览器等信息。">
      <QueryForm form={form} onSearch={(values) => console.log("查询:", values)}>
        <Form.Item label="账号" name="username">
          <Input placeholder="输入账号" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="IP地址" name="ip">
          <Input placeholder="输入IP" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="登录结果" name="result">
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
