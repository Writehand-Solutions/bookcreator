// /api/savebook.js (Updated version)
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
    const {
      apiKey, // Extract apiKey (not used for DB operations)
      title,
      tagline,
      content,
      html,
      about,
      keypoints,
      language,
      idea,
      plan,
      tableOfContent,
      credit,
      cost,
      toc,
      contains_math,
      contains_code,
      intro_content,
      intro_html,
      chaptersMarkdown,
      category,
      model,
      chaptersHtml,
    } = requestData;

    const db = await openDb();
    await initializeTables(db);

    await db.exec("BEGIN TRANSACTION");

    let bookId;

    try {
      // Insert the book record
      const result = await db.run(
        "INSERT INTO books (title, tagline, content, html, about, keypoints, language, idea, plan, toc, contains_math, contains_code, intro_content, intro_html, credit, cost, category, model) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          tagline,
          content,
          html,
          about,
          keypoints,
          language,
          idea,
          plan,
          tableOfContent,
          contains_math,
          contains_code,
          intro_content,
          intro_html,
          credit,
          cost,
          category,
          model,
        ]
      );

      bookId = result.lastID;

      // Insert chapters records
      for (let i = 0; i < toc.length; i++) {
        await db.run(
          "INSERT INTO chapters (book_id, title, summary, content, html, matter_type) VALUES (?, ?, ?, ?, ?, ?)",
          [
            bookId,
            toc[i].title,
            toc[i].summary,
            chaptersMarkdown[i],
            chaptersHtml[i],
            toc[i].matter_type,
          ]
        );
      }

      await db.exec("COMMIT");
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    } finally {
      await db.close();
    }

    return res
      .status(201)
      .json({ ok: true, status: 201, book: { id: bookId } });
  } catch (error) {
    return res
      .status(200)
      .json({ ok: false, status: 500, error: error.message });
  }
}
