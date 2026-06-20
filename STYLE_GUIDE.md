# Zephyr Admin Style Guide

> 项目级速查规范。写代码时直接对照此页（决策依据见 [zephyr-docs/90-开发规范/06-管理后台UI规范.md](../zephyr-docs/90-开发规范/06-管理后台UI规范.md)）。

## TL;DR

| 场景 | 用法 |
|---|---|
| 新页面外壳 | `<PageShell title=... description=...>` |
| 4 列查询区 | `<QueryForm form={...} onSearch={...}>` |
| 列表 + 卡片 | `<DataTable columns={...} extraActions={...} />` |
| 编辑按钮 | `<Button className="btn-action-edit" shape="circle" icon={<EditOutlined />} />` + Tooltip |
| 删除按钮 | 同上 + className `btn-action-delete` + 必带 Popconfirm |
| 工具栏顺序 | 主操作（primary）→ 工具操作 → 危险操作（danger） |
| Popconfirm | `title="确认 X？"` + `description` 给上下文 |
| Modal | `width=600` `okText="保存"` `cancelText="取消"` `destroyOnClose` |

## 列表页骨架（复制即用）

```tsx
import { Form, Input, Space, Button, Switch, Tooltip, Popconfirm, Modal, message, Tag } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";

export function FooManagement() {
  const [form] = Form.useForm();
  const [data, setData] = useState<Foo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Foo | null>(null);

  const fetchData = async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const resp = await listFoos(params);
      setData(resp.records ?? []);
    } catch (err) {
      message.error("加载失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns: ColumnsType<Foo> = useMemo(() => [
    { title: "名称", dataIndex: "name" },
    { title: "状态", dataIndex: "status", width: 100, render: (s, r) => (
      <Popconfirm title="确认变更状态？" description={`「${r.name}」将被${s===1?'停用':'启用'}`}
                  onConfirm={() => onToggle(r)} okText="确认">
        <Switch checked={s === 1} checkedChildren="启用" unCheckedChildren="停用" />
      </Popconfirm>
    )},
    { title: "创建时间", dataIndex: "createTime", width: 180 },
    {
      title: "操作", key: "actions", fixed: "right", width: 100,
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title="编辑">
            <Button className="btn-action-edit" shape="circle" icon={<EditOutlined />}
                    onClick={() => onEdit(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm title="确认删除？" description={`将永久删除「${record.name}」`}
                        okText="删除" cancelText="取消" okButtonProps={{ danger: true }}
                        onConfirm={() => onDelete(record)}>
              <Button className="btn-action-delete" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ], []);

  return (
    <PageShell title="Foo 管理" description="维护 Foo 数据。">
      <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()}>
        <Form.Item label="名称" name="name">
          <Input allowClear placeholder="请输入名称" />
        </Form.Item>
      </QueryForm>

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        extraActions={
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setOpen(true); }}>
              新增
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(form.getFieldsValue())}>
              刷新
            </Button>
            <Popconfirm title="确认删除选中？" description={`共 ${selected.length} 条，将不可恢复`}
                        okText="删除" okButtonProps={{ danger: true }}
                        onConfirm={onBatchDelete}>
              <Button danger icon={<DeleteOutlined />} disabled={!selected.length}>
                删除选中
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      <Modal title={editing ? "编辑 Foo" : "新增 Foo"} open={open} onCancel={() => setOpen(false)}
             onOk={onSubmit} okText="保存" cancelText="取消" width={600} destroyOnClose>
        <Form layout="vertical" requiredMark="optional">{/* ... */}</Form>
      </Modal>
    </PageShell>
  );
}
```

## 操作列动作字典

| 动作 | 图标 | className | 二次确认 | Tooltip |
|---|---|---|---|---|
| 编辑 | `EditOutlined` | `btn-action-edit` | ❌ | "编辑" |
| 详情 | `EyeOutlined` | `btn-action-edit` | ❌ | "查看详情" |
| 删除 | `DeleteOutlined` | `btn-action-delete` | ✅ | "删除" |
| 重置密码 | `KeyOutlined` | `btn-action-edit` | ✅ | "重置密码" |
| 权限分配 | `KeyOutlined` | `btn-action-edit` | ❌ | "权限分配" |
| 启停 | `Switch` 直接渲染 | — | ✅ via Popconfirm | — |
| 复制 | `CopyOutlined` | `btn-action-edit` | ❌ | "复制 ID" |
| 下载 | `DownloadOutlined` | `btn-action-edit` | ❌ | "下载" |

**操作列宽**：2 按钮 100，3 按钮 140，4 按钮 180。超过 4 个 → `<Dropdown>` 收"更多"。

