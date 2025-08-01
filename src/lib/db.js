import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database connection
export async function openDb() {
  return open({
    filename: './my-database.db',
    driver: sqlite3.Database,
  });
}

// Initialize the tables
export async function initializeTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
        contains_math INTEGER,
        contains_code INTEGER,
        intro_content TEXT,
        intro_html TEXT,

        credit NUMERIC,
        cost NUMERIC,

        category INTEGER,
        model VARCHAR(255)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        book_id INTEGER,
        title TEXT,
        summary TEXT,
        content TEXT,
        html TEXT,
        matter_type INTEGER,
        FOREIGN KEY (book_id) REFERENCES books (id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS chapter_rewrites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chapter_id INTEGER,
        content TEXT,
        html TEXT,
        prompt TEXT,
        credit NUMERIC,
        cost NUMERIC,
        is_active INTEGER,
        FOREIGN KEY (chapter_id) REFERENCES chapters (id)
        )
    `);
    


    // await db.exec(`ALTER TABLE books ADD credit INTEGER`);
    // await db.exec(`ALTER TABLE chapter_rewrites ADD credit INTEGER`);
    // await db.exec(`ALTER TABLE books ADD language VARCHAR(255)`);
    // await db.exec(`ALTER TABLE books ADD intro_content TEXT`);
    // await db.exec(`ALTER TABLE books ADD intro_html TEXT`);
}
