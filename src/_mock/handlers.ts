import { http, HttpResponse} from 'msw';

export const handlers = [
    http.post('*/api/auth/login', async ({ request }) => {
        const body = (await request.json()) as any;

        if (body.username === 'admin' && body.password === '123456') {
            return HttpResponse.json({
                code: 200,
                msg: '登陆成功',
                data: {
                    token: 'mock-token-xyz-123',
                    refreshToken: 'mock-refresh-token-abc-456',
                    expiresIn: 3600
                }
            });
        }

        return HttpResponse.json({
            code: 400,
            msg: '用户名或密码错误',
            data: null
        }, { status: 400 });
    })
]