## Popconfirm 文案

| 场景 | title | description | okText | okButtonProps |
|---|---|---|---|---|
| 单条删除 | "确认删除？" | `将永久删除「${name}」` | "删除" | `{ danger: true }` |
| 批量删除 | "确认删除选中？" | `共 ${n} 条，将不可恢复` | "删除" | `{ danger: true }` |
| 清空 | "确认清空全部？" | "此操作不可恢复，将进入操作审计" | "清空" | `{ danger: true }` |
| 重置密码 | "确认重置密码？" | `用户「${name}」将收到新密码` | "重置" | — |
| 启停 | "确认变更状态？" | `「${name}」将被${enable?'启用':'停用'}` | "确认" | — |
| 普通 | "确认执行？" | — | "确认" | — |

## Tag 颜色语义

| color | 语义 |
|---|---|
| `green` | 成功 / 正常 / 在线 / 已发布 |
| `red` | 失败 / 错误 / 告警 |
| `orange` `gold` | 警告 / 草稿 / 待处理 |
| `blue` | 进行中 / 默认信息 |
| `default` | 已停用 / 未知 |

## ✅ Do

- 操作列固定右侧：`fixed: "right"` + 合理 `width`
- 「新增」按钮文案统一为 **"新增"**（树形例外：新增顶级 / 新增子级）
- 每个列表页**必带**「刷新」按钮
- 危险按钮：`danger` + Popconfirm 双保险
- disabled 加 Tooltip 说原因
- columns 用 `useMemo` 抽出
- API 调用一律 `try/catch` + `message.error("加载失败：" + ...)`
- Modal `okText="保存"` `cancelText="取消"` `destroyOnClose`
- Form `layout="vertical"` + `requiredMark="optional"`
- Input/Select 必带 `allowClear` + `placeholder`

## ❌ Don't

- ❌ `<a>` 当按钮（IE 风格遗留）
- ❌ `<Button type="link">` 文字按钮（除非该列只有 1 个只读详情）
- ❌ 操作列不固定右侧
- ❌ 图标按钮不带 Tooltip
- ❌ 单列超过 4 个按钮
- ❌ 「新增 XX」带尾缀（统一"新增"）
- ❌ "确定要..吗？"句式（统一"确认 X？"）
- ❌ 业务专名硬塞 Popconfirm title（用 description）
- ❌ 直接 `<Switch onChange>` 不带二次确认
- ❌ `Modal` 缺 `destroyOnClose`（产生脏数据）
- ❌ 概览/Dashboard 写死数字（用接口 + Skeleton/Empty 兜底）
- ❌ 单行代码炸弹（Params/Notices/Dictionary 反例必拆）
- ❌ `console.log` 进生产代码

## 现状不一致清单（优先整改）

整改顺序见 [`zephyr-docs/90-开发规范/06-管理后台UI规范.md` §14](../zephyr-docs/90-开发规范/06-管理后台UI规范.md)。

**P0**（视觉断层最严重，先做）：
- `PostManagement.tsx` 操作列 `<a>` 风格 → 改图标按钮
- `MenuManagement.tsx` 操作列检查统一
- `OperationLog.tsx` `LoginLog.tsx` `Notices.tsx` `Params.tsx` `Dictionary.tsx` `CronJobs.tsx` 操作列 → 统一
- `PageShell` props 修复（让 title/description/extra 真渲染）

**P1**（mock 清理）：
- `Overview.tsx` 4 KPI + 资源健康度 + 今日重点 → 接真实 API + Skeleton/Empty 兜底

**P2**（代码物理风格）：
- `Params.tsx` `Notices.tsx` `Dictionary.tsx` 单行代码炸弹必拆，columns 抽 `useMemo`

## 自检清单（PR 前过一遍）

- [ ] 用了 `PageShell` + `QueryForm` + `DataTable` 三件套
- [ ] 操作列 `fixed: "right"` 且按钮风格遵循"图标+Tooltip+Popconfirm"
- [ ] 危险操作 `danger` + Popconfirm 双保险
- [ ] Popconfirm title 是"确认 X？"句式
- [ ] 「新增」按钮文案是"新增"（无尾缀）
- [ ] 必带「刷新」按钮
- [ ] Tag 颜色语义正确
- [ ] Modal `okText="保存"` `cancelText="取消"` `destroyOnClose`
- [ ] columns 用 `useMemo`
- [ ] API 错误用 `message.error`
- [ ] 没有写死字面量数据（mock）
- [ ] 文件 < 400 行
- [ ] `tsc -b` 0 错 / `biome check` 0 新增违规
