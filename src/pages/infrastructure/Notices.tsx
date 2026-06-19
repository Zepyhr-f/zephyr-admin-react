import { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Tag } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getNotices, publishNotice, removeNotices, saveNotice } from "@/api/admin-modules";

export function Notices() {
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [form] = Form.useForm();
  const fetchData = async () => { setLoading(true); try { setRows((await getNotices()).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const edit = (r?: any) => { form.resetFields(); form.setFieldsValue(r ?? { status: 0, type: "info" }); setOpen(true); };
  const submit = async () => { await saveNotice(await form.validateFields()); message.success("保存成功"); setOpen(false); fetchData(); };
  return <PageShell title="通知公告" description="真实公告维护，发布/下线需二次确认并记录审计。">
    <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={rows} columns={[{ title: "标题", dataIndex: "title" }, { title: "类型", dataIndex: "type" }, { title: "状态", dataIndex: "status", render: (v) => Number(v) === 1 ? <Tag color="green">已发布</Tag> : <Tag>草稿/下线</Tag> }, { title: "发布时间", dataIndex: "publishedAt" }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" onClick={() => edit(r)}>编辑</Button><Popconfirm title="确认发布公告？" onConfirm={async () => { await publishNotice(String(r.id), true); message.success("已发布"); fetchData(); }}><Button type="link">发布</Button></Popconfirm><Popconfirm title="确认下线公告？" onConfirm={async () => { await publishNotice(String(r.id), false); message.success("已下线"); fetchData(); }}><Button type="link">下线</Button></Popconfirm><Popconfirm title="确认删除公告？" onConfirm={async () => { await removeNotices([String(r.id)]); message.success("删除成功"); fetchData(); }}><Button type="link" danger>删除</Button></Popconfirm></Space> }]}
      extraActions={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新增公告</Button><Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button></Space>} />
    <Modal title="通知公告" open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose><Form form={form} layout="vertical"><Form.Item name="id" hidden><Input /></Form.Item><Form.Item label="标题" name="title" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="类型" name="type"><Select options={[{ value: "info", label: "通知" }, { value: "warning", label: "警告" }]} /></Form.Item><Form.Item label="内容" name="content" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item><Form.Item label="状态" name="status"><Input type="number" /></Form.Item></Form></Modal>
  </PageShell>;
}
