import { useEffect, useState } from "react";
import { Button, Form, Input, message, Popconfirm, Space, Tag } from "antd";
import { DisconnectOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { getOnlineUsers, kickoutOnlineUsers } from "@/api/admin-modules";

export function OnlineUsers() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async (params?: any) => { setLoading(true); try { setRows((await getOnlineUsers(params)).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const kickout = async () => { await kickoutOnlineUsers(selected.map(String)); message.success("已标记踢出"); setSelected([]); fetchData(form.getFieldsValue()); };
  return <PageShell title="在线用户" description="展示真实登录会话快照，踢出操作需二次确认并进入审计。">
    <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()} loading={loading}>
      <Form.Item label="关键词" name="keyword"><Input placeholder="用户/IP" allowClear /></Form.Item>
      <Form.Item label="状态" name="status"><Input placeholder="online / kicked" allowClear /></Form.Item>
    </QueryForm>
    <DataTable rowKey={(r) => String(r.id)} loading={loading} rowSelection={{ selectedRowKeys: selected, onChange: setSelected }} dataSource={rows}
      columns={[{ title: "用户", dataIndex: "username" }, { title: "IP", dataIndex: "ip" }, { title: "UserAgent", dataIndex: "userAgent", ellipsis: true }, { title: "登录时间", dataIndex: "loginTime" }, { title: "最后活跃", dataIndex: "lastActiveAt" }, { title: "状态", dataIndex: "status", render: (v) => <Tag color={v === "online" ? "green" : "red"}>{String(v)}</Tag> }]}
      extraActions={<Space size={8}><Button icon={<ReloadOutlined />} onClick={() => fetchData(form.getFieldsValue())}>刷新</Button><Popconfirm title="确认踢出选中？" description={`共 ${selected.length} 个会话，将被强制下线`} okText="踢出" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={kickout} disabled={!selected.length}><Button danger icon={<DisconnectOutlined />} disabled={!selected.length}>踢出选中</Button></Popconfirm></Space>}
    />
  </PageShell>;
}
