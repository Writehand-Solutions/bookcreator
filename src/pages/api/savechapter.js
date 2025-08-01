// /pages/api/savechapter.js
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
    const { id, content, html, credit, cost, prompt, user_id } = req.body;

    if (!id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Chapter ID (id) is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Missing user_id",
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

    if (typeof content !== "string" || typeof html !== "string") {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Content and HTML are required",
      });
    }

    // 1. Deactivate all existing active rewrites for this chapter
    const { error: updateError } = await supabase
      .from("chapter_rewrites")
      .update({ is_active: false })
      .eq("chapter_id", chapterId)
      .eq("is_active", true);

    if (updateError) {
      console.error("Failed to deactivate old rewrites:", updateError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to update previous rewrites",
      });
    }

    // 2. Insert the new active rewrite with user_id
    const { error: insertError } = await supabase
      .from("chapter_rewrites")
      .insert({
        chapter_id: chapterId,
        content,
        html,
        prompt: prompt || null,
        credit: credit || 0,
        cost: cost || 0,
        is_active: true,
        user_id, // ✅ Add user_id for isolation
      });

    if (insertError) {
      console.error("Failed to insert new rewrite:", insertError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to save new chapter rewrite",
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Chapter rewrite saved successfully",
    });
  } catch (error) {
    console.error("Unexpected error in /api/savechapter:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
