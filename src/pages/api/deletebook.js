// /api/deletebook.js
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
    const { apiKey, id } = requestData; // Extract apiKey (not used for DB operations)

    if (!id) {
      return res
        .status(400)
        .json({ ok: false, status: 400, error: "Book ID is required" });
    }

    const db = await openDb();
    await initializeTables(db);

    await db.exec("BEGIN TRANSACTION");

    try {
      await db.run("DELETE FROM chapters WHERE book_id = ?", [id]);
      await db.run("DELETE FROM books WHERE id = ?", [id]);
      await db.exec("COMMIT");
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    } finally {
      await db.close();
    }

    return res
      .status(200)
      .json({
        ok: true,
        status: 200,
        message: "Book and associated chapters deleted successfully",
      });
  } catch (error) {
    return res
      .status(200)
      .json({ ok: false, status: 500, error: error.message });
  }
}
