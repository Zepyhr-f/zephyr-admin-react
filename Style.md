# Zephyr Admin React 前端风格指南

> 本文件是 `zephyr-admin-react` 后续前端开发的风格依据。新增页面、组件、交互和视觉优化，应优先遵守本文档中定义的设计语言、布局规范、颜色系统和组件模式。

## 1. 项目定位

`zephyr-admin-react` 是 Zephyr 管理后台前端，面向系统管理、权限管理、监控运维、开发工具和基础设施管理等后台场景。

整体风格应保持：

```text
专业、清爽、克制、工程化、信息密度适中、响应快速、适合长期使用。
```

它不是营销站点，也不是强视觉表现型页面；设计目标是让管理员高效完成查询、审查、配置、维护和监控。

## 2. 技术与组件基线

当前项目技术栈：

```text
React 19
Vite 8
TypeScript 6
Ant Design 6
React Router 7
Zustand
TanStack React Query
Tailwind CSS 4
lucide-react / @ant-design/icons
motion
```

开发风格：

```text
1. 优先复用 Ant Design 组件。
2. 业务页面优先复用项目内统一组件。
3. 样式优先使用 CSS Variables 和 Ant Design token，不随意硬编码新视觉体系。
4. 页面逻辑保持清晰，表格、查询、弹窗、操作按钮应有稳定模式。
```

重要组件：

```text
src/components/PageShell.tsx
src/components/QueryForm.tsx
src/components/DataTable.tsx
src/layouts/admin-layout/index.tsx
src/theme/css-variables.css
src/global.css
```

## 3. 设计关键词

Zephyr Admin 的视觉关键词：

```text
深蓝主色
浅灰布局背景
白色卡片容器
细边框分割
轻阴影
圆角克制
紧凑表格
清晰层级
低干扰动效
亮暗主题可切换
```

避免方向：

```text
1. 避免过度霓虹、赛博朋克、强渐变大面积铺满。
2. 避免营销页式超大标题和夸张插画出现在业务后台页面。
3. 避免每个页面自建一套颜色、圆角、阴影和按钮风格。
4. 避免高饱和红/紫/绿大面积使用。
5. 避免为了“好看”牺牲表格可读性和操作效率。
```

## 4. 色彩系统

### 4.1 主色

默认主色来自 `src/theme/css-variables.css` 和 `src/global.css`：

```css
--color-primary: hsl(220, 94%, 56%);
--color-primary-hover: hsl(220, 94%, 46%);
--color-primary-light: hsl(220, 94%, 96%);

--z-primary: #1E40AF;
--z-accent: #D97706;
```

管理后台主色以 **Zephyr 深蓝** 为核心：

```text
#1E40AF  默认深蓝
#3B82F6  暗色模式亮蓝 / 辅助亮蓝
#2563EB  登录页科技蓝
```

使用规则：

```text
1. 主操作按钮、当前菜单、激活标签、关键强调使用主蓝。
2. 图标、Tab、Breadcrumb 等弱强调可以使用主蓝的透明混合色。
3. 不要在普通业务页面大面积铺满主蓝背景。
4. 橙色 #D97706 只作为告警、资源状态或次级强调色。
```

### 4.2 状态色

沿用 CSS 变量：

```css
--color-success: hsl(150, 70%, 48%);
--color-warning: hsl(45, 100%, 51%);
--color-danger: hsl(0, 78%, 55%);
--color-info: hsl(210, 90%, 55%);
```

使用规则：

```text
成功：启用、正常、通过。
警告：待处理、资源偏高、需要关注。
危险：删除、停用、失败、异常。
信息：提示、说明、处理中。
```

删除类按钮必须明确使用危险色或 Ant Design `danger` 语义，避免和普通操作混淆。

### 4.3 背景与边框

亮色模式：

```css
--color-bg-base: hsl(0, 0%, 98%);
--color-bg-container: hsl(0, 0%, 100%);
--color-bg-layout: hsl(220, 20%, 96%);
--z-bg: #F8FAFC;
--z-surface: #FFFFFF;
--z-border: #E2E8F0;
```

暗色模式：

```css
--color-bg-base: hsl(220, 18%, 7%);
--color-bg-container: hsl(220, 16%, 10%);
--color-bg-layout: hsl(220, 18%, 5%);
--z-bg: #0B0F19;
--z-surface: #111827;
--z-border: #374151;
```

使用规则：

```text
1. 页面底色使用 --z-bg / --color-bg-base。
2. 主要内容容器使用 --z-surface / --color-bg-container。
3. 分割线和卡片边界使用 --z-border / --color-border。
4. 新组件必须兼容 [data-theme="dark"]。
```

## 5. 字体与排版

项目当前字体基线：

```css
--font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
```

后台页面建议：

