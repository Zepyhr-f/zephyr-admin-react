import type { ReactNode } from "react";

export function PageShell(props: {
  title?: string;
  description?: string;
  extra?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="z-page">
      {props.children}
    </div>
  );
}