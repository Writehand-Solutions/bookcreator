// /api/savechapter.js
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
    const { apiKey, id, title, content, html, credit, cost, prompt } =
      requestData; // Extract apiKey

    const db = await openDb();
    await initializeTables(db);

    await db.run("BEGIN TRANSACTION");

    try {
      // Set all other records with the same chapter_id to is_active=0
      await db.run(
        "UPDATE chapter_rewrites SET is_active = 0 WHERE chapter_id = ? AND is_active = 1",
        [id]
      );

      // Insert the new rewrite record with is_active=1
      await db.run(
        "INSERT INTO chapter_rewrites (chapter_id, content, html, prompt, credit, cost, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        [id, content, html, prompt, credit, cost]
      );

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
      .status(500)
      .json({ ok: false, status: 500, error: error.message }); // Fixed typo: was 52000
  }
}
