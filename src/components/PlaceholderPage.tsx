import { Card } from "antd";
import { PageShell } from "./PageShell";

export function PlaceholderPage(props: {
  title: string;
  description?: string;
  tips?: string[];
}) {
  return (
    <PageShell title={props.title} description={props.description}>
      <Card>
        <div style={{ color: "var(--z-text-muted)", lineHeight: 1.8 }}>
          <div>这是一个前端界面模板页（占位）。</div>
          {props.tips?.length ? (
            <ul style={{ marginTop: 8 }}>
              {props.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </Card>
    </PageShell>
  );
}
