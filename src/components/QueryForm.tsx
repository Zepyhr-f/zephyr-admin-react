import { Form, Button, Card, Row, Col } from "antd";
import type { FormInstance } from "antd";
import React, { Children } from "react";
import type { ReactNode } from "react";

interface QueryFormProps<T = any> {
  /** Ant Design Form 实例 */
  form?: FormInstance<T>;
  /** 点击查询的回调 */
  onSearch?: (values: T) => void;
  /** 点击重置的回调 */
  onReset?: () => void;
  /** 查询条件的内容（通常是一堆 Form.Item） */
  children: ReactNode;
  /** 查询按钮的加载状态 */
  loading?: boolean;
}

/**
 * 统一的查询表单组件
 * 采用 24 栅格化布局，一行均匀分布四个查询框 (span=6)。
 * 按钮始终停靠在最后一行右侧。
 */
export function QueryForm<T>({ form, onSearch, onReset, children, loading }: QueryFormProps<T>) {
  const childArray = Children.toArray(children);
  
  // 每行 4 个条件，计算最后一行还有多少个条件
  const itemsInLastRow = childArray.length % 4;
  
  // 按钮组作为一个查询框大小 (span=6)。
  // 计算其所需的 offset 使其停靠在最后一行的第四列
  const offset = itemsInLastRow === 0 ? 18 : (3 - itemsInLastRow) * 6;

  return (
    <Card style={{ marginBottom: 8 }} styles={{ body: { padding: "24px 24px 24px 24px" } }}>
      <Form
        form={form}
        layout="horizontal"
        onFinish={onSearch}
        style={{ marginBottom: 0 }}
        labelCol={{ flex: "70px" }} // 统一 Label 宽度，保证所有查询框左侧完美对齐
      >
        <Row gutter={[16, 16]}>
          {childArray.map((child, idx) => (
            <Col span={6} key={idx}>
              {React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, {
                    style: { ...(child as React.ReactElement<any>).props.style, marginBottom: 0 }
                  })
                : child}
            </Col>
          ))}
          <Col span={6} offset={offset}>
            <Form.Item style={{ marginBottom: 0 }}>
              {/* 左侧空出 70px 跨过上方 Label 的位置，然后占用 200px 对齐上方 Input。 */}
              {/* 在这 200px 内通过 space-between 两端对齐，并保持按钮统一的小巧宽度 */}
              <div style={{ marginLeft: 70, display: "flex", justifyContent: "space-between", width: 200 }}>
                <Button type="primary" className="solid-primary" htmlType="submit" loading={loading} style={{ width: 80 }}>
                  查询
                </Button>
                <Button
                  style={{ width: 80 }}
                  onClick={() => {
                    form?.resetFields();
                    onReset?.();
                  }}
                >
                  重置
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
