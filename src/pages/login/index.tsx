import { useState } from "react";
import { Button, Checkbox, Divider, Form, Input, Space, Typography, message, ConfigProvider } from "antd";
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore, type MenuItem } from "@/store/use-auth-store";
import client from "@/api/client";
import "./login.css";

type FormValues = {
  username: string;
  password: string;
  remember: boolean;
};

interface LoginResponse {
  token: string;
}

const TechGraphic = () => (
  <div className="z-auth__graphic-wrap">
    <svg className="z-auth__tech-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="150" stroke="url(#glowGradient)" strokeWidth="2" strokeDasharray="10 10" className="spin-slow" />
      <circle cx="200" cy="200" r="110" stroke="#60a5fa" strokeWidth="1" opacity="0.6" className="spin-reverse-slow" strokeDasharray="4 8" />
      <circle cx="200" cy="200" r="70" fill="url(#coreGradient)" className="pulse" />
      
      {/* Network Nodes */}
      <circle cx="200" cy="50" r="5" fill="#3b82f6" className="node" style={{ animationDelay: '0s' }} />
      <circle cx="306" cy="94" r="5" fill="#60a5fa" className="node" style={{ animationDelay: '0.5s' }} />
      <circle cx="350" cy="200" r="5" fill="#2563eb" className="node" style={{ animationDelay: '1s' }} />
      <circle cx="306" cy="306" r="5" fill="#3b82f6" className="node" style={{ animationDelay: '1.5s' }} />
      <circle cx="200" cy="350" r="5" fill="#60a5fa" className="node" style={{ animationDelay: '2s' }} />
      <circle cx="94" cy="306" r="5" fill="#2563eb" className="node" style={{ animationDelay: '2.5s' }} />
      <circle cx="50" cy="200" r="5" fill="#3b82f6" className="node" style={{ animationDelay: '3s' }} />
      <circle cx="94" cy="94" r="5" fill="#60a5fa" className="node" style={{ animationDelay: '3.5s' }} />
      
      {/* Connecting Lines */}
      <path d="M200 50 L306 94 L350 200 L306 306 L200 350 L94 306 L50 200 L94 94 Z" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
      <path d="M200 50 L200 130 M350 200 L270 200 M200 350 L200 270 M50 200 L130 200" stroke="rgba(37, 99, 235, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
      
      <defs>
        <linearGradient id="glowGradient" x1="0" y1="0" x2="400" y2="400">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#eff6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useAuthStore((state) => state.setToken);
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const setMenus = useAuthStore((state) => state.setMenus);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  async function onFinish(values: FormValues) {
    setLoading(true);
    try {
      const { remember, ...loginPayload } = values;
      const res = await client.post<LoginResponse>("/api/v1/auth/login", loginPayload);
      const token = res.token;

      // 1. 保存 token
      setToken(token);

      // 2. 拉取用户信息 & 菜单
      const infoData = await client.get<any>("/api/v1/auth/info");
      if (infoData) {
        setUserInfo(infoData.user, infoData.roles, infoData.perms || infoData.permissions || []);
      }

      const menuDataResp = await client.get<{ list: MenuItem[] }>("/api/v1/system/menu/tree");
      setMenus(menuDataResp.list || []);

      // 3. 记住我
      if (remember) {
        localStorage.setItem("remember_user", values.username);
      } else {
        localStorage.removeItem("remember_user");
      }

      message.success("登录成功");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      message.error("登录失败，请检查用户名或密码");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#3b82f6', colorBgContainer: 'rgba(255,255,255,0.85)' } }}>
      <div className="z-auth">
        {/* ── 左侧品牌区 ── */}
        <section className="z-auth__brand" aria-label="产品介绍">
          <div className="z-auth__brandInner">
            <TechGraphic />
            
            <div className="z-auth__logo-header">
              <img src="/logo.svg" alt="logo" className="z-auth__logo" />
              <h1 className="z-auth__title">Zephyr 管理系统</h1>
            </div>
          </div>
        </section>

        {/* ── 右侧表单区 ── */}
        <section className="z-auth__cardWrap" aria-label="登录表单">
          <div className="z-auth__card">
            <h2 className="z-auth__cardTitle">欢迎回来</h2>
            <p className="z-auth__cardDesc">请使用您的专属账号登录系统</p>

            <Form<FormValues>
              layout="vertical"
              requiredMark={false}
              initialValues={{ username: "admin", password: "admin123", remember: false }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[{ required: true, message: "请输入账号" }]}
              >
                <Input
                  size="large"
                  autoFocus
                  autoComplete="username"
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="请输入账号"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  size="large"
                  autoComplete="current-password"
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <div className="z-auth__helperRow">
                <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>记住密码</Checkbox>
                </Form.Item>
                <Typography.Link onClick={() => message.info("可对接重置密码/短信/邮箱验证码流程")}>
                  忘记密码？
                </Typography.Link>
              </div>

              <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  icon={<SafetyCertificateOutlined />}
                  style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                >
                  安全登录
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "24px 0", borderColor: 'rgba(15,23,42,0.1)' }} plain>
              <span style={{ color: '#64748b', fontSize: 13 }}>其他登录方式</span>
            </Divider>
            
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block size="large" onClick={() => message.info("可扩展：SSO / LDAP / OAuth / 钉钉/飞书登录")} style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(15,23,42,0.1)', color: '#475569' }}>
                企业级 SSO 登录
              </Button>
            </Space>

            <div className="z-auth__footer">
              <span>登录即表示您同意我们的</span>{" "}
              <a onClick={() => message.info("可对接：用户协议")}>用户协议</a>{" "}
              <span>与</span>{" "}
              <a onClick={() => message.info("可对接：隐私政策")}>隐私政策</a>
            </div>
          </div>
        </section>
      </div>
    </ConfigProvider>
  );
}
