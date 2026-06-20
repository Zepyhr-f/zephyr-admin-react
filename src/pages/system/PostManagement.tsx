import React, { useEffect, useState } from 'react';
import { Space, Switch, Modal, Form, Input, InputNumber, Radio, message, Popconfirm, Select, Button, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageShell } from '@/components/PageShell';
import { DataTable } from '@/components/DataTable';
import { QueryForm } from '@/components/QueryForm';
import { getPostPage, savePost, updatePost, removePosts, updatePostStatus } from '@/api/post';
import type { PostVO, PostForm } from '@/api/post';

export const PostManagement: React.FC = () => {
  const [data, setData] = useState<PostVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, size: 10 });
  const [searchParams, setSearchParams] = useState({ postName: '', status: undefined as number | undefined });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form] = Form.useForm<PostForm>();
  const [queryForm] = Form.useForm();

  const fetchData = async (current = pagination.current, size = pagination.size, params = searchParams) => {
    setLoading(true);
    try {
      const res = await getPostPage({ current, size, ...params });
      const pageResult = res as any; // Handle generic casting
      setData(pageResult.records || []);
      setTotal(pageResult.total || 0);
      setPagination({ current, size });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (values: any) => {
    setSearchParams(values);
    fetchData(1, pagination.size, values);
  };

  const handleReset = () => {
    setSearchParams({ postName: '', status: undefined });
    fetchData(1, pagination.size, { postName: '', status: undefined });
  };

  const handleTableChange = (pag: any) => {
    fetchData(pag.current, pag.pageSize);
  };

  const handleAdd = () => {
    setModalMode('add');
    form.resetFields();
    form.setFieldsValue({ status: 1, orderNum: 1 });
    setIsModalVisible(true);
  };

  const handleEdit = (record: PostVO) => {
    setModalMode('edit');
    form.resetFields();
    form.setFieldsValue({ ...record });
    setIsModalVisible(true);
  };

  const handleDelete = async (code: string) => {
    try {
      await removePosts([code]);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (checked: boolean, record: PostVO) => {
    try {
      await updatePostStatus(record.code, checked ? 1 : 0);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'add') {
        await savePost(values);
        message.success('新增成功');
      } else {
        await updatePost(values);
        message.success('修改成功');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
    },
    {
      title: '岗位编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '显示顺序',
      dataIndex: 'orderNum',
      key: 'orderNum',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: PostVO) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="正常"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: PostVO) => (
        <Space size={12}>
          <Tooltip title="编辑">
            <Button
              className="btn-action-edit"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确认删除？"
              description={`将永久删除「${record.postName}」`}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.code)}
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
  ];

  return (
    <PageShell title="岗位管理" description="管理系统岗位信息。">
      <QueryForm
        form={queryForm}
        onSearch={handleSearch}
        onReset={handleReset}
      >
        <Form.Item label="岗位名称" name="postName">
          <Input placeholder="请输入岗位名称" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="岗位状态" name="status">
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
        rowKey="code"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.size,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        extraActions={
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
              刷新
            </Button>
          </Space>
        }
      />

      <Modal
        title={modalMode === 'add' ? '新增岗位' : '编辑岗位'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          {modalMode === 'edit' && <Form.Item name="id" hidden><Input /></Form.Item>}
          
          <Form.Item
            name="postName"
            label="岗位名称"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input placeholder="请输入岗位名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="岗位编码"
            rules={[{ required: true, message: '请输入岗位编码' }]}
          >
            <Input placeholder="请输入岗位编码，如：CEO" disabled={modalMode === 'edit'} />
          </Form.Item>

          <Form.Item
            name="orderNum"
            label="显示顺序"
            rules={[{ required: true, message: '请输入显示顺序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="岗位状态"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={1}>正常</Radio>
              <Radio value={0}>停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
};

export default PostManagement;
