type HttpResponse<T = any> = { status: number; data: T };

async function goToLogin() {}

const errorHandle = (status: number, other?: unknown) => {
    switch (status) {
        case 401:
        case 403:
        case 404:
        default:
            goToLogin();
    }
};

const TIMEOUT = 60000;

async function parseBody(res: Response): Promise<any> {
    const ct = res.headers.get("content-type") || "";
    try {
        if (ct.includes("application/json")) return await res.json();
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    } catch {
        return null;
    }
}

async function request<T = any>(
    url: string,
    init?: RequestInit,
    timeout = TIMEOUT
): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { ...init, signal: controller.signal });
        const data = await parseBody(res);
        if (res.ok) {
            return { status: res.status, data } as HttpResponse<T>;
        } else {
            errorHandle(res.status, (data as any)?.message);
            return Promise.reject({ status: res.status, data });
        }
    } catch (error: any) {
        return Promise.reject({
            data: {
                time_error_code: 1,
                message: error?.message || "Network Error",
            },
        });
    } finally {
        clearTimeout(id);
    }
}

function get<T = any>(url: string): Promise<HttpResponse<T>> {
    return request<T>(url, {
        method: "GET",
        headers: {
            Accept: "application/json, text/plain, */*",
        },
    });
}

function post<T = any>(url: string, body?: BodyInit): Promise<HttpResponse<T>> {
    return request<T>(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json, text/plain, */*",
        },
        body,
    });
}

export default { get, post };
