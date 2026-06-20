import { useEffect, useState } from "react";
import { Button, Descriptions, Drawer, Form, Input, message, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { clearOperationLogs, getOperationLogDetail, getOperationLogs, removeOperationLogs } from "@/api/admin-modules";

export function OperationLog() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setRows((await getOperationLogs(params)).records ?? []); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  const showDetail = async (id: string) => setDetail(await getOperationLogDetail(id));
  const removeSelected = async () => { await removeOperationLogs(selected.map(String)); message.success("删除成功"); setSelected([]); fetchData(form.getFieldsValue()); };
  const clearAll = async () => { await clearOperationLogs(); message.success("清空成功"); setSelected([]); fetchData(form.getFieldsValue()); };

  return <PageShell title="操作日志" description="真实记录后台高风险操作，参数与结果由后端脱敏。">
    <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()} loading={loading}>
      <Form.Item label="关键词" name="keyword"><Input placeholder="模块/动作/操作者" allowClear /></Form.Item>
      <Form.Item label="状态" name="status"><Input placeholder="success / failed" allowClear /></Form.Item>
    </QueryForm>
    <DataTable rowKey={(r) => String(r.id)} loading={loading} rowSelection={{ selectedRowKeys: selected, onChange: setSelected }} dataSource={rows}
      columns={[
        { title: "模块", dataIndex: "module" }, { title: "动作", dataIndex: "action" }, { title: "方法", dataIndex: "method", width: 90 },
        { title: "路径", dataIndex: "path", ellipsis: true }, { title: "操作者", dataIndex: "operator" },
        { title: "状态", dataIndex: "status", render: (v) => <Tag color={v === "success" || v === "accepted" ? "green" : "orange"}>{String(v)}</Tag> },
        { title: "时间", dataIndex: "createdAt" },
        { title: "操作", render: (_: any, r: any) => <Button type="link" onClick={() => showDetail(String(r.id))}>详情</Button> },
      ]}
      extraActions={<Space size={8}><Button icon={<ReloadOutlined />} onClick={() => fetchData(form.getFieldsValue())}>刷新</Button><Popconfirm title="确认删除选中？" description={`共 ${selected.length} 条，将不可恢复`} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={removeSelected} disabled={!selected.length}><Button danger icon={<DeleteOutlined />} disabled={!selected.length}>删除选中</Button></Popconfirm><Popconfirm title="确认清空全部？" description="此操作不可恢复，将进入操作审计" okText="清空" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={clearAll}><Button danger>清空日志</Button></Popconfirm></Space>}
    />
    <Drawer title="操作日志详情" open={!!detail} onClose={() => setDetail(null)} width={620}>
      <Descriptions bordered column={1} size="small">{Object.entries(detail ?? {}).map(([k, v]) => <Descriptions.Item key={k} label={k}>{typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}</Descriptions.Item>)}</Descriptions>
    </Drawer>
  </PageShell>;
}
