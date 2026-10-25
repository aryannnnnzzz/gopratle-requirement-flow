/**
 * Typed API client for GoPratle requirement endpoints
 */

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiErrorDetail[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RequirementDocument {
  _id: string;
  eventName: string;
  eventType: string;
  dateType: "single" | "range";
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  category: "planner" | "performer" | "crew";
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequirementPayload {
  eventName: string;
  eventType: string;
  dateType: "single" | "range";
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  category: "planner" | "performer" | "crew";
  details: Record<string, any>;
}

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
};

export class ApiError extends Error {
  statusCode: number;
  errors: ApiErrorDetail[];
  rawResponse?: any;

  constructor(message: string, statusCode: number, errors: ApiErrorDetail[] = [], raw?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawResponse = raw;
  }
}

/**
 * Submit a new requirement to the backend
 */
export async function createRequirement(
  payload: CreateRequirementPayload
): Promise<RequirementDocument> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/requirements`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data: ApiResponse<RequirementDocument>;
    try {
      data = await res.json();
    } catch {
      throw new ApiError(
        "Server returned an unreadable response. Please check server status.",
        res.status
      );
    }

    if (!res.ok || !data.success) {
      if (res.status === 503) {
        throw new ApiError(
          data.message || "Database service is temporarily unavailable. Please retry in a few moments.",
          503,
          data.errors || [{ path: "database", message: "Database temporarily disconnected" }]
        );
      }

      throw new ApiError(
        data.message || "Failed to submit requirement",
        res.status,
        data.errors || []
      );
    }

    if (!data.data) {
      throw new ApiError("Requirement created but no response data returned", 500);
    }

    return data.data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network / connection failure
    throw new ApiError(
      "Unable to reach the server. Please check your internet connection or backend status.",
      0,
      [{ path: "network", message: err.message || "Connection refused" }]
    );
  }
}

/**
 * Fetch paginated requirements list, optionally filtered by category
 */
export async function getRequirements(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: RequirementDocument[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const baseUrl = getBaseUrl();
  const queryParams = new URLSearchParams();

  if (params?.category && params.category !== "all") {
    queryParams.set("category", params.category);
  }
  if (params?.page) {
    queryParams.set("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.set("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `${baseUrl}/requirements${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    let data: ApiResponse<RequirementDocument[]>;
    try {
      data = await res.json();
    } catch {
      throw new ApiError("Failed to parse requirements response", res.status);
    }

    if (!res.ok || !data.success) {
      throw new ApiError(data.message || "Failed to fetch requirements", res.status, data.errors);
    }

    return {
      items: data.data || [],
      pagination: data.pagination || {
        total: (data.data || []).length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      },
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError("Network error while fetching requirements", 0, [
      { path: "network", message: err.message },
    ]);
  }
}

/**
 * Fetch a single requirement by ID
 */
export async function getRequirementById(id: string): Promise<RequirementDocument> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/requirements/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data: ApiResponse<RequirementDocument> = await res.json();

    if (!res.ok || !data.success || !data.data) {
      throw new ApiError(data.message || "Requirement not found", res.status, data.errors);
    }

    return data.data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError("Network error while fetching requirement details", 0);
  }
}
