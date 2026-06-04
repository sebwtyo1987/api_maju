async function findAll(db) {
    const [rows] = await db.query('SELECT user_id, username, nama , role FROM users');
    return rows;
}

async function findById(db, id) {
    const [rows] = await db.query('SELECT user_id, username, role FROM users WHERE user_id = ?', [id]);
    return rows[0];
}

async function create(db, userData) {
    const { username, password, role, nama, menu } = userData;
    const [result] = await db.query(
        'INSERT INTO users (username, password, role, nama, menu) VALUES (?, ?, ?, ?, ?)',
        [username, password, role, nama, menu]
    );
    return result.insertId;
}

async function update(db, id, userData) {
    const { username, password, role, nama, menu = "" } = userData;
    await db.query(
        'UPDATE users SET username = ?, password = ?, role = ?, nama = ?, menu = ? WHERE user_id = ?',
        [username, password, role, nama, menu, id]
    );
}

async function remove(db, id) {
    await db.query('DELETE FROM users WHERE user_id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
