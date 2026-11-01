import { apiRequest } from "@/shared/api/client";
import type { ReportDto, CreateReportDto } from "@/shared/api/types";

export const reportsApi = {
  getAll: (params?: { postId?: string; reporterId?: string; reason?: string; page?: number; limit?: number }) => 
    apiRequest<{data: ReportDto[], total: number}>("/reports", { method: "GET", params }),
  create: (data: CreateReportDto) => apiRequest<ReportDto>("/reports", { method: "POST", body: data }),
  getById: (id: string) => apiRequest<ReportDto>(`/reports/${id}`, { method: "GET" }),
  update: (id: string, data: { reason: string }) => apiRequest<ReportDto>(`/reports/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => apiRequest<{message?: string}>(`/reports/${id}`, { method: "DELETE" }),
};
