export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta | null;
  timestamp: string;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  error: { code: string; details?: { field: string; message: string }[] };
  timestamp: string;
}

export interface PaginatedData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
