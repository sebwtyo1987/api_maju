function castDataTypes(row) {
  if (row) {
    row.barcode = String(row.barcode || "");
    row.barang_id = Number(row.barang_id);
    row.kategori_id = Number(row.kategori_id);
    row.harga_hna = parseFloat(row.harga_hna);
    row.harga_beli = parseFloat(row.harga_beli || 0);
    row.stok = Number(row.stok);
    row.aktif = Number(row.aktif);
  }
  return row;
}

async function findAll(db) {
  const [rows] = await db.query(`
    SELECT b.barang_id, b.barcode, b.nama_barang, b.kategori_id, b.harga_hna, b.harga_beli, 
           b.stok, b.satuan, b.aktif, IFNULL(b.gambar, 'gambar/default.png') as gambar,
           DATE_FORMAT(b.created_at, '%Y-%m-%d') as created_at, k.nama_kategori
    FROM barang b
    LEFT JOIN kategori k ON b.kategori_id = k.kategori_id
    WHERE b.aktif = 1
    ORDER BY b.barang_id DESC
  `);
  return rows.map(castDataTypes);
}

async function countAll(db) {
  const [rows] = await db.query("SELECT COUNT(*) as total FROM barang WHERE aktif = 1");
  return rows[0].total;
}

async function findAllPag(db, limit, offset) {
  const [rows] = await db.query(`
    SELECT b.barang_id, b.barcode, b.nama_barang, b.kategori_id, b.harga_hna, b.harga_beli, 
           b.stok, b.satuan, b.aktif, IFNULL(b.gambar, 'gambar/default.png') as gambar,
           DATE_FORMAT(b.created_at, '%Y-%m-%d') as created_at, k.nama_kategori
    FROM barang b
    LEFT JOIN kategori k ON b.kategori_id = k.kategori_id
    WHERE b.aktif = 1
    ORDER BY b.barang_id DESC
    LIMIT ? OFFSET ?
  `, [Number(limit), Number(offset)]);
  return rows.map(castDataTypes);
}

async function findById(db, id) {
  const [rows] = await db.query(`
    SELECT b.barang_id, b.barcode, b.nama_barang, b.kategori_id, b.harga_hna, b.harga_beli, 
           b.stok, b.satuan, b.aktif, IFNULL(b.gambar, 'gambar/default.png') as gambar,
           DATE_FORMAT(b.created_at, '%Y-%m-%d') as created_at, k.nama_kategori
    FROM barang b
    LEFT JOIN kategori k ON b.kategori_id = k.kategori_id
    WHERE b.barang_id = ? AND b.aktif = 1
  `, [id]);
  return rows.length ? castDataTypes(rows[0]) : null;
}

async function search(db, searchQuery) {
  const words = searchQuery.split(/\s+/).filter(Boolean);

  let conditions = [];
  let params = [];

  words.forEach(word => {
    conditions.push("(b.nama_barang LIKE ? OR b.barcode LIKE ? OR k.nama_kategori LIKE ?)");
    const like = `%${word}%`;
    params.push(like, like, like);
  });

  const whereClause = conditions.length ? "AND " + conditions.join(" AND ") : "";

  const [rows] = await db.query(`
    SELECT b.barang_id, b.barcode, b.nama_barang, b.kategori_id, b.harga_hna, b.harga_beli, 
           b.stok, b.satuan, b.aktif, IFNULL(b.gambar, 'gambar/default.png') as gambar,
           DATE_FORMAT(b.created_at, '%Y-%m-%d') as created_at, k.nama_kategori
    FROM barang b
    LEFT JOIN kategori k ON b.kategori_id = k.kategori_id
    WHERE b.aktif = 1
    ${whereClause}
    ORDER BY b.barang_id DESC
  `, params);

  return rows.map(castDataTypes);
}

async function create(db, data) {
  const { barcode, nama_barang, kategori_id, harga_hna, stok, satuan, gambar } = data;
  const [result] = await db.query(`
    INSERT INTO barang 
    (barcode, nama_barang, kategori_id, harga_hna, stok, satuan, aktif, gambar) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    String(barcode || ""),
    nama_barang.toUpperCase().trim(),
    Number(kategori_id),
    parseFloat(harga_hna || 0),
    Number(stok || 0),
    String(satuan || "").toUpperCase().trim(),
    1,
    gambar || null
  ]);
  return result.insertId;
}

async function update(db, id, data) {
  const { barcode, nama_barang, kategori_id, harga_hna, stok, satuan, gambar } = data;
  const [result] = await db.query(`
    UPDATE barang 
    SET barcode=?, nama_barang=?, kategori_id=?, harga_hna=?, stok=?, satuan=?, gambar=? 
    WHERE barang_id=?
  `, [
    String(barcode || ""),
    nama_barang.toUpperCase().trim(),
    Number(kategori_id),
    parseFloat(harga_hna || 0),
    Number(stok || 0),
    String(satuan || "").toUpperCase().trim(),
    gambar || null,
    Number(id)
  ]);
  return {
    affectedRows: result.affectedRows,
    changedRows: result.changedRows
  };
}

async function remove(db, id) {
  const [result] = await db.query(`
    UPDATE barang SET aktif = 0 WHERE barang_id = ?
  `, [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findAllPag,
  countAll,
  findById,
  search,
  create,
  update,
  remove,
};
