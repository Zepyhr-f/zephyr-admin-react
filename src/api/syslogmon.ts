import { useAuthStore } from "../store/use-auth-store";
import client, { apiBaseURL } from "./client";

const BASE = "/api/v1/sysadmin/logs";

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

export const listServices = () =>
	client.get<{ services: ServiceItem[] }>(`${BASE}/services`);

export const listFiles = (svc: string) =>
	client.get<{ service: string; files: FileItem[] }>(
		`${BASE}/services/${encodeURIComponent(svc)}/files`,
	);

export const readFile = (
	svc: string,
	file: string,
	params: { tail?: number; from_line?: number; limit?: number },
) =>
	client.get<ReadResp>(
		`${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}`,
		{ params },
	);

export const searchFile = (
	svc: string,
	file: string,
	params: { q: string; limit?: number },
) =>
	client.get<SearchResp>(
		`${BASE}/services/${encodeURIComponent(svc)}/files/${encodeURIComponent(file)}/search`,
		{ params },
	);

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
