// /pages/api/updatechapter.js
import { supabase } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      status: 405,
      error: "Method not allowed",
    });
  }

  try {
    const { id, title, html } = req.body;

    // Validate required fields
    if (!id || !title || !html) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Chapter ID, title, and HTML are required",
      });
    }

    const chapterId = Number(id);
    if (isNaN(chapterId)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid chapter ID",
      });
    }

    // 1. Always update the chapter title
    const { error: titleError } = await supabase
      .from("chapters")
      .update({ title })
      .eq("id", chapterId);

    if (titleError) {
      console.error("Failed to update chapter title:", titleError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to update chapter title",
      });
    }

    // 2. Check if there is an active rewrite for this chapter
    const { activeRewrites, error: queryError } = await supabase
      .from("chapter_rewrites")
      .select("id")
      .eq("chapter_id", chapterId)
      .eq("is_active", true)
      .limit(1);

    if (queryError) {
      console.error("Error checking active rewrites:", queryError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Database error while checking rewrites",
      });
    }

    // 3. Decide where to update the HTML
    if (activeRewrites.length > 0) {
      // Update the active rewrite record
      const { error: rewriteError } = await supabase
        .from("chapter_rewrites")
        .update({ html })
        .eq("chapter_id", chapterId)
        .eq("is_active", true);

      if (rewriteError) {
        console.error("Failed to update active rewrite HTML:", rewriteError);
        return res.status(500).json({
          ok: false,
          status: 500,
          error: "Failed to update rewrite HTML",
        });
      }
    } else {
      // No active rewrite → update the chapters table directly
      const { error: chapterHtmlError } = await supabase
        .from("chapters")
        .update({ html })
        .eq("id", chapterId);

      if (chapterHtmlError) {
        console.error("Failed to update chapter HTML:", chapterHtmlError);
        return res.status(500).json({
          ok: false,
          status: 500,
          error: "Failed to update chapter HTML",
        });
      }
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Chapter updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error in /api/updatechapter:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
