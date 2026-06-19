import { useEffect, useState } from "react";
import { Button, Card, Descriptions, Space, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { getApiDocInfo } from "@/api/admin-modules";

export function ApiDoc() {
  const [data, setData] = useState<any>({}); const [loading, setLoading] = useState(false);
  const fetchData = async () => { setLoading(true); try { setData(await getApiDocInfo()); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  return <PageShell title="接口文档" description="Gateway 聚合接口清单，不暴露内部密钥、连接串或宿主机路径。">
    <Card loading={loading} title="接口聚合状态" extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>}>
      <Descriptions bordered column={1} size="small"><Descriptions.Item label="状态"><Tag color="green">{String(data.status ?? "unknown")}</Tag></Descriptions.Item><Descriptions.Item label="生成时间">{String(data.generatedAt ?? "")}</Descriptions.Item><Descriptions.Item label="策略">{String(data.policy ?? "")}</Descriptions.Item></Descriptions>
      <Space direction="vertical" style={{ marginTop: 16, width: "100%" }}>{(data.groups ?? []).map((g: any) => <Card key={g.prefix} size="small" title={<Space><Tag color="blue">{g.group}</Tag>{g.prefix}</Space>}><p>{g.description}</p><Tag>{g.status}</Tag></Card>)}</Space>
    </Card>
  </PageShell>;
}
