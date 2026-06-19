import client from './client';
import type { PageResult } from './role';

export interface PostVO {
  id: number;
  code: string;
  postName: string;
  orderNum: number;
  status: number;
  createTime: string;
}

export interface PostForm {
  id?: number;
  code: string;
  postName: string;
  orderNum: number;
  status: number;
}

export const getPostPage = (params: { current: number; size: number; postName?: string; status?: number }) => {
  return client.get<PageResult<PostVO>>('/api/v1/system/post/list', { params });
};

export const savePost = (data: PostForm) => client.post('/api/v1/system/post/save', data);
export const updatePost = (data: PostForm) => client.post('/api/v1/system/post/update', data);
export const removePosts = (codes: string[]) => client.post('/api/v1/system/post/remove', { codes });
export const updatePostStatus = (code: string, status: number) => client.post('/api/v1/system/post/status', { code, status });
