class ControlClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ControlClientError';
  }
}

async function getErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { error?: string; detail?: string };
      return payload.error ?? payload.detail ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  try {
    const text = await response.text();
    return text || response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ControlClientError(response.status, await getErrorMessage(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function readControlJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  return request<T>(input, init);
}

export async function writeControlJson<T>(
  input: RequestInfo | URL,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
) {
  return request<T>(input, {
    method,
    headers: body == null ? undefined : { 'Content-Type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  });
}
