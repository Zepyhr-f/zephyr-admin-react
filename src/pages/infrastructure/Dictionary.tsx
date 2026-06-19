import { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Tabs } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getDictData, getDictTypes, removeDictData, removeDictTypes, saveDictData, saveDictType, updateDictDataStatus, updateDictTypeStatus } from "@/api/admin-modules";

export function Dictionary() {
  const [typeRows, setTypeRows] = useState<any[]>([]);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<"type" | "data" | null>(null);
  const [form] = Form.useForm();
  const fetchData = async () => { setLoading(true); try { setTypeRows((await getDictTypes()).records ?? []); setDataRows((await getDictData()).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const edit = (kind: "type" | "data", row?: any) => { form.resetFields(); form.setFieldsValue(row ?? { status: 1, orderNum: 1 }); setOpen(kind); };
  const submit = async () => { const v = await form.validateFields(); if (open === "type") await saveDictType(v); else await saveDictData(v); message.success("保存成功"); setOpen(null); fetchData(); };
  return <PageShell title="字典管理" description="真实维护字典类型和字典数据，状态变更需确认。">
    <Tabs items={[{ key: "type", label: "字典类型", children: <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={typeRows} columns={[{ title: "名称", dataIndex: "dictName" }, { title: "类型", dataIndex: "dictType" }, { title: "状态", dataIndex: "status", render: (v, r: any) => <Switch checked={Number(v) === 1} onChange={(checked) => Modal.confirm({ title: "确认切换字典状态？", onOk: async () => { await updateDictTypeStatus({ id: String(r.id), status: checked ? 1 : 0 }); fetchData(); } })} /> }, { title: "备注", dataIndex: "remark" }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" onClick={() => edit("type", r)}>编辑</Button><Popconfirm title="确认删除字典类型？" onConfirm={async () => { await removeDictTypes([String(r.id)]); message.success("删除成功"); fetchData(); }}><Button type="link" danger>删除</Button></Popconfirm></Space> }]} extraActions={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => edit("type")}>新增类型</Button><Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button></Space>} /> }, { key: "data", label: "字典数据", children: <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={dataRows} columns={[{ title: "类型", dataIndex: "dictType" }, { title: "标签", dataIndex: "label" }, { title: "值", dataIndex: "value" }, { title: "排序", dataIndex: "orderNum" }, { title: "状态", dataIndex: "status", render: (v, r: any) => <Switch checked={Number(v) === 1} onChange={(checked) => Modal.confirm({ title: "确认切换字典数据状态？", onOk: async () => { await updateDictDataStatus({ id: String(r.id), status: checked ? 1 : 0 }); fetchData(); } })} /> }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" onClick={() => edit("data", r)}>编辑</Button><Popconfirm title="确认删除字典数据？" onConfirm={async () => { await removeDictData([String(r.id)]); message.success("删除成功"); fetchData(); }}><Button type="link" danger>删除</Button></Popconfirm></Space> }]} extraActions={<Button type="primary" icon={<PlusOutlined />} onClick={() => edit("data")}>新增数据</Button>} /> }]} />
    <Modal title={open === "type" ? "字典类型" : "字典数据"} open={!!open} onCancel={() => setOpen(null)} onOk={submit} destroyOnClose><Form form={form} layout="vertical"><Form.Item name="id" hidden><Input /></Form.Item>{open === "type" ? <><Form.Item label="名称" name="dictName" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="类型" name="dictType" rules={[{ required: true }]}><Input /></Form.Item></> : <><Form.Item label="字典类型" name="dictType" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="标签" name="label" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="值" name="value" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="排序" name="orderNum"><Input type="number" /></Form.Item></>}<Form.Item label="状态" name="status"><Input type="number" /></Form.Item><Form.Item label="备注" name="remark"><Input.TextArea /></Form.Item></Form></Modal>
  </PageShell>;
}
