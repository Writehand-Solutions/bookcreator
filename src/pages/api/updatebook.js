// /api/updatebook.js
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
    const { apiKey, id, title } = requestData; // Extract apiKey (not used for DB operations)

    const db = await openDb();
    await initializeTables(db);

    // Update the book title
    await db.run("UPDATE books SET title = ? WHERE id = ?", [title, id]);

    await db.close();

    return res.status(200).json({ ok: true, status: 200 });
  } catch (error) {
    return res
      .status(200)
      .json({ ok: false, status: 500, error: error.message });
  }
}
