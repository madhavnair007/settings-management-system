import { useEffect, useMemo, useState } from "react";

type Props = {
    label: string;
    value: string;
    onChange: (next: string) => void;
    requireObject?: boolean;
    disabled?: boolean;
};

export function JsonEditor({ label, value, onChange, requireObject = true, disabled }: Props) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (value.trim().length === 0) {
            setError("JSON is required");
            return;
        }

        try {
            const parsed = JSON.parse(value);

            if (requireObject) {
                const isObj =
                    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
                if (!isObj) {
                    setError("JSON must be an object (not an array/string/number/null)");
                    return;
                }
            }

            setError(null);
        } catch {
            setError("Invalid JSON (cannot parse)");
        }
    }, [value, requireObject]);

    const canSubmit = useMemo(() => error === null, [error]);

    const format = () => {
        try {
            const parsed = JSON.parse(value);
            onChange(JSON.stringify(parsed, null, 2));
        } catch {
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label style={{ fontWeight: 600 }}>{label}</label>
                <button type="button" onClick={format} disabled={disabled}>
                    Format JSON
                </button>
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={10}
                style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />

            {error ? (
                <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>
            ) : (
                <div style={{ color: "seagreen", fontSize: 13 }}>Valid JSON</div>
            )}

            <div data-valid={canSubmit ? "true" : "false"} style={{ display: "none" }} />
        </div>
    );
}

export function parseJsonObject(text: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
    if (text.trim().length === 0) return { ok: false, error: "JSON is required" };
    try {
        const parsed = JSON.parse(text);
        const isObj = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
        if (!isObj) return { ok: false, error: "JSON must be an object" };
        return { ok: true, value: parsed as Record<string, unknown> };
    } catch {
        return { ok: false, error: "Invalid JSON" };
    }
}
