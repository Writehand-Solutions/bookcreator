// /pages/api/getbooks.js
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
    const { offset = 0, limit = 5, user_id } = req.body;

    // Validate input
    const parsedOffset = Number(offset) || 0;
    const parsedLimit = Math.min(Number(limit) || 5, 100);

    if (parsedOffset < 0 || parsedLimit <= 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid pagination parameters",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Missing user_id",
      });
    }

    // Fetch books for this user only
    const { data: books, error } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", user_id)
      .order("id", { ascending: false })
      .range(parsedOffset, parsedOffset + parsedLimit - 1);

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to fetch books: " + error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      books,
    });
  } catch (error) {
    console.error("Unexpected error in /api/getbooks:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
