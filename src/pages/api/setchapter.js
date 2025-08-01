// /api/setchapter.js
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
    const { apiKey, id, chapter_id } = requestData; // Extract apiKey (not used for DB operations)

    const db = await openDb();
    await initializeTables(db);

    await db.run("BEGIN TRANSACTION");

    try {
      // Set is_active to 0 for all rewrites of the specified chapter
      await db.run(
        "UPDATE chapter_rewrites SET is_active = 0 WHERE chapter_id = ?",
        [chapter_id]
      );

      // Set is_active to 1 for the specific rewrite by id
      await db.run("UPDATE chapter_rewrites SET is_active = 1 WHERE id = ?", [
        id,
      ]);

      await db.run("COMMIT");
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    } finally {
      await db.close();
    }

    return res.status(200).json({ ok: true, status: 200 });
  } catch (error) {
    return res
      .status(200)
      .json({ ok: false, status: 500, error: error.message });
  }
}
