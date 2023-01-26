export interface PagedResponse<T> {
    data: T;
    message: string;
    status: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number
}