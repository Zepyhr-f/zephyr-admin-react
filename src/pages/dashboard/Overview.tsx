import { Card, Col, Progress, Row, Statistic } from "antd";
import { PageShell } from "@/components/PageShell";

export function DashboardOverview() {
  return (
    <PageShell
      // title="概览"
      description={'面向"系统健康 / 风险 / 变更"的快速总览（KPI + 近 24h 异常）。'}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="在线用户" value={27} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="近 24h 登录" value={312} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="操作日志" value={10482} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="告警数" value={3} valueStyle={{ color: "#dc2626" }} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="资源健康度">
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>CPU</span>
                  <span style={{ color: "var(--z-text-muted)" }}>42%</span>
                </div>
                <Progress percent={42} showInfo={false} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>内存</span>
                  <span style={{ color: "var(--z-text-muted)" }}>68%</span>
                </div>
                <Progress percent={68} showInfo={false} strokeColor="#D97706" />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>磁盘</span>
                  <span style={{ color: "var(--z-text-muted)" }}>21%</span>
                </div>
                <Progress percent={21} showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="今日重点">
            <ul style={{ margin: 0, paddingInlineStart: 18, lineHeight: 1.9 }}>
              <li>新增角色权限变更 2 次（建议关注高危权限）</li>
              <li>出现 1 次登录失败峰值（可能为撞库/脚本）</li>
              <li>Cron 任务：2 个执行失败（需要重试/查看日志）</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </PageShell>
  );
}