```text
正文：14px
辅助说明：12px / 13px
页面标题：18px 左右
卡片标题：14px - 16px
表格内容：Ant Design middle 尺寸
行高：1.5 - 1.57
字重：普通 400，标题/重点 500-600
```

排版原则：

```text
1. 信息优先，不追求巨大标题。
2. 中文文案短句清晰，少用营销话术。
3. 表格列名、表单 label、按钮文案保持简短稳定。
4. 同类页面的标题、查询区、操作区、表格区顺序保持一致。
```

## 6. 间距、圆角与阴影

### 6.1 间距

项目使用 4px 基准：

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 24px;
--spacing-6: 32px;
```

常用规则：

```text
页面外边距：8px 16px 16px
卡片内边距：16px 20px 或 24px
查询表单字段间距：16px
卡片/模块之间：8px - 12px
顶部 Header 高度：48px
Tab 高度：32px
```

### 6.2 圆角

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

使用规则：

```text
普通按钮/标签：6px - 8px
卡片/弹窗：8px - 12px
登录卡片/特殊品牌容器：可使用 20px - 24px
Logo 标记：10px 左右
```

### 6.3 阴影

```css
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
--shadow-dropdown: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.04);
--shadow-modal: 0 12px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
```

后台业务页面优先轻阴影或无阴影，依靠边框和留白建立层级。登录页可以更具品牌感，使用玻璃拟态与柔和光效。

## 7. 布局规范

### 7.1 应用框架

后台主框架由 `AdminLayout` 负责：

```text
左侧 Sider：220px，可折叠
顶部 Header：48px
页面标签栏：32px 高，横向滚动
内容区：Content overflow auto
```

视觉结构：

```text
Sider 使用白色/暗色 surface，右侧细边框。
Header 保持透明或低干扰背景。
内容区使用浅灰底，业务内容通过 Card 承载。
```

### 7.2 页面结构

业务页面建议结构：

```tsx
<PageShell>
  <QueryForm>...</QueryForm>
  <DataTable ... />
  <Modal>...</Modal>
