import { useEffect, useMemo, useState } from "react";
import type { SettingsItem } from "./api/settingsApi";
import {
  createSettings,
  deleteSettings,
  getSettings,
  listSettings,
  updateSettings,
} from "./api/settingsApi";
import { JsonEditor, parseJsonObject } from "./components/JsonEditor";

function preview(settings: Record<string, unknown>, maxLen = 80): string {
  const s = JSON.stringify(settings);
  return s.length > maxLen ? s.slice(0, maxLen) + "…" : s;
}

export default function App() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [items, setItems] = useState<SettingsItem[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createText, setCreateText] = useState<string>('{\n  "example": true\n}');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const refreshList = async (nextOffset = offset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSettings(limit, nextOffset);
      setItems(data.items);
      setTotal(data.page.total);
      setOffset(data.page.offset);
    } catch (e: any) {
      setError(e.message || "Failed to load list");
    } finally {
      setLoading(false);
    }
  };

  const closeEdit = () => {
    setSelectedUid(null);
    setEditText("");
    setEditMessage(null);
  };

  useEffect(() => {
    refreshList(0);
  }, []);

  const createParsed = useMemo(() => parseJsonObject(createText), [createText]);
  const editParsed = useMemo(() => parseJsonObject(editText), [editText]);

  const onCreate = async () => {
    setEditMessage(null);
    if (!createParsed.ok) return;

    setCreateSubmitting(true);
    try {
      await createSettings(createParsed.value);
      await refreshList(0);
    } catch (e: any) {
      setError(e.message || "Create failed");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onSelect = async (uid: string) => {
    setSelectedUid(uid);
    setEditMessage(null);
    setEditLoading(true);
    setError(null);
    try {
      const data = await getSettings(uid);
      setEditText(JSON.stringify(data.settings, null, 2));
    } catch (e: any) {
      setError(e.message || "Failed to load item");
    } finally {
      setEditLoading(false);
    }
  };

  const onSave = async () => {
    if (!selectedUid) return;
    if (!editParsed.ok) return;

    setEditSubmitting(true);
    setEditMessage(null);
    setError(null);
    try {
      await updateSettings(selectedUid, editParsed.value);
      setEditMessage("Saved!");
      await refreshList(offset);
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  const onDelete = async (uid: string) => {
    setEditMessage(null);
    setError(null);
    const ok = window.confirm("Delete this settings record? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteSettings(uid);
      await refreshList(offset);
      if (selectedUid === uid) {
        closeEdit();
      }
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + limit, total);

  return (
    <main style={{
      padding: 24,
      fontFamily: "system-ui, sans-serif",
      maxWidth: 1800,
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
    }}>
      <h1 style={{ marginBottom: 8 }}>Settings Manager</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        CRUD + pagination UI for <code>/api/settings</code>
      </p>

      {error && (
        <div style={{ background: "#ffecec", border: "1px solid #ffb3b3", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, alignItems: "start" }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Create</h2>
          <JsonEditor label="Settings JSON (object)" value={createText} onChange={setCreateText} />
          <button
            onClick={onCreate}
            disabled={!createParsed.ok || createSubmitting}
            style={{ marginTop: 12 }}
          >
            {createSubmitting ? "Creating..." : "Create (POST)"}
          </button>
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ marginTop: 0 }}>List</h2>
            <button onClick={() => refreshList(offset)} disabled={loading}>
              Refresh
            </button>
          </div>

          <div style={{ color: "#555", marginBottom: 8 }}>
            Showing {showingFrom}–{showingTo} of {total}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr 220px",
                gap: 12,
                padding: "8px 10px",
                fontWeight: 700,
                borderBottom: "1px solid #eee",
              }}
            >
              <div>UID</div>
              <div>Preview</div>
              <div>Actions</div>
            </div>

            {loading ? (
              <div style={{ padding: 12 }}>Loading…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 12 }}>No settings found.</div>
            ) : (
              items.map((it) => (
                <div
                  key={it.uid}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "280px 1fr 220px",
                    gap: 12,
                    padding: 12,
                    minWidth: 0,
                    borderRadius: 12,
                    background: selectedUid === it.uid
                      ? "rgba(255, 255, 255, 0.06)"
                      : "transparent",
                    border: selectedUid === it.uid
                      ? "1px solid rgba(255, 255, 255, 0.7)"
                      : "1px solid rgba(255, 255, 255, 0.35)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      wordBreak: "break-all",
                      lineHeight: 1.3,
                    }}
                  >
                    {it.uid}
                  </div>

                  <div style={{ color: "#fff", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {preview(it.settings)}
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => onSelect(it.uid)} disabled={editLoading && selectedUid === it.uid}>
                      View/Edit
                    </button>
                    <button onClick={() => onDelete(it.uid)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => refreshList(Math.max(0, offset - limit))}
              disabled={!canPrev || loading}
            >
              Prev
            </button>
            <button
              onClick={() => refreshList(offset + limit)}
              disabled={!canNext || loading}
            >
              Next
            </button>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ marginTop: 0 }}>Edit</h2>

              {selectedUid && (
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={editSubmitting || editLoading}
                  aria-label="Close edit panel"
                  style={{ fontSize: 16, lineHeight: 1, padding: "4px 8px" }}
                >
                  ✕
                </button>
              )}
            </div>


            {!selectedUid ? (
              <div style={{ color: "#666" }}>Select an item to view/edit.</div>
            ) : (
              <>
                <div style={{ marginBottom: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  UID: {selectedUid}
                </div>

                {editLoading ? (
                  <div>Loading settings…</div>
                ) : (
                  <>
                    <JsonEditor
                      label="Settings JSON (object)"
                      value={editText}
                      onChange={setEditText}
                      disabled={editSubmitting}
                    />

                    <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                      <button
                        onClick={onSave}
                        disabled={!editParsed.ok || editSubmitting}
                      >
                        {editSubmitting ? "Saving..." : "Save (PUT)"}
                      </button>

                      {editMessage && <span style={{ color: "seagreen" }}>{editMessage}</span>}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
