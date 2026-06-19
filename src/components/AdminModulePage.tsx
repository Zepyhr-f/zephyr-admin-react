import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Form, Input, Space, Tag, Typography } from "antd";
import { ReloadOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/PageShell";
import { QueryForm } from "@/components/QueryForm";
import { DataTable } from "@/components/DataTable";
import type { AdminListResp, MetricResp } from "@/api/admin-modules";

const { Text } = Typography;

type LoadList = (params?: Record<string, unknown>) => Promise<AdminListResp>;
type LoadMetric = () => Promise<MetricResp>;

const defaultColumns: ColumnsType<Record<string, unknown>> = [
  { title: "模块", dataIndex: "module", width: 180, render: (v) => <Tag color="blue">{String(v ?? "admin")}</Tag> },
  { title: "状态", dataIndex: "status", width: 140, render: (v) => <Tag color={v === "placeholder" ? "gold" : "green"}>{String(v ?? "ok")}</Tag> },
  { title: "说明", dataIndex: "message", ellipsis: true },
  { title: "更新时间", dataIndex: "updatedAt", width: 220 },
];

export function AdminListPage({
  title,
  description,
  loader,
  riskNote,
}: {
  title: string;
  description: string;
  loader: LoadList;
  riskNote?: string;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>();

  const fetchData = async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(undefined);
    try {
      const resp = await loader(params);
      setRows(resp.records ?? []);
      setTotal(resp.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageShell title={title} description={description}>
      {riskNote ? <Alert showIcon type="info" message="安全边界" description={riskNote} style={{ marginBottom: 16 }} /> : null}
      {error ? <Alert showIcon type="warning" message="接口暂不可用" description={error} style={{ marginBottom: 16 }} /> : null}
      <QueryForm form={form} onSearch={fetchData} onReset={() => fetchData()}>
        <Form.Item label="关键词" name="keyword">
          <Input allowClear placeholder="输入关键词" style={{ width: 220 }} />
        </Form.Item>
      </QueryForm>
      <DataTable rowKey={(row) => String(row.id ?? row.module ?? row.updatedAt)} loading={loading} columns={defaultColumns} dataSource={rows} pagination={{ pageSize: 10, total }} />
    </PageShell>
  );
}

export function AdminMetricPage({
  title,
  description,
  loader,
  riskNote,
}: {
  title: string;
  description: string;
  loader: LoadMetric;
  riskNote?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricResp>({});
  const [error, setError] = useState<string>();

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageShell title={title} description={description}>
      {riskNote ? <Alert showIcon type="info" message="安全边界" description={riskNote} style={{ marginBottom: 16 }} /> : null}
      {error ? <Alert showIcon type="warning" message="接口暂不可用" description={error} style={{ marginBottom: 16 }} /> : null}
      <Card
        loading={loading}
        title={<Space><SafetyCertificateOutlined /> 运行摘要</Space>}
        extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>}
      >
        <Descriptions bordered column={1} size="small">
          {Object.entries(data).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              <Text code>{typeof value === "object" ? JSON.stringify(value) : String(value)}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </PageShell>
  );
}
