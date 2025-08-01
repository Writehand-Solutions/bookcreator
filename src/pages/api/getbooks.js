// /api/getbooks.js
import { openDb, initializeTables } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(200)
      .json({ ok: false, status: 405, error: "Method not allowed" });
  }

  try {
    const requestData =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { apiKey, offset = 0, limit = 5 } = requestData; // Extract apiKey (not used for DB operations)

    const db = await openDb();
    await initializeTables(db);

    const books = await db.all(
      "SELECT * FROM books ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    await db.close();

    return res.status(200).json({ ok: true, status: 200, books: books });
  } catch (error) {
    return res
      .status(200)
      .json({ ok: false, status: 500, error: error.message });
  }
}
