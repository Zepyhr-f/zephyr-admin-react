import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Tag, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getNotices, publishNotice, removeNotices, saveNotice } from "@/api/admin-modules";

export function Notices() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setRows((await getNotices()).records ?? []);
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
    form.setFieldsValue(r ?? { status: 0, type: "info" });
    setOpen(true);
  };

  const submit = async () => {
    await saveNotice(await form.validateFields());
    message.success("保存成功");
    setOpen(false);
    fetchData();
  };

  const onPublish = async (record: any, publish: boolean) => {
    await publishNotice(String(record.id), publish);
    message.success(publish ? "已发布" : "已下线");
    fetchData();
  };

  const onDelete = async (record: any) => {
    await removeNotices([String(record.id)]);
    message.success("删除成功");
    fetchData();
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: "标题", dataIndex: "title" },
      { title: "类型", dataIndex: "type", width: 100 },
      {
        title: "状态",
        dataIndex: "status",
        width: 110,
        render: (v: any) =>
          Number(v) === 1 ? <Tag color="green">已发布</Tag> : <Tag>草稿/下线</Tag>,
      },
      { title: "发布时间", dataIndex: "publishedAt", width: 180 },
      {
        title: "操作",
        key: "actions",
        fixed: "right" as const,
        width: 140,
        render: (_: any, r: any) => {
          const published = Number(r.status) === 1;
          return (
            <Space size={12}>
              <Tooltip title="编辑">
                <Button
                  className="btn-action-edit"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => edit(r)}
                />
              </Tooltip>
              <Tooltip title={published ? "下线" : "发布"}>
                <Popconfirm
                  title={published ? "确认下线？" : "确认发布？"}
                  description={`公告「${r.title}」将被${published ? "下线" : "发布"}`}
                  okText={published ? "下线" : "发布"}
                  cancelText="取消"
                  onConfirm={() => onPublish(r, !published)}
                >
                  <Button
                    className="btn-action-edit"
                    shape="circle"
                    icon={published ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确认删除？"
                  description={`将永久删除「${r.title}」`}
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
          );
        },
      },
    ],
    [],
  );

  return (
    <PageShell title="通知公告" description="真实公告维护，发布/下线需二次确认并记录审计。">
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
          </Space>
        }
      />
      <Modal
        title="通知公告"
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
          <Form.Item label="标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select
              placeholder="请选择类型"
              options={[
                { value: "info", label: "通知" },
                { value: "warning", label: "警告" },
              ]}
            />
          </Form.Item>
          <Form.Item label="内容" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="请选择状态"
              options={[
                { value: 0, label: "草稿/下线" },
                { value: 1, label: "已发布" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
