import "dotenv/config";
import express from "express";
import { randomUUID } from "crypto";
import { pool } from "./db/client";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    return next(err);
});

function isJsonObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

app.get("/health/db", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        return res.status(200).json({ ok: true, db: "up" });
    } catch (err) {
        console.error("DB health check failed:", err);
        return res.status(500).json({ ok: false, db: "down" });
    }
});

app.post("/api/settings", async (req, res) => {
    const body = req.body;

    // Input validation
    if (body === undefined) {
        return res.status(400).json({ error: "Request body is required" });
    }
    if (!isJsonObject(body)) {
        return res.status(400).json({ error: "Request body must be a JSON object" });
    }

    const uid = randomUUID();

    try {
        const result = await pool.query(
            `INSERT INTO settings (uid, settings)
       VALUES ($1, $2::jsonb)
       RETURNING uid, settings`,
            [uid, body]
        );

        const row = result.rows[0];

        return res.status(201).json({ uid: row.uid, settings: row.settings });
    } catch (err) {
        console.error("Insert failed:", err);
        return res.status(500).json({ error: "Failed to save settings" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
