import { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Tag } from "antd";
import { PlayCircleOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { getCronHandlers, getCronJobs, getCronLogs, removeCronJobs, runCronJob, saveCronJob, updateCronStatus } from "@/api/admin-modules";

export function CronJobs() {
  const [queryForm] = Form.useForm();
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const fetchData = async (params?: any) => { setLoading(true); try { setRows((await getCronJobs(params)).records ?? []); setHandlers(await getCronHandlers()); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const edit = (r?: any) => { form.resetFields(); form.setFieldsValue(r ?? { status: 1, cron: "*/5 * * * *", handler: "system.heartbeat" }); setOpen(true); };
  const submit = async () => { const v = await form.validateFields(); await saveCronJob(v); message.success("保存成功"); setOpen(false); fetchData(queryForm.getFieldsValue()); };
  const run = async (id: string) => { const out = await runCronJob(id); message.success(`执行结果：${out.status ?? "ok"}`); fetchData(queryForm.getFieldsValue()); };
  const showLogs = async () => { setLogs((await getCronLogs()).records ?? []); setLogOpen(true); };

  return <PageShell title="任务调度" description="生产安全版任务调度：仅允许白名单 handler，执行需二次确认。">
    <QueryForm form={queryForm} onSearch={fetchData} onReset={() => fetchData()} loading={loading}>
      <Form.Item label="关键词" name="keyword"><Input placeholder="任务名/handler" allowClear /></Form.Item>
      <Form.Item label="状态" name="status"><Input placeholder="0/1" allowClear /></Form.Item>
    </QueryForm>
    <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={rows}
      columns={[
        { title: "任务名", dataIndex: "name" }, { title: "分组", dataIndex: "group" }, { title: "Cron", dataIndex: "cron" }, { title: "Handler", dataIndex: "handler" },
        { title: "状态", dataIndex: "status", render: (v, r: any) => <Switch checked={Number(v) === 1} onChange={(checked) => Modal.confirm({ title: "确认切换任务状态？", onOk: async () => { await updateCronStatus({ id: String(r.id), status: checked ? 1 : 0 }); message.success("状态已更新"); fetchData(queryForm.getFieldsValue()); } })} /> },
        { title: "上次执行", dataIndex: "lastRunStatus", render: (v) => v ? <Tag>{String(v)}</Tag> : "-" },
        { title: "操作", render: (_: any, r: any) => <Space><Button type="link" onClick={() => edit(r)}>编辑</Button><Popconfirm title="确认执行一次白名单任务？" onConfirm={() => run(String(r.id))}><Button type="link" icon={<PlayCircleOutlined />}>执行一次</Button></Popconfirm><Popconfirm title="确认删除任务？" onConfirm={async () => { await removeCronJobs([String(r.id)]); message.success("删除成功"); fetchData(queryForm.getFieldsValue()); }}><Button type="link" danger>删除</Button></Popconfirm></Space> },
      ]}
      extraActions={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新增任务</Button><Button icon={<ReloadOutlined />} onClick={() => fetchData(queryForm.getFieldsValue())}>刷新</Button><Button onClick={showLogs}>运行日志</Button></Space>}
    />
    <Modal title="调度任务" open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose>
      <Form form={form} layout="vertical"><Form.Item name="id" hidden><Input /></Form.Item><Form.Item label="任务名" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="分组" name="group"><Input /></Form.Item><Form.Item label="Cron" name="cron" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Handler" name="handler" rules={[{ required: true }]}><Select options={Object.entries(handlers).map(([value, label]) => ({ value, label: `${value} - ${label}` }))} /></Form.Item><Form.Item label="状态" name="status"><Select options={[{ value: 1, label: "启用" }, { value: 0, label: "禁用" }]} /></Form.Item><Form.Item label="说明" name="description"><Input.TextArea /></Form.Item></Form>
    </Modal>
    <Drawer title="调度运行日志" open={logOpen} onClose={() => setLogOpen(false)} width={720}><DataTable rowKey={(r) => String(r.id)} dataSource={logs} columns={[{ title: "任务", dataIndex: "jobName" }, { title: "Handler", dataIndex: "handler" }, { title: "状态", dataIndex: "status" }, { title: "消息", dataIndex: "message" }, { title: "结束时间", dataIndex: "endedAt" }]} pagination={false} /></Drawer>
  </PageShell>;
}
