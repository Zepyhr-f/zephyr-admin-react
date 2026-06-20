import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import {
	Breadcrumb,
	Dropdown,
	Layout,
	Menu,
	Space,
	Typography,
	Button,
	Drawer,
} from "antd";
import type { MenuProps } from "antd";
import {
	ReloadOutlined,
	SettingOutlined,
	LogoutOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	MoonOutlined,
	SunOutlined,
	UserOutlined,
	CloseOutlined,
	AppstoreOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/use-auth-store";
import { useThemeStore } from "@/store/use-theme-store";
import client from "@/api/client";
import { DynamicRoutes } from "@/routes/dynamic-routes";
import { getIconElement } from "@/components/IconMapper";

const { Header, Sider, Content } = Layout;

/* ── helpers ─────────────────────────────────────────────── */

export type TabItem = {
	key: string;
	title: string;
	closable?: boolean;
};

const PRESET_COLORS = [
	"#1E40AF", // 默认深蓝 (Zephyr)
	"#1890FF", // Ant Design 蓝 (Daybreak)
	"#2F54EB", // Geekblue
	"#0284C7", // Sky blue
	"#0EA5E9", // Light blue
	"#8B5CF6", // Violet
];

const PRESET_COLORS_DARK = [
	"#3B82F6", // 亮蓝 (默认)
	"#40A9FF", // 亮 Ant 蓝
	"#597EF7", // 亮 Geekblue
	"#38BDF8", // 亮 Sky blue
	"#7DD3FC", // 亮淡蓝
	"#A78BFA", // 亮紫
];

const TABS_CACHE_KEY = "zephyr_tabs";

function loadTabs(): TabItem[] {
	try {
		const raw = localStorage.getItem(TABS_CACHE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveTabs(tabs: TabItem[]) {
	try {
		localStorage.setItem(TABS_CACHE_KEY, JSON.stringify(tabs));
	} catch {
		// ignore
	}
}

function flattenMenus(menus: any[]): any[] {
	const out: any[] = [];
	for (const m of menus) {
		out.push(m);
		if (m.children) out.push(...flattenMenus(m.children));
	}
	return out;
}

function buildMenuItems(menus: any[]): MenuProps["items"] {
	return menus
		.filter((m) => m.menuType !== "F") // 过滤掉按钮权限
		.map((m) => {
			const baseItem = {
				key: m.path || m.code,
				icon: getIconElement(m.icon),
				label: m.menuName,
			};

			// 只有目录类型(M)才可能作为 SubMenu
			if (m.menuType === "M") {
				let childrenItems = undefined;
				if (m.children && m.children.length > 0) {
					const items = buildMenuItems(m.children);
					if (items && items.length > 0) {
						childrenItems = items;
					}
				}
				return {
					...baseItem,
					children: childrenItems, // 如果没有子项则为 undefined，仍然表现为普通项但不可跳转（符合目录预期）
				};
			}

			// 菜单类型(C) 或其他，直接作为可点击路由项
			return {
				...baseItem,
				label: <Link to={m.path || "/"}>{m.menuName}</Link>,
			};
		});
}

function calcOpenKeys(pathname: string) {
	const seg = pathname.split("/").filter(Boolean)[0];
	return seg ? [`/${seg}`] : [];
}

/* ── component ───────────────────────────────────────────── */

export default function AdminLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { logout, user, menus } = useAuthStore();
	const {
		isDark,
		toggleTheme,
		primaryColor,
		darkPrimaryColor,
		setPrimaryColor,
		buttonHoverColor,
		darkButtonHoverColor,
		setButtonHoverColor,
	} = useThemeStore();

	const currentPrimaryColor = isDark ? darkPrimaryColor : primaryColor;
	const currentButtonHoverColor = isDark
		? darkButtonHoverColor
		: buttonHoverColor;
	const presetColors = isDark ? PRESET_COLORS_DARK : PRESET_COLORS;

	const [settingsOpen, setSettingsOpen] = useState(false);

	const all = useMemo(() => flattenMenus(menus || []), [menus]);
	const menuItems = useMemo(() => buildMenuItems(menus || []), [menus]);

	const homeTab: TabItem = useMemo(
		() => ({ key: "/", title: "概览", closable: false }),
		[],
	);
	const [tabs, setTabs] = useState<TabItem[]>(() => {
		const initial = loadTabs();
		const withHome = initial.length ? initial : [homeTab];
		// 兜底：保证有首页
		if (!withHome.some((t) => t.key === "/")) return [homeTab, ...withHome];
		return withHome;
	});

	/**
	 * 右键 Tab 关闭操作的统一入口。
	 *
	 * 关闭后如果激活 tab 被关掉，自动 navigate 到剩下 tabs 中最接近原位置的那个；
	 * 首页 `/` (closable=false) 永远保留，不会被任何关闭操作清掉。
	 */
	const closeTabsBy = (
		targetKey: string,
		action: "current" | "left" | "right" | "others" | "all",
	) => {
		setTabs((prev) => {
			const idx = prev.findIndex((t) => t.key === targetKey);
			if (idx < 0) return prev;

			const keepIfPinned = (t: TabItem) => t.closable === false;
			let next: TabItem[];
			switch (action) {
				case "current":
					next = prev.filter((t, i) => keepIfPinned(t) || i !== idx);
					break;
				case "left":
					next = prev.filter((t, i) => keepIfPinned(t) || i >= idx);
					break;
				case "right":
					next = prev.filter((t, i) => keepIfPinned(t) || i <= idx);
					break;
				case "others":
					next = prev.filter((t, i) => keepIfPinned(t) || i === idx);
					break;
				case "all":
					next = prev.filter((t) => keepIfPinned(t));
					break;
			}
			if (next.length === 0) next = [homeTab];
			saveTabs(next);

			// 如果当前激活 tab 被关掉了，跳到 next 里最接近原 idx 的那个
			if (!next.some((t) => t.key === activeTabKey)) {
				const fallback =
					next[Math.min(idx, next.length - 1)] || next[0] || homeTab;
				navigate(fallback.key, { replace: true });
			}
			return next;
		});
	};

	/** 单 tab 的右键菜单 items + 各项 disabled 状态（基于 tab 在数组里的位置） */
	const buildTabContextMenu = (tab: TabItem): MenuProps => {
		const idx = tabs.findIndex((t) => t.key === tab.key);
		const closableLeft = tabs.slice(0, idx).some((t) => t.closable !== false);
		const closableRight = tabs.slice(idx + 1).some((t) => t.closable !== false);
		const closableOthers = tabs.some(
			(t, i) => i !== idx && t.closable !== false,
		);
		const closableAny = tabs.some((t) => t.closable !== false);
		return {
			items: [
				{
					key: "current",
					label: "关闭当前",
					icon: <CloseOutlined />,
					disabled: tab.closable === false,
				},
				{ type: "divider" },
				{ key: "left", label: "关闭左边", disabled: !closableLeft },
				{ key: "right", label: "关闭右边", disabled: !closableRight },
				{ key: "others", label: "关闭其他", disabled: !closableOthers },
				{ type: "divider" },
				{ key: "all", label: "关闭所有", danger: true, disabled: !closableAny },
			],
			onClick: ({ key, domEvent }) => {
				domEvent.stopPropagation();
				closeTabsBy(
					tab.key,
					key as "current" | "left" | "right" | "others" | "all",
				);
			},
		};
	};

	const selectedKeys = useMemo(
		() => [location.pathname === "/" ? "/" : location.pathname],
		[location.pathname],
	);

	const openKeys = useMemo(
		() => calcOpenKeys(location.pathname),
		[location.pathname],
	);

	const activeTabKey = useMemo(
		() => (location.pathname === "/" ? "/" : location.pathname),
		[location.pathname],
	);

	// 每次进入一个页面，都确保“开一个标签”（若已存在则激活，不重复添加）
	useEffect(() => {
		const pathname = activeTabKey;
		const hit = all.find(
			(r) => r.path === pathname || (pathname === "/" && r.path === "/"),
		);
		const title = hit?.menuName || (pathname === "/" ? "概览" : pathname);
		const tab: TabItem = {
			key: pathname,
			title,
			closable: pathname !== "/",
		};

		setTabs((prev) => {
			if (prev.some((t) => t.key === tab.key)) return prev;
			const next = [...prev, tab];
			saveTabs(next);
			return next;
		});
	}, [activeTabKey, all]);

	const breadcrumbItems = useMemo(() => {
		const hit = all.find(
			(r) =>
				r.path === location.pathname ||
				(location.pathname === "/" && r.path === "/"),
		);
		if (!hit) return [{ title: "Zephyr" }];

		// Attempt to find parent using the menus hierarchy, but a flat search for parentCode works too.
		const parent = all.find((m) => m.code === hit.parentCode);
		const list: { title: React.ReactNode }[] = [];

		if (location.pathname === "/") {
			list.push({ title: hit.menuName || "概览" });
		} else {
			if (parent && parent.code !== "-1") list.push({ title: parent.menuName });
			if (hit.path !== "/" && hit.menuName) list.push({ title: hit.menuName });
		}
		return list;
	}, [all, location.pathname]);

	const handleLogout = async () => {
		try {
			await client.post("zephyr-auth/logout");
		} catch {
			// ignore
		} finally {
			logout();
			window.location.href = "/login";
		}
	};

	const userMenu: MenuProps = {
		items: [
			{ key: "profile", label: "个人信息", icon: <UserOutlined /> },
			{ type: "divider" },
			{
				key: "logout",
				label: "退出登录",
				icon: <LogoutOutlined />,
				danger: true,
			},
		],
		onClick: ({ key }) => {
			if (key === "logout") handleLogout();
		},
	};

	return (
		<Layout className="z-app">
			{/* ── 侧边栏 ─────────────────────────────── */}
			<Sider
				width={220}
				collapsible
				collapsed={collapsed}
				trigger={null}
				style={{
					borderRight: "1px solid var(--z-border)",
					background: "var(--z-surface)",
				}}
			>
				{/* Logo */}
				<div
					style={{
						padding: 16,
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					<div
						style={{
							width: 28,
							height: 28,
							borderRadius: 10,
							background: "linear-gradient(135deg, var(--z-primary), #3B82F6)",
							boxShadow: "0 8px 18px rgba(30,64,175,.18)",
							flexShrink: 0,
						}}
					/>
					{!collapsed && (
						<div style={{ minWidth: 0 }}>
							<Typography.Text strong style={{ display: "block" }}>
								Zephyr Admin
							</Typography.Text>
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>
								后台管理平台
							</Typography.Text>
						</div>
					)}
				</div>

				{/* 菜单 */}
				<Menu
					mode="inline"
					items={menuItems}
					selectedKeys={selectedKeys}
					defaultOpenKeys={openKeys}
					onClick={({ key }) => navigate(String(key))}
					style={{
						background: "transparent",
						borderInlineEnd: "none",
						padding: "0 8px 12px",
					}}
				/>
			</Sider>

			<Layout>
				{/* ── 顶栏 ───────────────────────────────── */}
				<Header
					style={{
						height: 48,
						lineHeight: "48px",
						padding: "0 16px",
						background: "transparent",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Space size={16} align="center">
						<Button
							type="text"
							icon={
								collapsed ? (
									<MenuUnfoldOutlined style={{ fontSize: 18 }} />
								) : (
									<MenuFoldOutlined style={{ fontSize: 18 }} />
								)
							}
							onClick={() => setCollapsed((v) => !v)}
							aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
						/>
						<Button
							type="text"
							icon={<ReloadOutlined style={{ fontSize: 18 }} />}
							title="刷新当前页面"
							onClick={() => window.location.reload()}
						/>
						<Button
							type="text"
							icon={<AppstoreOutlined style={{ fontSize: 18 }} />}
							title="概览"
							onClick={() => navigate("/")}
						/>
						{breadcrumbItems.length > 0 && (
							<Breadcrumb items={breadcrumbItems} style={{ marginLeft: 4 }} />
						)}
					</Space>

					<Space size={16} align="center">
						<Button
							type="text"
							icon={
								isDark ? (
									<SunOutlined style={{ fontSize: 18 }} />
								) : (
									<MoonOutlined style={{ fontSize: 18 }} />
								)
							}
							onClick={toggleTheme}
							title={isDark ? "切换亮色" : "切换暗色"}
						/>
						<Button
							type="text"
							icon={<SettingOutlined style={{ fontSize: 18 }} />}
							title="系统配置"
							onClick={() => setSettingsOpen(true)}
						/>
						<Dropdown
							menu={userMenu}
							placement="bottomRight"
							trigger={["click"]}
						>
							<Button type="text" style={{ padding: "0 8px" }}>
								<Space size={8} align="center">
									<UserOutlined style={{ fontSize: 18 }} />
									<span style={{ fontSize: 14 }}>
										{user?.username || "admin"}
									</span>
								</Space>
							</Button>
						</Dropdown>
					</Space>
				</Header>

				{/* ── 页面标签栏 ─────────────────────────────── */}
				<div
					style={{
						background: "transparent",
						padding: "0px 16px 8px", // 缩小顶部间距
						display: "flex",
						alignItems: "center",
						gap: "8px",
						overflowX: "auto",
					}}
				>
					{tabs.map((tab) => {
						const isActive = tab.key === activeTabKey;

						const handleClose = (e: React.MouseEvent) => {
							e.stopPropagation();
							if (!tab.closable || tab.key === "/") return;
							setTabs((prev) => {
								const idx = prev.findIndex((t) => t.key === tab.key);
								const next = prev.filter((t) => t.key !== tab.key);
								saveTabs(next);
								// 如果关的是当前页，则跳到相邻的那个
								if (tab.key === activeTabKey) {
									const fallback =
										next[Math.max(0, idx - 1)] || next[0] || homeTab;
									navigate(fallback.key, { replace: true });
								}
								return next.length ? next : [homeTab];
							});
						};

						return (
							<Dropdown
								key={tab.key}
								menu={buildTabContextMenu(tab)}
								trigger={["contextMenu"]}
								placement="bottomLeft"
							>
								<div
									onClick={() => navigate(tab.key)}
									onDoubleClick={handleClose}
									style={{
										flexShrink: 0, // 核心修复：阻止 flex 子元素被挤压，从而触发外层容器的滚动
										height: "32px",
										padding: "0 16px",
										borderRadius: "6px",
										display: "flex",
										alignItems: "center",
										gap: "8px",
										cursor: "pointer",
										fontSize: "14px",
										background: isActive
											? "color-mix(in srgb, var(--z-button-hover) 15%, transparent)"
											: "var(--z-bg)",
										color: isActive ? "var(--z-primary)" : "var(--z-text)",
										border: "1px solid",
										borderColor: isActive
											? "color-mix(in srgb, var(--z-button-hover) 30%, transparent)"
											: "var(--z-border)",
										transition: "all 0.2s",
										whiteSpace: "nowrap",
										userSelect: "none", // 阻止双击时默认选中文字的行为
									}}
								>
									<span>{tab.title}</span>
									{tab.closable && (
										<CloseOutlined
											style={{ fontSize: 12, opacity: 0.6 }}
											onClick={handleClose}
										/>
									)}
								</div>
							</Dropdown>
						);
					})}
				</div>

				{/* ── 内容区 ─────────────────────────────── */}
				<Content style={{ overflow: "auto" }}>
					<DynamicRoutes />
				</Content>
				{/* ── 配置抽屉 ─────────────────────────────── */}
				<Drawer
					title="系统配置"
					placement="right"
					onClose={() => setSettingsOpen(false)}
					open={settingsOpen}
					width={280}
				>
					<div style={{ marginBottom: 16 }}>
						<Typography.Text strong style={{ fontSize: 14 }}>
							系统主题色
						</Typography.Text>
					</div>
					<Space size={16} wrap style={{ marginBottom: 32 }}>
						{presetColors.map((color) => (
							<div
								key={color}
								onClick={() => setPrimaryColor(color)}
								style={{
									width: 32,
									height: 32,
									borderRadius: "50%",
									backgroundColor: color,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow:
										currentPrimaryColor === color
											? `0 0 0 2px var(--z-surface), 0 0 0 4px ${color}`
											: "none",
								}}
							>
								{currentPrimaryColor === color && (
									<CheckOutlined style={{ color: "#fff", fontSize: 16 }} />
								)}
							</div>
						))}
					</Space>

					<div style={{ marginBottom: 16 }}>
						<Typography.Text strong style={{ fontSize: 14 }}>
							按钮颜色 (悬浮极淡色)
						</Typography.Text>
					</div>
					<Space size={16} wrap>
						{presetColors.map((color) => (
							<div
								key={color}
								onClick={() => setButtonHoverColor(color)}
								style={{
									width: 32,
									height: 32,
									borderRadius: "50%",
									background: `linear-gradient(135deg, color-mix(in srgb, ${color} ${isDark ? "24%" : "12%"}, ${isDark ? "#141414" : "#ffffff"}) 50%, ${color} 50%)`,
									border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow:
										currentButtonHoverColor === color
											? `0 0 0 2px var(--z-surface), 0 0 0 4px color-mix(in srgb, ${color} 40%, transparent)`
											: "none",
								}}
							>
								{currentButtonHoverColor === color && (
									<CheckOutlined
										style={{
											color: "#fff",
											fontSize: 16,
											filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
										}}
									/>
								)}
							</div>
						))}
					</Space>
				</Drawer>
			</Layout>
		</Layout>
	);
}
