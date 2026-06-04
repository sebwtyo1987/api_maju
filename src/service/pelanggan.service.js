async function findAll(db) {
  const [rows] = await db.query(
    'SELECT * FROM pelanggan WHERE aktif = 1 ORDER BY pelanggan_id DESC'
  );
  return rows.map(row => ({
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
  }));
}

async function findById(db, id) {
  const [rows] = await db.query(
    'SELECT * FROM pelanggan WHERE pelanggan_id = ? AND aktif = 1',
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
    'SELECT * FROM pelanggan WHERE (nama_pelanggan LIKE ? OR alamat LIKE ? OR no_telepon LIKE ?) AND aktif = 1 ORDER BY pelanggan_id DESC',
    [searchTerm, searchTerm, searchTerm]
  );
  return rows.map(row => ({
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
  }));
}

async function create(db, { nama_pelanggan, alamat, no_telepon }) {
  const [result] = await db.query(
    'INSERT INTO pelanggan (nama_pelanggan, alamat, no_telepon) VALUES (?, ?, ?)',
    [nama_pelanggan, alamat, no_telepon]
  );
  return result.insertId;
}

async function update(db, id, { nama_pelanggan, alamat, no_telepon }) {
  const [result] = await db.query(
    'UPDATE pelanggan SET nama_pelanggan = ?, alamat = ?, no_telepon = ? WHERE pelanggan_id = ?',
    [nama_pelanggan, alamat, no_telepon, id]
  );
  return result.affectedRows;
}

async function remove(db, id) {
  const [result] = await db.query(
    'UPDATE pelanggan SET aktif = 0 WHERE pelanggan_id = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findById, search, create, update, remove };
