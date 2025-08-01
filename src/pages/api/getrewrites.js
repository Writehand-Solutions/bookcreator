import { openDb, initializeTables } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ ok: false, status: 405, error: 'Method not allowed' });
    }

    try {
        const { id } = JSON.parse(req.body); // chapter id
    
        const db = await openDb();
        await initializeTables(db);
    
        const rewritesData = await db.all("SELECT * FROM chapter_rewrites WHERE chapter_id = ? ORDER BY id DESC", [id]);
    
        await db.close();
    
        return res.status(200).json({ ok: true, status: 200, rewrites: rewritesData });
    } catch (error) {
        return res.status(200).json({ ok: false, status: 500, error: error.message });
    }
}