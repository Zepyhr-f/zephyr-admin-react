import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, KeyOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
  Switch,
  Popconfirm,
  Modal,
  message
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { getRolePage, submitRole, updateRoleStatus, removeRoles } from "@/api/role";
import type { RoleVO, RoleForm } from "@/api/role";

const dataScopeMap: Record<number, string> = {
  1: "全部数据",
  2: "自定义",
  3: "本部门",
  4: "本部门及以下",
  5: "仅本人"
};

export function RoleManagement() {
  const [open, setOpen] = useState(false);
  const [queryForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  
  const [data, setData] = useState<RoleVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<Record<string, unknown>>({});
  
  // Pagination
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });
  
  const [editingRole, setEditingRole] = useState<RoleVO | null>(null);

  const fetchData = async (params: Record<string, unknown> = queryParams, current = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await getRolePage({ ...params, current, size });
      // The payload structure from the backend's IPage
      const payload = res as unknown as { records: RoleVO[], total: number, current: number, size: number };
      if (payload && payload.records) {
        setData(payload.records);
        setPagination(prev => ({
          ...prev,
          current: payload.current,
          pageSize: payload.size,
          total: payload.total
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const onSearch = (values: Record<string, unknown>) => {
    // When searching, reset to page 1
    setPagination(prev => ({ ...prev, current: 1 }));
    setQueryParams(values);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchData(queryParams, newPagination.current, newPagination.pageSize);
  };

  const onStatusChange = async (checked: boolean, record: RoleVO) => {
    try {
      await updateRoleStatus(record.id, checked ? 1 : 0);
      message.success("状态已更新");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (record: RoleVO) => {
    try {
      await removeRoles([record.id]);
      message.success("删除成功");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingRole(null);
    modalForm.resetFields();
    setOpen(true);
  };

  const openEditModal = (record: RoleVO) => {
    setEditingRole(record);
    modalForm.setFieldsValue({
      ...record,
      orderNum: record.roleSort // Map from VO to Form
    });
    setOpen(true);
  };

  const onModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const payload: RoleForm = { ...values };
      
      if (editingRole) {
        payload.id = editingRole.id;
      } else {
        if (payload.status === undefined) payload.status = 1;
      }
      
      await submitRole(payload);
      message.success(editingRole ? "修改成功" : "新增成功");
      setOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnsType<RoleVO> = [
    { title: "角色名称", dataIndex: "roleName", width: 180 },
    { title: "角色标识", dataIndex: "code", width: 160 },
    { title: "显示顺序", dataIndex: "roleSort", width: 100 },
    { 
      title: "数据范围", 
      dataIndex: "dataScope",
      render: (val: number) => dataScopeMap[val] || "未知"
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (status: number, record) => (
        <Switch 
          checked={status === 1} 
          onChange={(checked) => onStatusChange(checked, record)} 
          checkedChildren="正常"
          unCheckedChildren="停用"
        />
      )
    },
    { title: "创建时间", dataIndex: "createTime" },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title="权限分配">
            <Button className="btn-action-edit" shape="circle" icon={<KeyOutlined />} />
          </Tooltip>
          <Tooltip title="编辑角色">
            <Button className="btn-action-edit" shape="circle" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Tooltip title="删除角色">
            <Popconfirm title="确定删除该角色吗？" onConfirm={() => onDelete(record)}>
              <Button className="btn-action-delete" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageShell
      title="角色管理"
      description="关键能力：菜单/按钮级权限 + 数据范围（Data Scope）。"
    >
      <QueryForm
        form={queryForm}
        onSearch={onSearch}
      >
        <Form.Item label="角色名称" name="roleName">
          <Input placeholder="输入角色名称" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 200 }}
            options={[
              { label: "启用", value: 1 },
              { label: "停用", value: 0 }
            ]}
          />
        </Form.Item>
      </QueryForm>

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        extraActions={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>新增角色</Button>
          </Space>
        }
      />

      <Modal
        title={editingRole ? "编辑角色" : "新增角色"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onModalOk}
        okText="保存"
        width={500}
      >
        <Form form={modalForm} layout="vertical" requiredMark="optional">
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input placeholder="如：超级管理员" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色标识"
            rules={[{ required: true, message: "请输入角色标识" }]}
          >
            <Input placeholder="如：admin" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="orderNum"
            label="显示顺序"
            rules={[{ required: true, message: "请输入显示顺序" }]}
          >
            <Input type="number" placeholder="如：1" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
