// /pages/api/getrewrites.js
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
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Chapter ID (id) is required",
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

    // Fetch rewrites for the given chapter_id
    const { data: rewrites, error } = await supabase
      .from("chapter_rewrites")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("id", { ascending: false }); // Newest first

    if (error) {
      console.error("Supabase error fetching rewrites:", error);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to fetch rewrites: " + error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      rewrites,
    });
  } catch (error) {
    console.error("Unexpected error in /api/getrewrites:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
