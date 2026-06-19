import { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Tag } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getParams, refreshParamsCache, removeParams, saveParam } from "@/api/admin-modules";

export function Params() {
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [form] = Form.useForm();
  const fetchData = async () => { setLoading(true); try { setRows((await getParams()).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const edit = (r?: any) => { form.resetFields(); form.setFieldsValue(r ?? { status: 1, sensitive: false }); setOpen(true); };
  const submit = async () => { await saveParam(await form.validateFields()); message.success("保存成功"); setOpen(false); fetchData(); };
  const refresh = async () => { const out = await refreshParamsCache(); message.success(`刷新完成：${out.refreshed ?? 0}`); };
  return <PageShell title="参数配置" description="真实参数配置管理；敏感参数由后端掩码展示。">
    <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={rows} columns={[{ title: "Key", dataIndex: "key" }, { title: "Value", dataIndex: "value", render: (v, r: any) => r.sensitive ? <Tag color="orange">{String(v)}</Tag> : String(v ?? "") }, { title: "敏感", dataIndex: "sensitive", render: (v) => v ? <Tag color="red">敏感</Tag> : <Tag>普通</Tag> }, { title: "分类", dataIndex: "category" }, { title: "状态", dataIndex: "status" }, { title: "备注", dataIndex: "remark" }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" onClick={() => edit(r)}>编辑</Button><Popconfirm title="确认删除参数？" onConfirm={async () => { await removeParams([String(r.id)]); message.success("删除成功"); fetchData(); }}><Button type="link" danger>删除</Button></Popconfirm></Space> }]}
      extraActions={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新增参数</Button><Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button><Popconfirm title="确认刷新参数缓存快照？" onConfirm={refresh}><Button>刷新缓存</Button></Popconfirm></Space>} />
    <Modal title="参数配置" open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose><Form form={form} layout="vertical"><Form.Item name="id" hidden><Input /></Form.Item><Form.Item label="Key" name="key" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Value" name="value"><Input.TextArea /></Form.Item><Form.Item label="敏感参数" name="sensitive" valuePropName="checked"><Switch /></Form.Item><Form.Item label="分类" name="category"><Input /></Form.Item><Form.Item label="状态" name="status"><Input type="number" /></Form.Item><Form.Item label="备注" name="remark"><Input.TextArea /></Form.Item></Form></Modal>
  </PageShell>;
}
