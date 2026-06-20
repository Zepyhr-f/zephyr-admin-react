import { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import {
  getCronHandlers,
  getCronJobs,
  getCronLogs,
  removeCronJobs,
  runCronJob,
  saveCronJob,
  updateCronStatus,
} from "@/api/admin-modules";

export function CronJobs() {
  const [queryForm] = Form.useForm();
  const [form] = Form.useForm();
  const [rows, setRows] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try {
      setRows((await getCronJobs(params)).records ?? []);
      setHandlers(await getCronHandlers());
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
    form.setFieldsValue(r ?? { status: 1, cron: "*/5 * * * *", handler: "system.heartbeat" });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    await saveCronJob(v);
    message.success("保存成功");
    setOpen(false);
    fetchData(queryForm.getFieldsValue());
  };

  const run = async (id: string) => {
    const out = await runCronJob(id);
    message.success(`执行结果：${out.status ?? "ok"}`);
    fetchData(queryForm.getFieldsValue());
  };

  const onDelete = async (id: string) => {
    await removeCronJobs([id]);
    message.success("删除成功");
    fetchData(queryForm.getFieldsValue());
  };

  const onToggle = async (record: any, nextEnable: boolean) => {
    await updateCronStatus({ id: String(record.id), status: nextEnable ? 1 : 0 });
    message.success("状态已更新");
    fetchData(queryForm.getFieldsValue());
  };

  const showLogs = async () => {
    setLogs((await getCronLogs()).records ?? []);
    setLogOpen(true);
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: "任务名", dataIndex: "name" },
      { title: "分组", dataIndex: "group", width: 120 },
      { title: "Cron", dataIndex: "cron", width: 140 },
      { title: "Handler", dataIndex: "handler", width: 200 },
      {
        title: "状态",
        dataIndex: "status",
        width: 110,
        render: (v: number, r: any) => (
          <Popconfirm
            title="确认变更状态？"
            description={`「${r.name}」将被${Number(v) === 1 ? "停用" : "启用"}`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onToggle(r, Number(v) !== 1)}
          >
            <Switch checked={Number(v) === 1} checkedChildren="启用" unCheckedChildren="停用" />
          </Popconfirm>
        ),
      },
      {
        title: "上次执行",
        dataIndex: "lastRunStatus",
        width: 110,
        render: (v: any) => (v ? <Tag>{String(v)}</Tag> : "-"),
      },
      {
        title: "操作",
        key: "actions",
        fixed: "right" as const,
        width: 140,
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
            <Tooltip title="执行一次">
              <Popconfirm
                title="确认执行一次？"
                description={`将立即执行白名单任务「${r.name}」`}
                okText="执行"
                cancelText="取消"
                onConfirm={() => run(String(r.id))}
              >
                <Button
                  className="btn-action-edit"
                  shape="circle"
                  icon={<PlayCircleOutlined />}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除？"
                description={`将永久删除任务「${r.name}」`}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(String(r.id))}
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
    <PageShell title="任务调度" description="生产安全版任务调度：仅允许白名单 handler，执行需二次确认。">
      <QueryForm form={queryForm} onSearch={fetchData} onReset={() => fetchData()} loading={loading}>
        <Form.Item label="关键词" name="keyword">
          <Input placeholder="请输入任务名/handler" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="全部"
            allowClear
            options={[
              { value: 1, label: "启用" },
              { value: 0, label: "停用" },
            ]}
          />
        </Form.Item>
      </QueryForm>

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
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(queryForm.getFieldsValue())}>
              刷新
            </Button>
            <Button onClick={showLogs}>运行日志</Button>
          </Space>
        }
      />

      <Modal
        title="调度任务"
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
          <Form.Item label="任务名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名" />
          </Form.Item>
          <Form.Item label="分组" name="group">
            <Input placeholder="请输入分组" />
          </Form.Item>
          <Form.Item label="Cron" name="cron" rules={[{ required: true }]}>
            <Input placeholder="例如 */5 * * * *" />
          </Form.Item>
          <Form.Item label="Handler" name="handler" rules={[{ required: true }]}>
            <Select
              placeholder="请选择 handler"
              options={Object.entries(handlers).map(([value, label]) => ({
                value,
                label: `${value} - ${label}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { value: 1, label: "启用" },
                { value: 0, label: "停用" },
              ]}
            />
          </Form.Item>
          <Form.Item label="说明" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="调度运行日志" open={logOpen} onClose={() => setLogOpen(false)} width={720}>
        <DataTable
          rowKey={(r) => String(r.id)}
          dataSource={logs}
          columns={[
            { title: "任务", dataIndex: "jobName" },
            { title: "Handler", dataIndex: "handler" },
            { title: "状态", dataIndex: "status" },
            { title: "消息", dataIndex: "message", ellipsis: true },
            { title: "结束时间", dataIndex: "endedAt", width: 180 },
          ]}
          pagination={false}
        />
      </Drawer>
    </PageShell>
  );
}
