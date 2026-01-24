export type SettingsItem = {
    uid: string;
    settings: Record<string, unknown>;
};

export type ListResponse = {
    items: SettingsItem[];
    page: {
        limit: number;
        offset: number;
        total: number;
    };
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        ...init,
    });

    if (!res.ok) {
        let message = `${res.status} ${res.statusText}`;
        try {
            const data = await res.json();
            if (data?.error) message = data.error;
        } catch {
            const txt = await res.text().catch(() => "");
            if (txt) message = txt;
        }
        throw new Error(message);
    }

    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
}

export function listSettings(limit: number, offset: number): Promise<ListResponse> {
    return request<ListResponse>(`/api/settings?limit=${limit}&offset=${offset}`);
}

export function createSettings(settings: Record<string, unknown>): Promise<SettingsItem> {
    return request<SettingsItem>(`/api/settings`, {
        method: "POST",
        body: JSON.stringify(settings),
    });
}

export function getSettings(uid: string): Promise<SettingsItem> {
    return request<SettingsItem>(`/api/settings/${uid}`);
}

export function updateSettings(uid: string, settings: Record<string, unknown>): Promise<SettingsItem> {
    return request<SettingsItem>(`/api/settings/${uid}`, {
        method: "PUT",
        body: JSON.stringify(settings),
    });
}

export function deleteSettings(uid: string): Promise<void> {
    return request<void>(`/api/settings/${uid}`, { method: "DELETE" });
}
