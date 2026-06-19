import { useEffect, useState } from "react";
import { Button, Form, Input, message, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { clearLoginLogs, getLoginLogs, removeLoginLogs } from "@/api/admin-modules";

export function LoginLog() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try {
      const resp = await getLoginLogs(params);
      setRows(resp.records ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const removeSelected = async () => {
    await removeLoginLogs(selected.map(String));
    message.success("删除成功");
    setSelected([]);
    fetchData(form.getFieldsValue());
  };

  const clearAll = async () => {
    await clearLoginLogs();
    message.success("清空成功");
    setSelected([]);
    fetchData(form.getFieldsValue());
  };

  return (
    <PageShell title="登录日志" description="真实记录登录成功与失败，敏感信息不落表展示。">
      <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()} loading={loading}>
        <Form.Item label="关键词" name="keyword"><Input placeholder="账号/IP" allowClear /></Form.Item>
        <Form.Item label="状态" name="status"><Input placeholder="success / failed" allowClear /></Form.Item>
      </QueryForm>
      <DataTable
        rowKey={(r) => String(r.id)}
        loading={loading}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        columns={[
          { title: "用户", dataIndex: "username" },
          { title: "租户", dataIndex: "tenant" },
          { title: "IP", dataIndex: "ip" },
          { title: "状态", dataIndex: "status", render: (v) => <Tag color={v === "success" ? "green" : "red"}>{String(v)}</Tag> },
          { title: "原因", dataIndex: "reason", ellipsis: true },
          { title: "登录时间", dataIndex: "loginTime" },
        ]}
        dataSource={rows}
        extraActions={<Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(form.getFieldsValue())}>刷新</Button>
          <Popconfirm title="确认删除选中登录日志？" onConfirm={removeSelected} disabled={!selected.length}><Button danger icon={<DeleteOutlined />} disabled={!selected.length}>删除选中</Button></Popconfirm>
          <Popconfirm title="确认清空登录日志？该操作会进入操作审计。" onConfirm={clearAll}><Button danger>清空日志</Button></Popconfirm>
        </Space>}
      />
    </PageShell>
  );
}