</PageShell>
```

通用顺序：

```text
1. 查询区 QueryForm
2. 表格区 DataTable
3. 弹窗/抽屉表单 Modal/Drawer
4. 辅助反馈 message / Popconfirm / Tooltip
```

不要让每个页面独立实现一套查询表单和表格容器。

## 8. 组件风格

### 8.1 QueryForm

`QueryForm` 是查询区统一组件。

当前规则：

```text
Card 容器，底部间距 8px
24 栅格布局
一行 4 个查询项，每个 span=6
label 宽度 70px
查询/重置按钮右侧对齐
输入框宽度通常 200px
```

新增查询页面应优先复用它。

### 8.2 DataTable

`DataTable` 是列表统一组件。

当前规则：

```text
Card 包裹 Table
Card body padding: 16px 20px
Table size="middle"
分页底部居中
显示总数：共 N 条
支持 pageSize changer 和 quick jumper
extraActions 放在表格左上角
```

操作列建议：

```text
查看 / 编辑 / 重置 / 删除 使用 Tooltip + Icon Button。
危险操作必须加 Popconfirm。
删除按钮使用危险语义样式。
操作列宽度控制在 120px - 180px。
```

### 8.3 Card

Card 是后台页面主要容器。

使用规则：

```text
1. 查询、表格、统计面板都用 Card 承载。
2. Card 内边距保持统一，不随意嵌套过多 Card。
3. 卡片标题简短，避免长段说明放在 title。
4. 统计类 Card 可以用 Row/Col 响应式布局。
```

### 8.4 Modal / Drawer

适用场景：

```text
Modal：新增、编辑、确认性配置。
Drawer：系统设置、右侧面板、详情辅助信息。
```

规则：

```text
普通表单弹窗宽度 600px 左右。
表单使用 vertical 布局。
按钮文案明确：保存、取消、确认、删除。
```

### 8.5 Button

按钮语义：

```text
primary：新增、查询、保存、提交。
default：重置、取消、普通次级操作。
text：Header 图标按钮、低强调操作。
danger：删除、停用、清除危险动作。
```

同一操作区按钮宽度尽量统一，例如查询/重置按钮可保持 80px。

## 9. 登录页风格

登录页比后台业务页更偏品牌展示，当前风格为：

```text
浅色科技背景
蓝紫径向光晕
网格背景
SVG 科技环形动效
白色半透明玻璃卡片
大圆角 24px
柔和阴影
```

可保留的品牌元素：

```text
蓝紫渐变标题
科技网络节点动效
玻璃拟态登录卡片
安全登录图标
SSO 扩展入口
```

注意：登录页可以有动效和更强视觉表现，但进入后台后应回归克制、清晰和高效率。

## 10. 动效规范

现有动效：

```text
页面进入：opacity + translateY 8px，250ms
Tab/按钮：all 0.2s
登录页科技图形：float、spin、pulse、blink-light
```

使用规则：

```text
1. 后台业务页面动效应轻，不超过 150ms - 250ms。
2. 动效只用于状态反馈和层级变化，不制造视觉负担。
3. 长循环动画只适合登录页、空状态或品牌展示区域。
4. 表格、查询、弹窗不要使用夸张位移或弹跳动画。
```

## 11. 图标规范

当前项目使用：

```text
@ant-design/icons
lucide-react
```

规则：

```text
1. Ant Design 组件内优先使用 @ant-design/icons。
2. 菜单图标通过 IconMapper 映射，保持统一尺寸。
3. Header 图标按钮尺寸约 18px。
4. 操作列图标按钮使用 Tooltip 说明语义。
5. 不要混用过多图标风格；同一区域保持一套图标来源。
```

## 12. 亮暗主题规范

项目通过 `useThemeStore` 和 `data-theme="dark"` 切换主题。

关键变量：

```css
--z-primary
--z-button-hover
--z-bg
--z-surface
--z-text
--z-text-muted
--z-border
```

新增组件必须：

```text
1. 使用 CSS 变量而不是只写死亮色颜色。
2. 在暗色模式下保证文字和边框对比度。
3. 不要直接假设背景永远是白色。
4. 自定义 hover 背景可使用 color-mix 与 --z-button-hover。
```

推荐写法：

```css
background: var(--z-surface);
border: 1px solid var(--z-border);
color: var(--z-text);
```

或：

```css
background: color-mix(in srgb, var(--z-button-hover) 15%, transparent);
```

## 13. 表单与数据页模式

典型管理页应保持：

```text
查询条件简洁
表格字段有清晰中文列名
状态字段用 Switch / Tag / Badge 表示
删除和重置类动作二次确认
操作成功后 message.success
操作失败 console.error + message.error 或统一错误处理
```

表单字段：

```text
新增/编辑弹窗使用 vertical Form。
必填项写清楚校验文案。
placeholder 简短，例如“输入账号或姓名”。
Select 的“全部”状态应支持 allowClear。
```

## 14. 文案风格

后台文案应：

```text
短、准、稳定、面向操作。
```

推荐：

```text
新增用户
编辑用户
删除账号
重置密码
状态已更新
保存
取消
查询
重置
```

避免：

```text
立即开启你的超强管理之旅
酷炫查看所有数据
一键魔法生成
```

错误提示应明确用户下一步能做什么。

## 15. 响应式规范

当前登录页在 `max-width: 960px` 下切换为单列。

后台业务页建议：

```text
1. 查询区在窄屏下应允许换行。
2. 表格允许横向滚动，不强行压缩到不可读。
3. Header 操作区保持紧凑。
4. Tab 栏已经支持横向滚动，新增样式不得破坏。
```

## 16. 开发约束

后续前端开发必须遵守：

```text
1. 新页面优先复用 PageShell、QueryForm、DataTable。
2. 优先使用 Ant Design 组件，不重复造基础组件。
3. 优先使用 CSS 变量，不新建割裂的颜色系统。
4. 保持亮暗主题兼容。
5. 表格和表单页面保持一致的信息结构。
6. 危险操作必须二次确认。
7. 不在前端写入任何真实 token、key、password、连接串。
8. 不把临时调试样式和 console 噪声长期留在代码里。
```

## 17. Claude Code / AI 开发提示

以后让 AI 或 Claude Code 修改本项目 UI 前，应先读取：

```text
Style.md
src/theme/css-variables.css
src/global.css
src/components/QueryForm.tsx
src/components/DataTable.tsx
src/layouts/admin-layout/index.tsx
```

对 AI 的要求：

```text
1. 保持 Zephyr Admin 深蓝、浅灰、白卡片、细边框、轻阴影的后台风格。
2. 新增业务页必须复用 PageShell + QueryForm + DataTable 模式。
3. 不引入新的强视觉体系，不做营销页风格。
4. 保证亮暗主题变量可用。
5. 不读取或输出 .env、token、password、连接串。
6. 不提交、不推送，由哈宝最终审查验证。
```

## 18. 快速检查清单

新增或修改页面完成后检查：

```text
[ ] 是否符合深蓝主色、浅灰背景、白色卡片、细边框风格。
[ ] 是否复用 QueryForm / DataTable / PageShell。
[ ] 是否兼容暗色模式。
[ ] 表格分页、操作列、Popconfirm 是否规范。
[ ] 按钮语义是否清晰。
[ ] 是否没有真实密钥或敏感信息。
[ ] 是否通过 npm run build。
[ ] 是否通过 npm run lint 或记录已有 lint 基线问题。
```
