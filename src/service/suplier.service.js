/**
 * Mencari semua suplier dengan filter pencarian dan pagination
 * @param {object} db - Pool koneksi database
 * @param {string} search - Kata kunci pencarian
 * @param {number} limit - Jumlah data per halaman
 * @param {number} offset - Titik mulai data
 * @returns {Promise<Array>}
 */
async function findAll(db, search, limit, offset) {
  let whereClause = 'WHERE aktif = 1';
  const params = [];

  if (search) {
    whereClause += ' AND (nama_suplier LIKE ? OR kode_suplier LIKE ? OR alamat LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const [rows] = await db.query(
    `SELECT * FROM suplier ${whereClause} ORDER BY suplier_id DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows.map(row => ({
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
  }));
}

/**
 * Menghitung total data suplier untuk pagination
 * @param {object} db 
 * @param {string} search 
 * @returns {Promise<number>}
 */
async function countAll(db, search) {
  let whereClause = 'WHERE aktif = 1';
  const params = [];

  if (search) {
    whereClause += ' AND (nama_suplier LIKE ? OR kode_suplier LIKE ? OR alamat LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const [rows] = await db.query(
    `SELECT COUNT(*) as total FROM suplier ${whereClause}`,
    params
  );
  return rows[0].total;
}

async function findById(db, id) {
  const [rows] = await db.query(
    'SELECT * FROM suplier WHERE suplier_id = ? AND aktif = 1',
    [id]
  );
  if (!rows[0]) return null;
  const data = rows[0];
  data.created_at = data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : null;
  return data;
}

/**
 * Logika internal untuk generate kode suplier otomatis (SUP001, dst)
 */
async function generateNextKode(db) {
  const [rows] = await db.query(
    "SELECT kode_suplier FROM suplier WHERE kode_suplier LIKE 'SUP%' ORDER BY suplier_id DESC LIMIT 1"
  );
  
  let nextNo = 1;
  if (rows.length > 0) {
    const lastNum = parseInt(rows[0].kode_suplier.replace('SUP', ''));
    if (!isNaN(lastNum)) nextNo = lastNum + 1;
  }
  
  return `SUP${String(nextNo).padStart(3, '0')}`;
}

async function create(db, { nama_suplier, alamat, telepon, email }) {
  const kode = await generateNextKode(db);
  
  const [result] = await db.query(
    'INSERT INTO suplier (kode_suplier, nama_suplier, alamat, telepon, email, aktif) VALUES (?, ?, ?, ?, ?, 1)',
    [kode, nama_suplier, alamat || '', telepon || '', email || '']
  );
  return result.insertId;
}

async function update(db, id, { kode_suplier, nama_suplier, alamat, telepon, email }) {
  const [result] = await db.query(
    'UPDATE suplier SET kode_suplier = ?, nama_suplier = ?, alamat = ?, telepon = ?, email = ? WHERE suplier_id = ?',
    [kode_suplier, nama_suplier, alamat, telepon, email, id]
  );
  return result.affectedRows;
}

async function remove(db, id) {
  const [result] = await db.query(
    'UPDATE suplier SET aktif = 0 WHERE suplier_id = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = {
  findAll, countAll, findById,
  create, update, remove
};
