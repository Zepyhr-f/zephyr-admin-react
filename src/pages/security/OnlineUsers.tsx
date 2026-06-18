import { PoweroffOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";

type Row = {
  id: string;
  username: string;
  ip: string;
  lastActive: string;
  status: "活跃" | "空闲";
};

const data: Row[] = [
  { id: "s1", username: "admin", ip: "10.0.1.23", lastActive: "1 分钟前", status: "活跃" },
  { id: "s2", username: "auditor", ip: "10.0.3.19", lastActive: "12 分钟前", status: "空闲" }
];

const columns: ColumnsType<Row> = [
  { title: "账号", dataIndex: "username", width: 160 },
  { title: "IP", dataIndex: "ip", width: 180 },
  { title: "最后活跃", dataIndex: "lastActive", width: 160 },
  {
    title: "状态",
    dataIndex: "status",
    width: 120,
    render: (v) => (v === "活跃" ? <Tag color="green">活跃</Tag> : <Tag>空闲</Tag>)
  },
  {
    title: "操作",
    key: "actions",
    width: 140,
    render: () => (
      <Tooltip title="强制下线">
        <Button shape="circle" icon={<PoweroffOutlined />} className="btn-action-delete" />
      </Tooltip>
    )
  }
];

export function OnlineUsers() {
  const [form] = Form.useForm();

  return (
    <PageShell
      title="在线用户"
      description="实时展示当前系统活跃会话，支持强退（高危操作建议二次确认）。"
    >
      <QueryForm form={form} onSearch={(values) => console.log("查询:", values)}>
        <Form.Item label="账号" name="username">
          <Input placeholder="输入账号" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="IP地址" name="ip">
          <Input placeholder="输入IP" allowClear style={{ width: 200 }} />
        </Form.Item>
      </QueryForm>

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, total: 50 }}
        extraActions={
          <Space>
            <Button>刷新</Button>
          </Space>
        }
      />
    </PageShell>
  );
}
