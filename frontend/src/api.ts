export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: "include" });
  const data = await parseJson(r);
  if (!r.ok) {
    const err = (data.error as string | undefined) || r.statusText;
    throw new ApiError(err, r.status);
  }
  return data as T;
}

export async function apiPost<T>(url: string, body: object): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson(r);
  if (!r.ok) {
    const err = (data.error as string | undefined) || r.statusText;
    throw new ApiError(err, r.status);
  }
  return data as T;
}

export async function apiPatch<T>(url: string, body: object): Promise<T> {
  const r = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson(r);
  if (!r.ok) {
    const err = (data.error as string | undefined) || r.statusText;
    throw new ApiError(err, r.status);
  }
  return data as T;
}
