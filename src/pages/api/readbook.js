import { openDb, initializeTables } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ ok: false, status: 405, error: 'Method not allowed' });
    }

    try {
        const { id } = JSON.parse(req.body);

        if (!id) {
            return res.status(400).json({ ok: false, status: 400, error: 'Book ID is required' });
        }

        const db = await openDb();
        await initializeTables(db);

        const bookData = await db.get("SELECT * FROM books WHERE id = ?", [id]);

        if (!bookData) {
            return res.status(404).json({ ok: false, status: 404, error: 'Book not found' });
        }

        // Retrieve the chapters associated with the book ID
        // const chaptersData = await db.all("SELECT * FROM chapters WHERE book_id = ? ORDER BY id ASC", [id]);

        // Retrieve the chapters associated with the book ID and join with the active chapter_rewrites
        const chaptersData = await db.all(`
            SELECT 
                c.id,
                c.created_at,
                c.book_id,
                c.title,
                c.summary,
                c.matter_type,
                COALESCE(cr.content, c.content) AS content,
                COALESCE(cr.html, c.html) AS html,
                cr.prompt AS prompt,
                cr.credit AS credit,
                cr.cost AS cost
            FROM 
                chapters c
            LEFT JOIN 
                chapter_rewrites cr 
            ON 
                c.id = cr.chapter_id AND cr.is_active = 1
            WHERE 
                c.book_id = ? 
            ORDER BY 
                c.id ASC
        `, [id]);

        await db.close();

        return res.status(200).json({ ok: true, status: 200, book: bookData, chapters: chaptersData });
    } catch (error) {
        return res.status(200).json({ ok: false, status: 500, error: error.message });
    }
}

