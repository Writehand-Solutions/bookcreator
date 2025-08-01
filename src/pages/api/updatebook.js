// /pages/api/updatebook.js
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
    const { id, title } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Book ID is required",
      });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Valid title is required",
      });
    }

    const bookId = Number(id);
    if (isNaN(bookId)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid book ID",
      });
    }

    // Update the book in Supabase
    const { data, error } = await supabase
      .from("books")
      .update({ title })
      .eq("id", bookId)
      .select("id") // Optional: return ID to confirm update
      .single();

    if (error) {
      console.error("Supabase update error:", error);

      // Handle case where book doesn't exist
      if (error.code === "PGRST116") {
        // "No rows found"
        return res.status(404).json({
          ok: false,
          status: 404,
          error: "Book not found",
        });
      }

      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to update book: " + error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Book updated successfully",
      book: { id: data.id },
    });
  } catch (error) {
    console.error("Unexpected error in /api/updatebook:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
