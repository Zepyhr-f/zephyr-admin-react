import { useEffect, useState } from "react";
import { Button, Input, message, Popconfirm, Space, Upload } from "antd";
import { DeleteOutlined, DownloadOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { DataTable } from "@/components/DataTable";
import { downloadFileUrl, getFiles, removeFiles, uploadFile } from "@/api/admin-modules";

export function FileCenter() {
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [category, setCategory] = useState("admin");
  const fetchData = async () => { setLoading(true); try { setRows((await getFiles()).records ?? []); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  return <PageShell title="文件管理" description="运行时安全文件中心，上传限额、下载鉴权、删除为软删除。">
    <DataTable rowKey={(r) => String(r.id)} loading={loading} dataSource={rows} columns={[{ title: "文件名", dataIndex: "name" }, { title: "分类", dataIndex: "category" }, { title: "大小", dataIndex: "size" }, { title: "MIME", dataIndex: "mimeType" }, { title: "SHA256", dataIndex: "sha256", ellipsis: true }, { title: "上传时间", dataIndex: "createdAt" }, { title: "操作", render: (_: any, r: any) => <Space><Button type="link" icon={<DownloadOutlined />} href={downloadFileUrl(String(r.id))} target="_blank">下载</Button><Popconfirm title="确认软删除文件？" onConfirm={async () => { await removeFiles([String(r.id)]); message.success("已软删除"); fetchData(); }}><Button type="link" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></Space> }]}
      extraActions={<Space><Input value={category} onChange={(e) => setCategory(e.target.value)} addonBefore="分类" style={{ width: 220 }} /><Upload showUploadList={false} beforeUpload={async (file) => { await uploadFile(file, category); message.success("上传成功"); fetchData(); return false; }}><Button type="primary" icon={<UploadOutlined />}>上传文件</Button></Upload><Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button></Space>} />
  </PageShell>;
}
