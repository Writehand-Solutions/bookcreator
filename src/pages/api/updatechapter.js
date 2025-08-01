import { openDb, initializeTables } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ ok: false, status: 405, error: 'Method not allowed' });
    }
    try {
        const { id, html, title } = JSON.parse(req.body);

        const db = await openDb();
        await initializeTables(db);
    
        // Update the chapter title
        await db.run(
            "UPDATE chapters SET title = ? WHERE id = ?",
            [title, id]
        );

        // Check if there are any active rewrites for this chapter
        const activeRewrite = await db.get(
            "SELECT 1 FROM chapter_rewrites WHERE chapter_id = ? AND is_active = 1",
            [id]
        );
        
        if (activeRewrite) {
            // If there is an active rewrite, update the chapter_rewrites table
            await db.run(
                "UPDATE chapter_rewrites SET html = ? WHERE chapter_id = ? AND is_active = 1",
                [html, id]
            );
        } else {
            // Otherwise, update the chapters table
            await db.run(
                "UPDATE chapters SET html = ? WHERE id = ?",
                [html, id]
            );
        }
    
        await db.close();
    
        return res.status(200).json({ ok: true, status: 200 });
    } catch (error) {
        return res.status(200).json({ ok: false, status: 500, error: error.message });
    }
}