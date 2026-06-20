import { useAuthStore } from "../store/use-auth-store";
import client, { apiBaseURL } from "./client";

const BASE = "/api/v1/sysadmin/logs";

// ---------- 前端使用的标准化类型（与 LogMonitoring.tsx 字段约定一致） ----------

export interface ServiceItem {
	name: string;
	displayName?: string;
	dir?: string;
	[key: string]: unknown;
}

export interface FileItem {
	name: string;
	size: number;
	mtime: string;
	lines?: number;
	rotated?: boolean;
	[key: string]: unknown;
}

export interface LogLine {
	lineNo: number;
	raw: string;
	ts?: string;
	level?: string;
	msg?: string;
	trace?: string;
	span?: string;
	[key: string]: unknown;
}

export interface ReadResp {
	file: string;
	service: string;
	totalLines?: number;
	from?: number;
	to?: number;
	size?: number;
	mtime?: string;
	lines: LogLine[];
}

export interface SearchResp {
	file: string;
	service: string;
	q: string;
	hits: LogLine[];
	truncated?: boolean;
}

// ---------- 后端契约（zephyr-go syslogmon 实际返回结构） ----------

interface BackendService {
	service: string;
	display: string;
}

interface BackendFile {
	name: string;
	size: number;
	mtime: string;
	line_count: number;
}

interface BackendLogLine {
	ts?: string;
	level?: string;
	logger?: string;
	service?: string;
	file?: string;
	line_no: number;
	trace?: string;
	span?: string;
	msg?: string;
	raw: string;
}

interface BackendSearchData {
	lines: BackendLogLine[];
	truncated?: boolean;
}

// ---------- 适配器：把后端 shape 转成前端期望 ----------

function adaptLine(b: BackendLogLine): LogLine {
	return {
		lineNo: b.line_no,
		raw: b.raw,
		ts: b.ts,
		level: b.level,
		msg: b.msg,
		trace: b.trace,
		span: b.span,
		logger: b.logger,
		service: b.service,
		file: b.file,
	};
}

// 文件名形如 access.log.1 / access.log.1.gz → rotated；access.log → 否
function inferRotated(name: string): boolean {
	return /\.log\.\d+(\.gz)?$/.test(name);
}

function adaptFile(b: BackendFile): FileItem {
	return {
		name: b.name,
		size: b.size,
		mtime: b.mtime,
		lines: b.line_count >= 0 ? b.line_count : undefined,
		rotated: inferRotated(b.name),
	};
}

// ---------- API ----------

export async function listServices(): Promise<{ services: ServiceItem[] }> {
	const raw = await client.get<BackendService[]>(`${BASE}/services`);
	return {
		services: (raw || []).map((s) => ({
			name: s.service,
			displayName: s.display,
		})),
	};
}

export async function listFiles(
	svc: string,
): Promise<{ service: string; files: FileItem[] }> {
	const raw = await client.get<BackendFile[]>(
		`${BASE}/services/${encodeURIComponent(svc)}/files`,
	);
	return {
		service: svc,
		files: (raw || []).map(adaptFile),
	};
}

export async function readFile(
	svc: string,
	file: string,
	params: { tail?: number; from_line?: number; limit?: number },
): Promise<ReadResp> {
	const raw = await client.get<BackendLogLine[]>(
		`${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}`,
		{ params },
	);
	const lines = (raw || []).map(adaptLine);
	const first = lines[0]?.lineNo;
	const last = lines[lines.length - 1]?.lineNo;
	return {
		file,
		service: svc,
		lines,
		from: typeof first === "number" ? first : undefined,
		to: typeof last === "number" ? last : undefined,
		// totalLines 后端 read 接口未返回，由 UI 用 file meta 的 lines 字段兜底
	};
}

export async function searchFile(
	svc: string,
	file: string,
	params: { q: string; limit?: number },
): Promise<SearchResp> {
	const raw = await client.get<BackendSearchData>(
		`${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}/search`,
		{ params },
	);
	return {
		file,
		service: svc,
		q: params.q,
		hits: (raw?.lines || []).map(adaptLine),
		truncated: raw?.truncated,
	};
}

/**
 * 通过 fetch + Authorization 头下载日志文件，浏览器以 Blob 形式触发附件下载。
 * 不能把 token 放在 URL（安全风险），所以不能用 window.open。
 */
export async function downloadFile(svc: string, file: string): Promise<void> {
	const token = useAuthStore.getState().token;
	const url = `${apiBaseURL}${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}/download`;
	const res = await fetch(url, {
		headers: token ? { Authorization: `Bearer ${token}` } : {},
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`下载失败：HTTP ${res.status}`);
	}
	const blob = await res.blob();
	const objUrl = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = objUrl;
	a.download = file;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(objUrl);
}

export interface SseEvent {
	event: string;
	data: string;
}

export interface TailHandle {
	close(): void;
}

/**
 * 使用 fetch + ReadableStream 订阅 SSE 流，可携带 Authorization 头。
 * 自带 SSE 行解析（按 `\n\n` 切帧，`event:`/`data:` 前缀）。
 */
export function openTail(
	svc: string,
	file: string,
	from: "now" | "head" | string,
	handlers: {
		onEvent: (ev: SseEvent) => void;
		onError?: (err: unknown) => void;
		onOpen?: () => void;
	},
): TailHandle {
	const ctrl = new AbortController();
	let closed = false;
	const token = useAuthStore.getState().token;
	const url = `${apiBaseURL}${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}/tail?from=${encodeURIComponent(from)}`;

	(async () => {
		try {
			const res = await fetch(url, {
				headers: {
					Accept: "text/event-stream",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				credentials: "include",
				signal: ctrl.signal,
			});
			if (!res.ok || !res.body) {
				throw new Error(`SSE 连接失败：HTTP ${res.status}`);
			}
			handlers.onOpen?.();

			const reader = res.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let buffer = "";

			while (!closed) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				let sepIdx = buffer.indexOf("\n\n");
				while (sepIdx !== -1) {
					const frame = buffer.slice(0, sepIdx);
					buffer = buffer.slice(sepIdx + 2);
					sepIdx = buffer.indexOf("\n\n");

					let event = "message";
					const dataParts: string[] = [];
					for (const line of frame.split("\n")) {
						if (!line || line.startsWith(":")) continue;
						const colon = line.indexOf(":");
						const field = colon === -1 ? line : line.slice(0, colon);
						const val =
							colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
						if (field === "event") event = val;
						else if (field === "data") dataParts.push(val);
					}
					if (dataParts.length > 0) {
						handlers.onEvent({ event, data: dataParts.join("\n") });
					}
				}
			}
		} catch (err) {
			if (!closed) {
				handlers.onError?.(err);
			}
		}
	})();

	return {
		close() {
			closed = true;
			ctrl.abort();
		},
	};
}
