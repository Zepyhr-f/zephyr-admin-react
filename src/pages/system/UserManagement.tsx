import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, KeyOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tooltip,
  Switch,
  Popconfirm,
  message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import { getUserList, submitUser, updateUserStatus, removeUsers, resetUserPassword } from "@/api/user";
import type { UserVO, UserForm } from "@/api/user";

export function UserManagement() {
  const [open, setOpen] = useState(false);
  const [queryForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  
  const [data, setData] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<Record<string, unknown>>({});
  
  const [editingUser, setEditingUser] = useState<UserVO | null>(null);

  const fetchData = async (params = queryParams) => {
    setLoading(true);
    try {
      const res = await getUserList(params);
      setData((res as any).list || []);
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
    setQueryParams(values);
  };

  const onStatusChange = async (checked: boolean, record: UserVO) => {
    try {
      await updateUserStatus(record.id, checked ? 1 : 0);
      message.success("状态已更新");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (record: UserVO) => {
    try {
      await removeUsers([record.id]);
      message.success("删除成功");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const onResetPassword = async (record: UserVO) => {
    try {
      await resetUserPassword(record.id);
      message.success("密码已重置为123456");
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    modalForm.resetFields();
    setOpen(true);
  };

  const openEditModal = (record: UserVO) => {
    setEditingUser(record);
    modalForm.setFieldsValue({
      ...record,
      nickName: record.username, // Map username back to nickName for the form
    });
    setOpen(true);
  };

  const onModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const payload: UserForm = {
        ...values,
      };
      if (editingUser) {
        payload.id = editingUser.id;
        // preserve code for existing user if code isn't modified in form
        payload.code = editingUser.code;
      } else {
        // give a default status of 1 (正常) if not set
        if (payload.status === undefined) payload.status = 1;
      }
      
      await submitUser(payload);
      message.success(editingUser ? "修改成功" : "新增成功");
      setOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnsType<UserVO> = [
      { title: "账号", dataIndex: "username" },
      { title: "真实姓名", dataIndex: "realName" },
      { title: "部门", dataIndex: "deptName" },
      { title: "手机号", dataIndex: "phone" },
      { title: "角色", dataIndex: "roleCodes", render: (roles: string[]) => roles?.join(", ") || "-" },
      {
        title: "状态",
        dataIndex: "status",
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
        width: 150,
        render: (_, record) => (
          <Space size={12}>
            <Tooltip title="编辑账号">
              <Button className="btn-action-edit" shape="circle" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            </Tooltip>
            <Tooltip title="重置密码">
              <Popconfirm title="确定重置该用户的密码吗？" onConfirm={() => onResetPassword(record)}>
                <Button className="btn-action-edit" shape="circle" icon={<KeyOutlined />} />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="删除账号">
              <Popconfirm title="确定删除该用户吗？" onConfirm={() => onDelete(record)}>
                <Button className="btn-action-delete" shape="circle" icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        )
      }
    ];

  return (
    <PageShell>
      <QueryForm
        form={queryForm}
        onSearch={onSearch}
      >
        <Form.Item label="账号/姓名" name="username">
          <Input placeholder="输入账号或姓名" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="手机号" name="phone">
          <Input placeholder="输入手机号" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="部门编码" name="deptCode">
          <Input placeholder="输入部门编码" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 200 }}
            options={[
              { label: "正常", value: 1 },
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
        pagination={{ pageSize: 10, showSizeChanger: true }}
        extraActions={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              新增用户
            </Button>
          </Space>
        }
      />

      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onModalOk}
        okText="保存"
        width={600}
      >
        <Form form={modalForm} layout="vertical" requiredMark="optional">
          <Form.Item
            name="nickName"
            label="账号(登录名)"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input placeholder="如：admin01" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: "请输入真实姓名" }]}
          >
            <Input placeholder="如：张三" />
          </Form.Item>
          <Form.Item name="deptCode" label="部门编码">
            <Input placeholder="如：总部/IT，后期将替换为树形选择器" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
