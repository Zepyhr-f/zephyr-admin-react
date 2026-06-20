import {
	CopyOutlined,
	DownloadOutlined,
	FileTextOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import {
	Alert,
	Badge,
	Button,
	Card,
	Empty,
	Input,
	List,
	message,
	Pagination,
	Spin,
	Switch,
	Tabs,
	Tag,
	Tooltip,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	downloadFile,
	type FileItem,
	type LogLine,
	listFiles,
	listServices,
	openTail,
	readFile,
	type ServiceItem,
	searchFile,
	type TailHandle,
} from "@/api/syslogmon";
import { PageShell } from "@/components/PageShell";

// ---------- 工具 ----------

function formatBytes(n?: number) {
	if (n === undefined || n === null) return "-";
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
	return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatTime(s?: string) {
	if (!s) return "-";
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return s;
	return d.toLocaleString();
}

function levelColor(level?: string): string {
	switch ((level || "").toUpperCase()) {
		case "ERROR":
		case "FATAL":
		case "PANIC":
			return "red";
		case "WARN":
		case "WARNING":
			return "orange";
		case "INFO":
			return "blue";
		case "DEBUG":
			return "default";
		case "TRACE":
			return "purple";
		default:
			return "default";
	}
}

function tryParseLine(raw: string): Partial<LogLine> {
	if (!raw) return {};
	const t = raw.trimStart();
	if (!t.startsWith("{")) return {};
	try {
		const j = JSON.parse(t);
		return {
			ts: j.ts || j.time || j.timestamp,
			level: j.level || j.lvl,
			msg: j.msg || j.message,
			trace: j.trace || j.trace_id || j.traceId,
			span: j.span || j.span_id || j.spanId,
		};
	} catch {
		return {};
	}
}

function highlight(text: string, q: string) {
	if (!q) return text;
	const idx = text.toLowerCase().indexOf(q.toLowerCase());
	if (idx < 0) return text;
	return (
		<>
			{text.slice(0, idx)}
			<mark style={{ background: "#ffe58f", padding: 0 }}>
				{text.slice(idx, idx + q.length)}
			</mark>
			{text.slice(idx + q.length)}
		</>
	);
}

// ---------- 行渲染 ----------

interface RenderLineProps {
	line: LogLine;
	highlightQ?: string;
}

function LogLineRow({ line, highlightQ }: RenderLineProps) {
	const parsed = useMemo(() => {
		if (line.level || line.msg || line.ts) return line;
		return { ...line, ...tryParseLine(line.raw || "") };
	}, [line]);

	const onCopyTrace = (txt: string) => {
		navigator.clipboard?.writeText(txt).then(
			() => message.success("trace 已复制"),
			() => message.error("复制失败"),
		);
	};

	return (
		<div
			style={{
				fontFamily: "Menlo, Consolas, monospace",
				fontSize: 12,
				lineHeight: "20px",
				whiteSpace: "pre-wrap",
				wordBreak: "break-all",
				padding: "1px 8px",
				borderBottom: "1px solid #fafafa",
			}}
		>
			<span style={{ color: "#999", marginRight: 8 }}>#{parsed.lineNo}</span>
			{parsed.ts && (
				<span style={{ color: "#666", marginRight: 8 }}>
					{String(parsed.ts)}
				</span>
			)}
			{parsed.level && (
				<Tag
					color={levelColor(String(parsed.level))}
					style={{ marginRight: 6 }}
				>
					{String(parsed.level).toUpperCase()}
				</Tag>
			)}
			{parsed.trace && (
				<Tooltip title="点击复制 trace">
					<Tag
						color="geekblue"
						style={{ cursor: "pointer", marginRight: 6 }}
						onClick={() => onCopyTrace(String(parsed.trace))}
						icon={<CopyOutlined />}
					>
						{String(parsed.trace).slice(0, 12)}
					</Tag>
				</Tooltip>
			)}
			{parsed.span && (
				<Tag style={{ marginRight: 6 }}>
					span:{String(parsed.span).slice(0, 8)}
				</Tag>
			)}
			<span>
				{highlight(
					parsed.msg ? String(parsed.msg) : parsed.raw || "",
					highlightQ || "",
				)}
			</span>
		</div>
	);
}

// ---------- Tail Tab ----------

interface TailTabProps {
	svc: string;
	file: string;
}

const TAIL_BUFFER_MAX = 2000;

function TailTab({ svc, file }: TailTabProps) {
	const [lines, setLines] = useState<LogLine[]>([]);
	const [follow, setFollow] = useState(true);
	const [running, setRunning] = useState(false);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [rotateMsg, setRotateMsg] = useState<string | null>(null);
	const handleRef = useRef<TailHandle | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const seqRef = useRef(0);

	const start = useCallback(() => {
		if (handleRef.current) {
			handleRef.current.close();
			handleRef.current = null;
		}
		setErrMsg(null);
		setRotateMsg(null);
		setRunning(true);
		handleRef.current = openTail(svc, file, "now", {
			onOpen: () => setErrMsg(null),
			onEvent: (ev) => {
				if (ev.event === "line") {
					try {
						const obj = JSON.parse(ev.data);
						// 后端 LogLine 用 snake_case (line_no)，前端统一 camelCase (lineNo)
						const lineNo =
							typeof obj.lineNo === "number"
								? obj.lineNo
								: typeof obj.line_no === "number"
									? obj.line_no
									: ++seqRef.current;
						const next: LogLine = {
							lineNo,
							raw: obj.raw ?? ev.data,
							ts: obj.ts,
							level: obj.level,
							msg: obj.msg,
							trace: obj.trace,
							span: obj.span,
						};
						setLines((prev) => {
							const arr =
								prev.length >= TAIL_BUFFER_MAX
									? prev.slice(prev.length - TAIL_BUFFER_MAX + 1)
									: prev.slice();
							arr.push(next);
							return arr;
						});
					} catch {
						const lineNo = ++seqRef.current;
						setLines((prev) => {
							const arr =
								prev.length >= TAIL_BUFFER_MAX
									? prev.slice(prev.length - TAIL_BUFFER_MAX + 1)
									: prev.slice();
							arr.push({ lineNo, raw: ev.data });
							return arr;
						});
					}
				} else if (ev.event === "rotate") {
					setRotateMsg(`日志文件已轮转：${ev.data}`);
				} else if (ev.event === "error") {
					setErrMsg(ev.data || "服务端错误");
				}
			},
			onError: (err) => {
				setRunning(false);
				setErrMsg(err instanceof Error ? err.message : "连接已断开");
			},
		});
	}, [svc, file]);

	const stop = useCallback(() => {
		if (handleRef.current) {
			handleRef.current.close();
			handleRef.current = null;
		}
		setRunning(false);
	}, []);

	useEffect(() => {
		setLines([]);
		seqRef.current = 0;
		start();
		return () => {
			if (handleRef.current) {
				handleRef.current.close();
				handleRef.current = null;
			}
		};
	}, [start]);

	useEffect(() => {
		if (!follow) return;
		const el = containerRef.current;
		if (el && lines.length > 0) el.scrollTop = el.scrollHeight;
	}, [lines, follow]);

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<div
				style={{
					marginBottom: 8,
					display: "flex",
					gap: 8,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<Badge
					status={running ? "processing" : "default"}
					text={running ? "实时跟随中" : "已停止"}
				/>
				<span>
					跟随到底
					<Switch
						size="small"
						checked={follow}
						onChange={setFollow}
						style={{ marginLeft: 6 }}
					/>
				</span>
				{running ? (
					<Button size="small" icon={<PauseCircleOutlined />} onClick={stop}>
						暂停
					</Button>
				) : (
					<Button
						size="small"
						type="primary"
						icon={<PlayCircleOutlined />}
						onClick={start}
					>
						重连
					</Button>
				)}
				<Button size="small" onClick={() => setLines([])}>
					清空缓冲
				</Button>
				<span style={{ color: "#999" }}>
					缓冲：{lines.length} / {TAIL_BUFFER_MAX} 行
				</span>
			</div>
			{rotateMsg && (
				<Alert
					type="warning"
					showIcon
					message={rotateMsg}
					closable
					style={{ marginBottom: 8 }}
					onClose={() => setRotateMsg(null)}
				/>
			)}
			{errMsg && (
				<Alert
					type="error"
					showIcon
					message={errMsg}
					action={
						<Button size="small" type="link" onClick={start}>
							重新连接
						</Button>
					}
					style={{ marginBottom: 8 }}
				/>
			)}
			<div
				ref={containerRef}
				style={{
					flex: 1,
					minHeight: 320,
					overflowY: "auto",
					background: "#fafafa",
					border: "1px solid #f0f0f0",
					borderRadius: 4,
				}}
			>
				{lines.length === 0 ? (
					<Empty
						style={{ paddingTop: 80 }}
						description="尚未收到日志，等待中..."
					/>
				) : (
					lines.map((l) => <LogLineRow key={l.lineNo} line={l} />)
				)}
			</div>
		</div>
	);
}

// ---------- 历史 Tab ----------

interface HistoryTabProps {
	svc: string;
	file: string;
	totalLines?: number;
}

function HistoryTab({ svc, file, totalLines }: HistoryTabProps) {
	const [data, setData] = useState<LogLine[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(200);
	const [total, setTotal] = useState<number | undefined>(totalLines);
	const [tailMode, setTailMode] = useState(true);

	const load = useCallback(
		async (p: number, sz: number, useTail: boolean) => {
			setLoading(true);
			try {
				const params: { tail?: number; from_line?: number; limit?: number } =
					useTail ? { tail: sz } : { from_line: (p - 1) * sz + 1, limit: sz };
				const resp = await readFile(svc, file, params);
				setData(resp.lines || []);
				if (typeof resp.totalLines === "number") setTotal(resp.totalLines);
			} catch (e) {
				message.error(e instanceof Error ? e.message : "加载失败");
			} finally {
				setLoading(false);
			}
		},
		[svc, file],
	);

	useEffect(() => {
		setTailMode(true);
		setPage(1);
		load(1, pageSize, true);
	}, [load, pageSize]);

	const onPageChange = (p: number, sz: number) => {
		setTailMode(false);
		setPage(p);
		setPageSize(sz);
		load(p, sz, false);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<div
				style={{
					marginBottom: 8,
					display: "flex",
					gap: 8,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<Button
					size="small"
					icon={<ReloadOutlined />}
					onClick={() => load(page, pageSize, tailMode)}
				>
					刷新
				</Button>
				<Button
					size="small"
					type={tailMode ? "primary" : "default"}
					onClick={() => {
						setTailMode(true);
						setPage(1);
						load(1, pageSize, true);
					}}
				>
					跳到末尾（最新 {pageSize} 行）
				</Button>
				<span style={{ color: "#999" }}>
					{tailMode ? "末尾模式" : `第 ${page} 页`} · 共 {total ?? "?"} 行
				</span>
			</div>
			<Spin spinning={loading} wrapperClassName="z-syslog-spin">
				<div
					style={{
						minHeight: 320,
						maxHeight: "55vh",
						overflowY: "auto",
						background: "#fafafa",
						border: "1px solid #f0f0f0",
						borderRadius: 4,
					}}
				>
					{!loading && data.length === 0 ? (
						<Empty style={{ paddingTop: 80 }} description="暂无日志" />
					) : (
						data.map((l) => <LogLineRow key={`${l.lineNo}-${file}`} line={l} />)
					)}
				</div>
			</Spin>
			<div style={{ marginTop: 8, textAlign: "right" }}>
				<Pagination
					current={page}
					pageSize={pageSize}
					total={total ?? 0}
					showSizeChanger
					pageSizeOptions={["100", "200", "500", "1000"]}
					onChange={onPageChange}
					disabled={tailMode || !total}
					showTotal={(t) => `共 ${t} 行`}
				/>
			</div>
		</div>
	);
}

// ---------- 搜索 Tab ----------

interface SearchTabProps {
	svc: string;
	file: string;
}

function SearchTab({ svc, file }: SearchTabProps) {
	const [q, setQ] = useState("");
	const [limit, setLimit] = useState(200);
	const [hits, setHits] = useState<LogLine[]>([]);
	const [loading, setLoading] = useState(false);
	const [truncated, setTruncated] = useState(false);
	const [done, setDone] = useState(false);

	const onSearch = useCallback(async () => {
		const kw = q.trim();
		if (!kw) {
			message.warning("请输入搜索关键字");
			return;
		}
		setLoading(true);
		setDone(false);
		try {
			const resp = await searchFile(svc, file, { q: kw, limit });
			setHits(resp.hits || []);
			setTruncated(!!resp.truncated);
			setDone(true);
		} catch (e) {
			message.error(e instanceof Error ? e.message : "搜索失败");
		} finally {
			setLoading(false);
		}
	}, [svc, file, q, limit]);

	useEffect(() => {
		// 切换文件/服务时重置搜索状态
		void svc;
		void file;
		setQ("");
		setHits([]);
		setDone(false);
	}, [svc, file]);

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<div
				style={{
					marginBottom: 8,
					display: "flex",
					gap: 8,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<Input
					placeholder="搜索关键字（支持中文）"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					onPressEnter={onSearch}
					style={{ width: 320 }}
					allowClear
				/>
				<Input
					type="number"
					value={limit}
					onChange={(e) =>
						setLimit(Math.max(1, Math.min(2000, Number(e.target.value) || 200)))
					}
					style={{ width: 120 }}
					addonBefore="上限"
				/>
				<Button
					type="primary"
					icon={<SearchOutlined />}
					onClick={onSearch}
					loading={loading}
				>
					搜索
				</Button>
				{done && (
					<span style={{ color: "#999" }}>
						命中 {hits.length} 条{truncated ? "（已截断）" : ""}
					</span>
				)}
			</div>
			<Spin spinning={loading}>
				<div
					style={{
						minHeight: 320,
						maxHeight: "60vh",
						overflowY: "auto",
						background: "#fafafa",
						border: "1px solid #f0f0f0",
						borderRadius: 4,
					}}
				>
					{!loading && done && hits.length === 0 ? (
						<Empty style={{ paddingTop: 80 }} description="无命中" />
					) : (
						hits.map((l) => (
							<LogLineRow
								key={`hit-${l.lineNo}`}
								line={l}
								highlightQ={q.trim()}
							/>
						))
					)}
					{!done && !loading && (
						<Empty
							style={{ paddingTop: 80 }}
							description="输入关键字后点击搜索"
						/>
					)}
				</div>
			</Spin>
		</div>
	);
}

// ---------- 主页面 ----------

export default function LogMonitoring() {
	const [services, setServices] = useState<ServiceItem[]>([]);
	const [svcLoading, setSvcLoading] = useState(false);
	const [activeSvc, setActiveSvc] = useState<string | null>(null);

	const [files, setFiles] = useState<FileItem[]>([]);
	const [filesLoading, setFilesLoading] = useState(false);
	const [activeFile, setActiveFile] = useState<string | null>(null);

	const [activeTab, setActiveTab] = useState<string>("tail");

	const fetchServices = useCallback(async () => {
		setSvcLoading(true);
		try {
			const resp = await listServices();
			setServices(resp.services || []);
			setActiveSvc((prev) => prev || resp.services?.[0]?.name || null);
		} catch (e) {
			message.error(e instanceof Error ? e.message : "加载服务列表失败");
		} finally {
			setSvcLoading(false);
		}
	}, []);

	const fetchFiles = useCallback(async (svc: string) => {
		setFilesLoading(true);
		try {
			const resp = await listFiles(svc);
			setFiles(resp.files || []);
			if (resp.files?.length) {
				setActiveFile((prev) =>
					prev && resp.files.some((f) => f.name === prev)
						? prev
						: resp.files[0].name,
				);
			} else {
				setActiveFile(null);
			}
		} catch (e) {
			message.error(e instanceof Error ? e.message : "加载文件列表失败");
		} finally {
			setFilesLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchServices();
	}, [fetchServices]);

	useEffect(() => {
		if (activeSvc) {
			setActiveFile(null);
			fetchFiles(activeSvc);
		}
	}, [activeSvc, fetchFiles]);

	const currentFileMeta = useMemo(
		() => files.find((f) => f.name === activeFile),
		[files, activeFile],
	);

	const onDownload = async () => {
		if (!activeSvc || !activeFile) return;
		try {
			await downloadFile(activeSvc, activeFile);
		} catch (e) {
			message.error(e instanceof Error ? e.message : "下载失败");
		}
	};

	return (
		<PageShell
			title="服务日志监控"
			description="按服务浏览日志文件、实时跟随、历史分页与关键字搜索。"
		>
			<div
				style={{
					display: "flex",
					gap: 12,
					alignItems: "stretch",
					minHeight: 600,
				}}
			>
				{/* 左侧：服务 + 文件 */}
				<Card
					size="small"
					title="服务与文件"
					style={{ width: 320, flexShrink: 0 }}
					styles={{ body: { padding: 8 } }}
					extra={
						<Button
							size="small"
							icon={<ReloadOutlined />}
							onClick={fetchServices}
							loading={svcLoading}
						>
							刷新
						</Button>
					}
				>
					<div style={{ marginBottom: 8, fontWeight: 500, color: "#666" }}>
						服务
					</div>
					<Spin spinning={svcLoading}>
						<List
							size="small"
							dataSource={services}
							locale={{ emptyText: "暂无服务" }}
							renderItem={(s) => (
								<List.Item
									onClick={() => setActiveSvc(s.name)}
									style={{
										cursor: "pointer",
										padding: "6px 8px",
										background:
											activeSvc === s.name ? "#e6f4ff" : "transparent",
										borderRadius: 4,
										border: "none",
									}}
								>
									<div style={{ width: "100%" }}>
										<div style={{ fontWeight: 500 }}>
											{s.displayName || s.name}
										</div>
										{s.dir && (
											<div style={{ fontSize: 11, color: "#999" }}>{s.dir}</div>
										)}
									</div>
								</List.Item>
							)}
						/>
					</Spin>
					<div
						style={{
							marginTop: 12,
							marginBottom: 8,
							fontWeight: 500,
							color: "#666",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<span>文件</span>
						<Button
							size="small"
							type="link"
							icon={<ReloadOutlined />}
							onClick={() => activeSvc && fetchFiles(activeSvc)}
							disabled={!activeSvc}
						>
							刷新
						</Button>
					</div>
					<Spin spinning={filesLoading}>
						<List
							size="small"
							dataSource={files}
							locale={{ emptyText: activeSvc ? "暂无文件" : "请先选择服务" }}
							renderItem={(f) => (
								<List.Item
									onClick={() => setActiveFile(f.name)}
									style={{
										cursor: "pointer",
										padding: "6px 8px",
										background:
											activeFile === f.name ? "#e6f4ff" : "transparent",
										borderRadius: 4,
										border: "none",
									}}
								>
									<div style={{ width: "100%" }}>
										<div style={{ fontSize: 12, wordBreak: "break-all" }}>
											<FileTextOutlined
												style={{ marginRight: 4, color: "#1677ff" }}
											/>
											{f.name}
										</div>
										<div style={{ fontSize: 11, color: "#999" }}>
											{formatBytes(f.size)} · {formatTime(f.mtime)}
											{f.rotated ? " · rotated" : ""}
										</div>
									</div>
								</List.Item>
							)}
						/>
					</Spin>
				</Card>

				{/* 右侧：内容 */}
				<Card
					size="small"
					style={{ flex: 1, minWidth: 0 }}
					styles={{
						body: { display: "flex", flexDirection: "column", minHeight: 600 },
					}}
					title={
						activeFile ? (
							<span>
								<FileTextOutlined style={{ marginRight: 6 }} />
								{activeSvc} / {activeFile}
								{currentFileMeta && (
									<span
										style={{
											marginLeft: 12,
											fontWeight: "normal",
											color: "#666",
											fontSize: 12,
										}}
									>
										大小 {formatBytes(currentFileMeta.size)} · 修改{" "}
										{formatTime(currentFileMeta.mtime)}
										{typeof currentFileMeta.lines === "number"
											? ` · ${currentFileMeta.lines} 行`
											: ""}
									</span>
								)}
							</span>
						) : (
							<span style={{ color: "#999" }}>请选择一个日志文件</span>
						)
					}
					extra={
						<Button
							icon={<DownloadOutlined />}
							onClick={onDownload}
							disabled={!activeSvc || !activeFile}
						>
							下载
						</Button>
					}
				>
					{activeSvc && activeFile ? (
						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							destroyOnHidden
							items={[
								{
									key: "tail",
									label: "实时（Tail）",
									children: <TailTab svc={activeSvc} file={activeFile} />,
								},
								{
									key: "history",
									label: "历史",
									children: (
										<HistoryTab
											svc={activeSvc}
											file={activeFile}
											totalLines={currentFileMeta?.lines}
										/>
									),
								},
								{
									key: "search",
									label: "搜索",
									children: <SearchTab svc={activeSvc} file={activeFile} />,
								},
							]}
							style={{ flex: 1 }}
						/>
					) : (
						<Empty
							style={{ paddingTop: 120 }}
							description="请在左侧选择服务及日志文件"
						/>
					)}
				</Card>
			</div>
		</PageShell>
	);
}
