import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Form, Input, message, Popconfirm, Space, Table, Tag } from "antd";
import { PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { executeSql, getSqlStatus } from "@/api/admin-modules";

export function SqlTerminal() {
  const [form] = Form.useForm(); const [status, setStatus] = useState<any>({}); const [result, setResult] = useState<any>(null); const [loading, setLoading] = useState(false);
  const fetchStatus = async () => { setLoading(true); try { setStatus(await getSqlStatus()); } finally { setLoading(false); } };
  useEffect(() => { fetchStatus(); }, []);
  const run = async () => { const { sql } = await form.validateFields(); const out = await executeSql(sql); setResult(out); message.success("SQL 已通过只读校验"); };
  return <PageShell title="SQL 终端" description="生产安全版 SQL 终端，仅允许 SELECT / EXPLAIN，并由后端审计。">
    <Alert showIcon type="warning" message="安全边界" description="禁止 DDL/DML/多语句；当前后端未接入真实只读数据源时只做校验与审计，不执行 SQL。" style={{ marginBottom: 16 }} />
    <Card loading={loading} title="SQL 终端状态" extra={<Button icon={<ReloadOutlined />} onClick={fetchStatus}>刷新</Button>}><Descriptions bordered column={1} size="small">{Object.entries(status).map(([k, v]) => <Descriptions.Item key={k} label={k}>{Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}</Descriptions.Item>)}</Descriptions></Card>
    <Card title="只读 SQL" style={{ marginTop: 16 }}>
      <Form form={form} layout="vertical"><Form.Item label="SQL" name="sql" rules={[{ required: true, message: "请输入 SELECT 或 EXPLAIN" }]}><Input.TextArea rows={6} placeholder="SELECT * FROM table LIMIT 100" /></Form.Item><Popconfirm title="确认执行只读 SQL 校验？该操作会写入审计。" onConfirm={run}><Button type="primary" icon={<PlayCircleOutlined />}>执行只读 SQL</Button></Popconfirm></Form>
      {result ? <Card size="small" title="执行结果" style={{ marginTop: 16 }}><Space><Tag color={result.validated ? "green" : "red"}>{result.validated ? "已校验" : "未通过"}</Tag><span>{String(result.message ?? "")}</span></Space><Table style={{ marginTop: 12 }} size="small" pagination={false} dataSource={result.rows ?? []} columns={(result.columns ?? []).map((c: string) => ({ title: c, dataIndex: c }))} /></Card> : null}
    </Card>
  </PageShell>;
}
