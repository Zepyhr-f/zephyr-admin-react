/**
 * 通用响应体
 */
export interface Result<T> {
    code: number;
    msg: string;
    data: T;
    timestamp: number;
}

/**
 * 分页数据通用响应体
 */
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
}