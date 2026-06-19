import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Drawer, Form, Input, message, Popconfirm, Space, Tag, Typography } from "antd";
import { CodeOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { downloadCodegen, getCodegenList, previewCodegen } from "@/api/admin-modules";

const { Text } = Typography;

export function Codegen() {
  const [form] = Form.useForm(); const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [preview, setPreview] = useState<any>(null);
  const fetchData = async (params?: any) => { setLoading(true); try { setRows((await getCodegenList(params)).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const doPreview = async (tableName: string) => setPreview(await previewCodegen(tableName));
  const doDownload = async (tableName: string) => { const meta = await downloadCodegen(tableName); message.success(`已生成下载元数据：${meta.downloadName ?? tableName}`); setPreview(meta); };
  return <PageShell title="代码生成" description="安全版代码生成：只预览/下载元数据，不直接覆盖仓库。">
    <Alert showIcon type="info" message="生产安全边界" description="代码生成不会写入服务器仓库；生成内容需人工审查后合并。" style={{ marginBottom: 16 }} />
    <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()} loading={loading}><Form.Item label="关键词" name="keyword"><Input placeholder="表名/模块" allowClear /></Form.Item></QueryForm>
    <DataTable rowKey={(r) => String(r.tableName)} loading={loading} dataSource={rows} columns={[{ title: "表名", dataIndex: "tableName" }, { title: "模块", dataIndex: "module" }, { title: "模式", dataIndex: "safeMode", render: (v) => <Tag color="blue">{String(v)}</Tag> }, { title: "说明", dataIndex: "description" }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" icon={<CodeOutlined />} onClick={() => doPreview(String(r.tableName))}>预览</Button><Popconfirm title="确认生成下载元数据？" onConfirm={() => doDownload(String(r.tableName))}><Button type="link" icon={<DownloadOutlined />}>下载元数据</Button></Popconfirm></Space> }]} extraActions={<Button icon={<ReloadOutlined />} onClick={() => fetchData(form.getFieldsValue())}>刷新</Button>} />
    <Drawer title="生成预览" open={!!preview} onClose={() => setPreview(null)} width={760}>{preview ? <><Descriptions bordered column={1} size="small"><Descriptions.Item label="表名">{String(preview.tableName ?? "")}</Descriptions.Item><Descriptions.Item label="安全模式">{String(preview.safeMode ?? preview.downloadMode ?? "")}</Descriptions.Item><Descriptions.Item label="说明">{String(preview.note ?? "")}</Descriptions.Item></Descriptions>{(preview.files ?? []).map((f: any) => <Card key={f.path} title={f.path} size="small" style={{ marginTop: 12 }}><Text code>{String(f.content ?? "")}</Text></Card>)}</> : null}</Drawer>
  </PageShell>;
}
