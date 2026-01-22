// // import { start } from './src/index.ts'

// import "dotenv/config"
// import express from "express"
// import { pool } from "./src/db/client"

// const express = require("express")
// const app = express()
// const PORT = Number(process.env.PORT) || 3000;

// app.get("/health/db", async (_req, res) => {
//     try {
//         await pool.query("SELECT 1");
//         return res.status(200).json({ ok: true, db: "up" });
//     } catch (err) {
//         console.error("DB health check failed:", err);
//         return res.status(500).json({ ok: false, db: "down" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Backend listening on http://localhost:${PORT}`);
// })
