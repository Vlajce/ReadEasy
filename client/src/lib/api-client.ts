import type { ApiResponse } from "@/types/api-response";
import { ApiError } from "@/lib/api-error";
import config from "@/config";

const API_URL = config.apiUrl;
const REFRESH_ENDPOINT = config.refreshEndpoint;

class ApiClient {
  private baseUrl: string;
  private refreshUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<null> | null = null;

  constructor(baseUrl: string, refreshEndpoint: string) {
    this.baseUrl = baseUrl;
    this.refreshUrl = baseUrl + refreshEndpoint;
  }

  private async handleTokenRefresh(): Promise<null> {
    // If already refreshing, wait for that request
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.get<null>(this.refreshUrl);

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit,
    tryRefresh = true,
  ): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        credentials: "include",
        ...options,
      });
      const resBody = (await res.json()) as ApiResponse<T>;

      if (!resBody.success) {
        if (
          res.status === 401 &&
          tryRefresh &&
          !endpoint.includes(this.refreshUrl)
        ) {
          await this.handleTokenRefresh();
          return this.request<T>(endpoint, options, false);
        }
        throw new ApiError(resBody.message, res.status, resBody.errorCode);
      }

      return resBody.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      throw Error("Something went wrong");
    }
  }

  get<T>(url: string) {
    return this.request<T>(url, {
      method: "GET",
    });
  }

  post<T>(url: string, data = {}, contentType = "application/json") {
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: JSON.stringify(data),
    });
  }

  put<T>(url: string, data = {}, contentType = "application/json") {
    return this.request<T>(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: JSON.stringify(data),
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, {
      method: "DELETE",
    });
  }

  patch<T>(url: string, data = {}, contentType = "application/json") {
    return this.request<T>(url, {
      method: "PATCH",
      headers: { "Content-Type": contentType },
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_URL, REFRESH_ENDPOINT);
