import client from './client'; // force vite hmr
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
  return client.get<PageResult<PostVO>>('/zephyr-system/post/list', { params });
};

export const savePost = (data: PostForm) => {
  return client.post('/zephyr-system/post/save', data);
};

export const updatePost = (data: PostForm) => {
  return client.post('/zephyr-system/post/update', data);
};

export const removePosts = (codes: string[]) => {
  return client.post('/zephyr-system/post/remove', codes);
};

export const updatePostStatus = (code: string, status: number) => {
  return client.post('/zephyr-system/post/status', { code, status });
};
