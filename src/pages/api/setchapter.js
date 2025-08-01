// /pages/api/setchapter.js
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
    const { id, chapter_id } = req.body;

    if (!id || !chapter_id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Both 'id' (rewrite ID) and 'chapter_id' are required",
      });
    }

    const rewriteId = Number(id);
    const chapterId = Number(chapter_id);

    if (isNaN(rewriteId) || isNaN(chapterId)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid IDs: 'id' and 'chapter_id' must be numbers",
      });
    }

    // 1. Verify the rewrite belongs to the chapter
    const { count, error: checkError } = await supabase
      .from("chapter_rewrites")
      .select("id", { count: "exact", head: true })
      .eq("id", rewriteId)
      .eq("chapter_id", chapterId);

    if (checkError) {
      console.error("Error checking rewrite ownership:", checkError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Database check failed",
      });
    }

    if (count === 0) {
      return res.status(404).json({
        ok: false,
        status: 404,
        error: "Rewrite not found for this chapter",
      });
    }

    // 2. Deactivate all active rewrites for this chapter
    const { error: updateError } = await supabase
      .from("chapter_rewrites")
      .update({ is_active: false })
      .eq("chapter_id", chapterId)
      .eq("is_active", true);

    if (updateError) {
      console.error("Failed to deactivate previous rewrites:", updateError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to deactivate previous versions",
      });
    }

    // 3. Activate the specified rewrite
    const { error: activateError } = await supabase
      .from("chapter_rewrites")
      .update({ is_active: true })
      .eq("id", rewriteId);

    if (activateError) {
      console.error("Failed to activate selected rewrite:", activateError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to activate the selected version",
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Active chapter rewrite updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error in /api/setchapter:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
