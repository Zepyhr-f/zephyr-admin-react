import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Space,
  Tooltip,
  Switch,
  Popconfirm,
  Modal,
  message,
  TreeSelect
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getDeptTree, saveDept, updateDept, removeDepts } from "@/api/dept";
import type { DeptVO, DeptForm } from "@/api/dept";

export function DepartmentManagement() {
  const [open, setOpen] = useState(false);
  const [modalForm] = Form.useForm();
  
  const [data, setData] = useState<DeptVO[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingDept, setEditingDept] = useState<DeptVO | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDeptTree();
      const list = (res as any).list || [];
      
      // Recursively remove empty children arrays so Antd Table knows it's a leaf node
      const cleanEmptyChildren = (data: DeptVO[]) => {
        data.forEach(item => {
          if (item.children && item.children.length === 0) {
            item.children = undefined;
          } else if (item.children && item.children.length > 0) {
            cleanEmptyChildren(item.children);
          }
        });
      };
      
      cleanEmptyChildren(list);
      setData(list);
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
  }, []);

  const onStatusChange = async (checked: boolean, record: DeptVO) => {
    try {
      const payload: DeptForm = {
        id: record.id,
        code: record.code,
        deptName: record.deptName,
        orderNum: record.orderNum,
        parentCode: record.parentCode,
        status: checked ? 1 : 0
      };
      await updateDept(payload);
      message.success("状态已更新");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (record: DeptVO) => {
    try {
      if (record.children && record.children.length > 0) {
        message.warning("包含子级部门，不允许直接删除！");
        return;
      }
      await removeDepts([record.id]);
      message.success("删除成功");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = (parentCode?: string) => {
    setEditingDept(null);
    modalForm.resetFields();
    if (parentCode) {
      modalForm.setFieldsValue({ parentCode });
    }
    setOpen(true);
  };

  const openEditModal = (record: DeptVO) => {
    setEditingDept(record);
    modalForm.setFieldsValue({
      ...record
    });
    setOpen(true);
  };

  const onModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const payload: DeptForm = { ...values };
      
      if (editingDept) {
        payload.id = editingDept.id;
        await updateDept(payload);
        message.success("修改成功");
      } else {
        if (payload.status === undefined) payload.status = 1;
        await saveDept(payload);
        message.success("新增成功");
      }
      
      setOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  interface DataNode {
    value: string;
    title: string;
    children?: DataNode[];
  }

  const formatTreeData = (list: DeptVO[]): DataNode[] => {
    return list.map(item => ({
      value: item.code,
      title: item.deptName,
      children: item.children ? formatTreeData(item.children) : undefined
    }));
  };

  const columns: ColumnsType<DeptVO> = [
    { title: "部门名称", dataIndex: "deptName", width: 220 },
    { title: "部门编码", dataIndex: "code", width: 180 },
    { title: "排序", dataIndex: "orderNum", width: 100 },
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
          <Tooltip title="新增下级">
            <Button className="btn-action-edit" shape="circle" icon={<PlusOutlined />} onClick={() => openAddModal(record.code)} />
          </Tooltip>
          <Tooltip title="编辑部门">
            <Button className="btn-action-edit" shape="circle" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Tooltip title="删除部门">
            <Popconfirm title="确定删除该部门吗？" onConfirm={() => onDelete(record)}>
              <Button className="btn-action-delete" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageShell
      title="部门管理"
      description="管理系统的组织架构（树形表格展示）。"
    >
      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        extraActions={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddModal()}>新增顶级部门</Button>
          </Space>
        }
      />

      <Modal
        title={editingDept ? "编辑部门" : "新增部门"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onModalOk}
        okText="保存"
        width={500}
      >
        <Form form={modalForm} layout="vertical" requiredMark="optional">
          <Form.Item name="parentCode" label="上级部门">
            <TreeSelect
              treeData={formatTreeData(data)}
              placeholder="请选择上级部门"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: "请输入部门名称" }]}
          >
            <Input placeholder="如：研发部" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门编码"
            rules={[{ required: true, message: "请输入部门编码" }]}
          >
            <Input placeholder="如：dept_dev" autoComplete="off" disabled={!!editingDept} />
          </Form.Item>
          <Form.Item
            name="orderNum"
            label="显示顺序"
            rules={[{ required: true, message: "请输入显示顺序" }]}
          >
            <Input type="number" placeholder="如：1" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
