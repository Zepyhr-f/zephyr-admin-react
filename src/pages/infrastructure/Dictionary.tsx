import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Tabs, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import {
  getDictData,
  getDictTypes,
  removeDictData,
  removeDictTypes,
  saveDictData,
  saveDictType,
  updateDictDataStatus,
  updateDictTypeStatus,
} from "@/api/admin-modules";

type Kind = "type" | "data";

export function Dictionary() {
  const [typeRows, setTypeRows] = useState<any[]>([]);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Kind | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setTypeRows((await getDictTypes()).records ?? []);
      setDataRows((await getDictData()).records ?? []);
    } catch (err) {
      message.error("加载失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const edit = (kind: Kind, row?: any) => {
    form.resetFields();
    form.setFieldsValue(row ?? { status: 1, orderNum: 1 });
    setOpen(kind);
  };

  const submit = async () => {
    const v = await form.validateFields();
    if (open === "type") await saveDictType(v);
    else await saveDictData(v);
    message.success("保存成功");
    setOpen(null);
    fetchData();
  };

  const onToggleType = async (record: any, nextEnable: boolean) => {
    await updateDictTypeStatus({ id: String(record.id), status: nextEnable ? 1 : 0 });
    message.success("状态已更新");
    fetchData();
  };

  const onToggleData = async (record: any, nextEnable: boolean) => {
    await updateDictDataStatus({ id: String(record.id), status: nextEnable ? 1 : 0 });
    message.success("状态已更新");
    fetchData();
  };

  const onDeleteType = async (record: any) => {
    await removeDictTypes([String(record.id)]);
    message.success("删除成功");
    fetchData();
  };

  const onDeleteData = async (record: any) => {
    await removeDictData([String(record.id)]);
    message.success("删除成功");
    fetchData();
  };

  const typeColumns: ColumnsType<any> = useMemo(
    () => [
      { title: "名称", dataIndex: "dictName", width: 220 },
      { title: "类型", dataIndex: "dictType", width: 220 },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        render: (v: any, r: any) => (
          <Popconfirm
            title="确认变更状态？"
            description={`「${r.dictName}」将被${Number(v) === 1 ? "停用" : "启用"}`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onToggleType(r, Number(v) !== 1)}
          >
            <Switch checked={Number(v) === 1} checkedChildren="启用" unCheckedChildren="停用" />
          </Popconfirm>
        ),
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
                onClick={() => edit("type", r)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除？"
                description={`将永久删除字典类型「${r.dictName}」`}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDeleteType(r)}
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

  const dataColumns: ColumnsType<any> = useMemo(
    () => [
      { title: "类型", dataIndex: "dictType", width: 220 },
      { title: "标签", dataIndex: "label", width: 180 },
      { title: "值", dataIndex: "value", width: 180 },
      { title: "排序", dataIndex: "orderNum", width: 80 },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        render: (v: any, r: any) => (
          <Popconfirm
            title="确认变更状态？"
            description={`「${r.label}」将被${Number(v) === 1 ? "停用" : "启用"}`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onToggleData(r, Number(v) !== 1)}
          >
            <Switch checked={Number(v) === 1} checkedChildren="启用" unCheckedChildren="停用" />
          </Popconfirm>
        ),
      },
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
                onClick={() => edit("data", r)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除？"
                description={`将永久删除字典数据「${r.label}」`}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDeleteData(r)}
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

  const typeExtra = (
    <Space size={8}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => edit("type")}>
        新增
      </Button>
      <Button icon={<ReloadOutlined />} onClick={fetchData}>
        刷新
      </Button>
    </Space>
  );

  const dataExtra = (
    <Space size={8}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => edit("data")}>
        新增
      </Button>
      <Button icon={<ReloadOutlined />} onClick={fetchData}>
        刷新
      </Button>
    </Space>
  );

  return (
    <PageShell title="字典管理" description="真实维护字典类型和字典数据，状态变更需确认。">
      <Tabs
        items={[
          {
            key: "type",
            label: "字典类型",
            children: (
              <DataTable
                rowKey={(r) => String(r.id)}
                loading={loading}
                dataSource={typeRows}
                columns={typeColumns}
                extraActions={typeExtra}
              />
            ),
          },
          {
            key: "data",
            label: "字典数据",
            children: (
              <DataTable
                rowKey={(r) => String(r.id)}
                loading={loading}
                dataSource={dataRows}
                columns={dataColumns}
                extraActions={dataExtra}
              />
            ),
          },
        ]}
      />

      <Modal
        title={open === "type" ? "字典类型" : "字典数据"}
        open={!!open}
        onCancel={() => setOpen(null)}
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
          {open === "type" ? (
            <>
              <Form.Item label="名称" name="dictName" rules={[{ required: true }]}>
                <Input placeholder="请输入名称" />
              </Form.Item>
              <Form.Item label="类型" name="dictType" rules={[{ required: true }]}>
                <Input placeholder="请输入类型" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="字典类型" name="dictType" rules={[{ required: true }]}>
                <Input placeholder="请输入字典类型" />
              </Form.Item>
              <Form.Item label="标签" name="label" rules={[{ required: true }]}>
                <Input placeholder="请输入标签" />
              </Form.Item>
              <Form.Item label="值" name="value" rules={[{ required: true }]}>
                <Input placeholder="请输入值" />
              </Form.Item>
              <Form.Item label="排序" name="orderNum">
                <Input type="number" placeholder="数字越小越靠前" />
              </Form.Item>
            </>
          )}
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
