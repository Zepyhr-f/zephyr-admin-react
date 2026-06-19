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
  TreeSelect,
  Radio,
  InputNumber,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { getMenuTree, removeMenus, saveMenu, updateMenu, updateMenuStatus } from "@/api/menu";
import type { MenuForm, MenuVO } from "@/api/menu";

export function MenuManagement() {
  const [open, setOpen] = useState(false);
  const [modalForm] = Form.useForm();

  const [data, setData] = useState<MenuVO[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingMenu, setEditingMenu] = useState<MenuVO | null>(null);

  const menuType = Form.useWatch("menuType", modalForm);

  const normalizeMenu = (item: MenuVO): MenuVO => {
    const code = item.code || item.menuCode || "";
    const children = item.children?.map(normalizeMenu).filter(Boolean) || [];
    return {
      ...item,
      code,
      parentCode: item.parentCode || "0",
      status: item.status ?? 1,
      children: children.length > 0 ? children : undefined,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMenuTree();
      const list = (res.list || []).map(normalizeMenu);
      setData(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusChange = async (checked: boolean, record: MenuVO) => {
    try {
      await updateMenuStatus(record.code, checked ? 1 : 0);
      message.success("状态已更新");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (record: MenuVO) => {
    try {
      if (record.children && record.children.length > 0) {
        message.warning("包含子级菜单，不允许直接删除！");
        return;
      }
      await removeMenus([record.code]);
      message.success("删除成功");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = (parentCode?: string) => {
    setEditingMenu(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      parentCode: parentCode || "0",
      menuType: "C",
      orderNum: 1,
      status: 1,
    });
    setOpen(true);
  };

  const openEditModal = (record: MenuVO) => {
    setEditingMenu(record);
    modalForm.setFieldsValue({
      ...record,
      code: record.code,
      parentCode: record.parentCode || "0",
      status: record.status ?? 1,
    });
    setOpen(true);
  };

  const onModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const payload: MenuForm = {
        ...values,
        parentCode: values.parentCode || "0",
        status: values.status ?? 1,
      };

      if (editingMenu) {
        payload.id = editingMenu.id;
        payload.code = editingMenu.code;
        await updateMenu(payload);
        message.success("修改成功");
      } else {
        await saveMenu(payload);
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

  const formatTreeData = (list: MenuVO[], disabledCode?: string): DataNode[] => {
    return list.map((item) => ({
      value: item.code,
      title: item.menuName,
      disabled: item.code === disabledCode,
      children: item.children ? formatTreeData(item.children, disabledCode) : undefined,
    })) as DataNode[];
  };

  const columns: ColumnsType<MenuVO> = [
    { title: "菜单名称", dataIndex: "menuName", width: 220 },
    {
      title: "图标",
      dataIndex: "icon",
      width: 80,
      render: (icon: string) => (icon ? <span>{icon}</span> : "-"),
    },
    {
      title: "类型",
      dataIndex: "menuType",
      width: 80,
      render: (type: string) => {
        if (type === "M") return <Tag color="blue">目录</Tag>;
        if (type === "C") return <Tag color="green">菜单</Tag>;
        if (type === "F") return <Tag color="purple">按钮</Tag>;
        return type;
      },
    },
    { title: "编码", dataIndex: "code", width: 160 },
    { title: "路由地址", dataIndex: "path", width: 180 },
    { title: "组件路径", dataIndex: "component", width: 180 },
    { title: "权限标识", dataIndex: "perms", width: 160 },
    { title: "排序", dataIndex: "orderNum", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: number, record) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => onStatusChange(checked, record)}
          checkedChildren="正常"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title="新增下级">
            <Button className="btn-action-edit" shape="circle" icon={<PlusOutlined />} onClick={() => openAddModal(record.code)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button className="btn-action-edit" shape="circle" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm title="确定删除该菜单吗？" onConfirm={() => onDelete(record)}>
              <Button className="btn-action-delete" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageShell title="菜单管理" description="配置系统菜单、按钮、权限标识、路由等。">
      <DataTable
        rowKey="code"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        extraActions={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddModal()}>
              新增顶级菜单
            </Button>
          </Space>
        }
      />

      <Modal title={editingMenu ? "编辑菜单" : "新增菜单"} open={open} onCancel={() => setOpen(false)} onOk={onModalOk} okText="保存" width={600}>
        <Form form={modalForm} layout="vertical" requiredMark="optional">
          <Form.Item name="parentCode" label="上级菜单">
            <TreeSelect
              treeData={[{ value: "0", title: "顶级菜单" }, ...formatTreeData(data, editingMenu?.code)]}
              placeholder="请选择上级菜单"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item name="menuType" label="菜单类型" rules={[{ required: true, message: "请选择菜单类型" }]}>
            <Radio.Group>
              <Radio value="M">目录</Radio>
              <Radio value="C">菜单</Radio>
              <Radio value="F">按钮</Radio>
            </Radio.Group>
          </Form.Item>

          <Space size="large" className="w-full">
            <Form.Item name="menuName" label="菜单名称" rules={[{ required: true, message: "请输入菜单名称" }]} className="w-[260px]">
              <Input placeholder="如：系统管理" autoComplete="off" />
            </Form.Item>

            <Form.Item name="code" label="菜单编码" rules={[{ required: true, message: "请输入菜单编码" }]} className="w-[260px]">
              <Input placeholder="如：system" autoComplete="off" disabled={!!editingMenu} />
            </Form.Item>
          </Space>

          <Space size="large" className="w-full">
            <Form.Item name="orderNum" label="显示顺序" rules={[{ required: true, message: "请输入显示顺序" }]} className="w-[260px]">
              <InputNumber min={0} className="w-full" placeholder="如：1" />
            </Form.Item>
            <Form.Item name="status" label="状态" className="w-[260px]">
              <Radio.Group>
                <Radio value={1}>正常</Radio>
                <Radio value={0}>停用</Radio>
              </Radio.Group>
            </Form.Item>
          </Space>

          {(menuType === "M" || menuType === "C") && (
            <Space size="large" className="w-full">
              <Form.Item name="icon" label="菜单图标" className="w-[260px]">
                <Input placeholder="如：SettingOutlined" autoComplete="off" />
              </Form.Item>

              <Form.Item name="path" label="路由地址" rules={[{ required: true, message: "请输入路由地址" }]} className="w-[260px]">
                <Input placeholder="如：/system" autoComplete="off" />
              </Form.Item>
            </Space>
          )}

          {menuType === "C" && (
            <Form.Item name="component" label="组件路径" rules={[{ required: true, message: "请输入组件路径" }]}>
              <Input placeholder="如：system/MenuManagement" autoComplete="off" />
            </Form.Item>
          )}

          {(menuType === "C" || menuType === "F") && (
            <Form.Item name="perms" label="权限标识">
              <Input placeholder="如：sys:menu:list" autoComplete="off" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageShell>
  );
}
