import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getParams, refreshParamsCache, removeParams, saveParam } from "@/api/admin-modules";

export function Params() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setRows((await getParams()).records ?? []);
    } catch (err) {
      message.error("加载失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const edit = (r?: any) => {
    form.resetFields();
    form.setFieldsValue(r ?? { status: 1, sensitive: false });
    setOpen(true);
  };

  const submit = async () => {
    await saveParam(await form.validateFields());
    message.success("保存成功");
    setOpen(false);
    fetchData();
  };

  const refresh = async () => {
    const out = await refreshParamsCache();
    message.success(`刷新完成：${out.refreshed ?? 0}`);
  };

  const onDelete = async (record: any) => {
    await removeParams([String(record.id)]);
    message.success("删除成功");
    fetchData();
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: "Key", dataIndex: "key", width: 220 },
      {
        title: "Value",
        dataIndex: "value",
        render: (v: any, r: any) =>
          r.sensitive ? <Tag color="orange">{String(v)}</Tag> : String(v ?? ""),
      },
      {
        title: "敏感",
        dataIndex: "sensitive",
        width: 90,
        render: (v: any) => (v ? <Tag color="red">敏感</Tag> : <Tag>普通</Tag>),
      },
      { title: "分类", dataIndex: "category", width: 140 },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
        render: (v: any) =>
          Number(v) === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
      },
      { title: "备注", dataIndex: "remark", ellipsis: true },
      {
        title: "操作",
        key: "actions",
        fixed: "right" as const,
        width: 100,
        render: (_: any, r: any) => (
          <Space size={12}>
            <Tooltip title="编辑">
              <Button
                className="btn-action-edit"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => edit(r)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除？"
                description={`将永久删除参数「${r.key}」`}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(r)}
              >
                <Button
                  className="btn-action-delete"
                  shape="circle"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell title="参数配置" description="真实参数配置管理；敏感参数由后端掩码展示。">
      <DataTable
        rowKey={(r) => String(r.id)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        extraActions={
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>
              新增
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              刷新
            </Button>
            <Popconfirm
              title="确认刷新参数缓存？"
              description="将刷新参数缓存快照，可能影响在线读取"
              okText="确认"
              cancelText="取消"
              onConfirm={refresh}
            >
              <Button>刷新缓存</Button>
            </Popconfirm>
          </Space>
        }
      />
      <Modal
        title="参数配置"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Key" name="key" rules={[{ required: true }]}>
            <Input placeholder="请输入参数 Key" />
          </Form.Item>
          <Form.Item label="Value" name="value">
            <Input.TextArea rows={3} placeholder="请输入参数值" />
          </Form.Item>
          <Form.Item label="敏感参数" name="sensitive" valuePropName="checked">
            <Switch checkedChildren="敏感" unCheckedChildren="普通" />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="请选择状态"
              options={[
                { value: 1, label: "启用" },
                { value: 0, label: "停用" },
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
