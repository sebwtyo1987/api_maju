async function findAll(db) {
  const [rows] = await db.query(
    'SELECT * FROM kategori WHERE aktif = 1 ORDER BY kategori_id DESC'
  );
  return rows.map(row => ({
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
  }));
}

async function findById(db, id) {
  const [rows] = await db.query(
    'SELECT * FROM kategori WHERE kategori_id = ? AND aktif = 1',
    [id]
  );
  if (!rows[0]) return null;
  const data = rows[0];
  data.created_at = data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : null;
  return data;
}

async function search(db, query) {
  const searchTerm = `%${query}%`;
  const [rows] = await db.query(
    'SELECT * FROM kategori WHERE (nama_kategori LIKE ? OR deskripsi LIKE ?) AND aktif = 1 ORDER BY kategori_id DESC',
    [searchTerm, searchTerm]
  );
  return rows.map(row => ({
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
  }));
}

async function create(db, { nama_kategori, deskripsi }) {
  const [result] = await db.query(
    'INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)',
    [nama_kategori, deskripsi]
  );
  return result.insertId;
}

async function update(db, id, { nama_kategori, deskripsi }) {
  const [result] = await db.query(
    'UPDATE kategori SET nama_kategori = ?, deskripsi = ? WHERE kategori_id = ?',
    [nama_kategori, deskripsi, id]
  );
  return result.affectedRows;
}

async function remove(db, id) {
  const [result] = await db.query(
    'UPDATE kategori SET aktif = 0 WHERE kategori_id = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findById, search, create, update, remove };
