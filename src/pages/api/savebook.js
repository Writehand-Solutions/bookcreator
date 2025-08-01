// /pages/api/savebook.js
import { supabase } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      status: 405,
      error: "Method not allowed",
    });
  }

  console.log("📥 Incoming body:", JSON.stringify(req.body, null, 2));

  try {
    const {
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
      toc,
      contains_math,
      contains_code,
      intro_content,
      intro_html,
      credit,
      cost,
      category,
      model,
      chaptersMarkdown,
      chaptersHtml,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !Array.isArray(chaptersMarkdown) ||
      !Array.isArray(chaptersHtml)
    ) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Title and chapter content (markdown/html) are required",
      });
    }

    if (chaptersMarkdown.length !== chaptersHtml.length) {
      return res.status(400).json({
        ok: false,
        status: 400,
        error: "Mismatch between markdown and HTML chapter counts",
      });
    }

    // Use tableOfContent or toc, fallback to empty array
    let effectiveToc = Array.isArray(tableOfContent)
      ? tableOfContent
      : Array.isArray(toc)
      ? toc
      : [];

    // If TOC is not valid, generate fallback titles
    if (!Array.isArray(effectiveToc) || effectiveToc.length === 0) {
      console.warn("No valid TOC provided, generating fallback TOC");
      effectiveToc = chaptersMarkdown.map((_, i) => ({
        title: `Chapter ${i + 1}`,
        summary: "",
        matter_type: 1,
      }));
    }

    // 1. Insert the book
    const { data, error: bookError } = await supabase
      .from("books")
      .insert([
        {
          title,
          tagline,
          content,
          html,
          about,
          keypoints,
          language,
          idea,
          plan,
          toc: effectiveToc,
          contains_math: Boolean(contains_math),
          contains_code: Boolean(contains_code),
          intro_content,
          intro_html,
          credit,
          cost,
          category,
          model,
        },
      ])
      .select("id")
      .single();

    if (bookError || !data) {
      console.error("Supabase insert error:", bookError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error:
          "Failed to create book: " +
          (bookError?.message || "No data returned"),
      });
    }

    const bookId = data.id;

    // 2. Insert chapters
    const chapterInserts = effectiveToc.map((tocItem, index) => ({
      book_id: bookId,
      title: tocItem.title,
      summary: tocItem.summary,
      content: chaptersMarkdown[index],
      html: chaptersHtml[index],
      matter_type: tocItem.matter_type || null,
    }));

    const { error: chaptersError } = await supabase
      .from("chapters")
      .insert(chapterInserts);

    if (chaptersError) {
      console.error("Error inserting chapters:", chaptersError);
      return res.status(500).json({
        ok: false,
        status: 500,
        error: "Failed to save chapters: " + chaptersError.message,
      });
    }

    return res.status(201).json({
      ok: true,
      status: 201,
      book: { id: bookId },
    });
  } catch (error) {
    console.error("Unexpected error in /api/savebook:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      error: "Internal server error",
    });
  }
}
