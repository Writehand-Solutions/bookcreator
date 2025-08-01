// /pages/api/deletebook.js
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
        error: "Book ID is required",
      });
    }

    // Ensure `id` is a number
    const bookId = Number(id);
    if (isNaN(bookId)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid book ID",
      });
    }

    // 🔁 Option 1: Delete manually (if foreign key constraints don't cascade)
    // await supabase.from('chapter_rewrites').delete().in('chapter_id', [
    //   (await supabase.from('chapters').select('id').eq('book_id', bookId)).data.map(c => c.id)
    // ]);
    // await supabase.from('chapters').delete().eq('book_id', bookId);
    // await supabase.from('books').delete().eq('id', bookId);

    // ✅ Option 2: Recommended — Use CASCADE in DB so deleting book auto-deletes related rows
    const { error } = await supabase.from("books").delete().eq("id", bookId);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to delete book: " + error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Book and associated chapters & rewrites deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error: " + error.message,
    });
  }
}
