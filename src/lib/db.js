// lib/db.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables!");
}

// Create a singleton instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Initialize tables (only needed once, optionally done via Supabase SQL editor)
 * You can run this once manually, or call it during setup.
 */
export async function initializeTables() {
  const queries = [
    // Books table
    `
    CREATE TABLE IF NOT EXISTS books (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),

      about VARCHAR(255),
      keypoints TEXT,
      language VARCHAR(255),
      idea TEXT,
      plan TEXT,
      toc TEXT,

      title VARCHAR(255),
      tagline VARCHAR(255),

      content TEXT,
      html TEXT,
      contains_math BOOLEAN DEFAULT FALSE,
      contains_code BOOLEAN DEFAULT FALSE,
      intro_content TEXT,
      intro_html TEXT,

      credit NUMERIC,
      cost NUMERIC,

      category INTEGER,
      model VARCHAR(255)
    );
    `,

    // Chapters table
    `
    CREATE TABLE IF NOT EXISTS chapters (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      book_id INTEGER,
      title TEXT,
      summary TEXT,
      content TEXT,
      html TEXT,
      matter_type INTEGER,

      CONSTRAINT fk_book
        FOREIGN KEY(book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
    );
    `,

    // Chapter rewrites table
    `
    CREATE TABLE IF NOT EXISTS chapter_rewrites (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      chapter_id INTEGER,
      content TEXT,
      html TEXT,
      prompt TEXT,
      credit NUMERIC,
      cost NUMERIC,
      is_active BOOLEAN DEFAULT TRUE,

      CONSTRAINT fk_chapter
        FOREIGN KEY(chapter_id)
        REFERENCES chapters(id)
        ON DELETE CASCADE
    );
    `,
  ];

  // Note: Supabase doesn't allow DDL (CREATE TABLE) via client SDK
  // You must run these queries in the Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
  console.warn(
    "⚠️ Run the above SQL in the Supabase SQL Editor. DDL queries are not allowed via client."
  );
}
