// /pages/api/readbook.js
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

    const bookId = Number(id);
    if (isNaN(bookId)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Invalid book ID",
      });
    }

    // 1. Fetch the book
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return res.status(404).json({
        ok: false,
        status: 404,
        error: "Book not found",
      });
    }

    // 2. Fetch chapters for this book
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select("*")
      .eq("book_id", bookId)
      .order("id", { ascending: true });

    if (chaptersError) {
      console.error("Error fetching chapters:", chaptersError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to fetch chapters",
      });
    }

    // 3. For each chapter, get the active rewrite (is_active = true)
    const enhancedChapters = await Promise.all(
      (chapters || []).map(async (chapter) => {
        const { data: rewrites, error } = await supabase
          .from("chapter_rewrites")
          .select("content, html, prompt, credit, cost")
          .eq("chapter_id", chapter.id)
          .eq("is_active", true)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = "no rows found"
          console.warn(
            `Error fetching rewrite for chapter ${chapter.id}:`,
            error
          );
        }

        return {
          ...chapter,
          content: rewrites?.content ?? chapter.content,
          html: rewrites?.html ?? chapter.html,
          prompt: rewrites?.prompt ?? null,
          credit: rewrites?.credit ?? null,
          cost: rewrites?.cost ?? null,
        };
      })
    );

    return res.status(200).json({
      ok: true,
      status: 200,
      book,
      chapters: enhancedChapters,
    });
  } catch (error) {
    console.error("Unexpected error in /api/readbook:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
