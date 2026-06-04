/**
 * Mencari semua data pembelian
 */
async function findAll(db) {
  const [rows] = await db.query(`
    SELECT p.*, s.nama_suplier, u.nama AS user_nama 
    FROM pembelian p 
    LEFT JOIN suplier s ON p.suplier_id = s.suplier_id 
    LEFT JOIN users u ON p.user_id = u.user_id 
    ORDER BY p.tanggal DESC, p.pembelian_id DESC
  `);
  return rows.map(row => ({
    ...row,
    tanggal: (() => {
      if (!row.tanggal) return null;
      const d = new Date(row.tanggal);
      return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })(),
    created_at: (() => {
      if (!row.created_at) return null;
      const d = new Date(row.created_at);
      return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })()
  }));
}

/**
 * Mendapatkan detail pembelian berdasarkan ID
 */
async function findById(db, id) {
  const [rows] = await db.query(`
    SELECT p.*, s.nama_suplier, u.nama AS user_nama 
    FROM pembelian p 
    LEFT JOIN suplier s ON p.suplier_id = s.suplier_id 
    LEFT JOIN users u ON p.user_id = u.user_id 
    WHERE p.pembelian_id = ?
  `, [id]);

  if (rows.length === 0) return null;

  const pembelian = rows[0];
  pembelian.tanggal = (() => {
    if (!pembelian.tanggal) return null;
    const d = new Date(pembelian.tanggal);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  })();
  pembelian.created_at = (() => {
    if (!pembelian.created_at) return null;
    const d = new Date(pembelian.created_at);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  })();

  // Ambil detail items
  const [details] = await db.query(`
    SELECT dp.*, b.nama_barang, b.barcode,
           dp.dis_1 AS diskon1, dp.dis_2 AS diskon2, dp.dis_3 AS diskon3, dp.dis_4 AS diskon4
    FROM detail_pembelian dp 
    JOIN barang b ON dp.barang_id = b.barang_id 
    WHERE dp.pembelian_id = ? 
    ORDER BY dp.detail_urut ASC
  `, [id]);

  pembelian.details = details.map(d => ({
    ...d,
    pembelian_expired: (() => {
      if (!d.pembelian_expired) return null;
      const dt = new Date(d.pembelian_expired);
      return Number.isNaN(dt.getTime()) ? null : dt.toISOString().split('T')[0];
    })()
  }));

  // Decode diskon tambahan
  if (pembelian.dis_tambahan) {
    try {
      const disData = JSON.parse(pembelian.dis_tambahan);
      Object.assign(pembelian, disData);
    } catch (e) {
      pembelian.globalDiskon = {};
    }
  }

  return pembelian;
}

/**
 * Membuat data pembelian baru (Transactional)
 */
async function create(db, { user_id, suplier_id, tanggal, keterangan, items, globalDiskon }) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Kalkulasi Total
    const total_barang = items.reduce((acc, item) => acc + Number(item.subtotal), 0);
    const g_persen = parseFloat(globalDiskon?.global_diskon_persen || 0);
    const g_nominal = parseFloat(globalDiskon?.global_diskon_nominal || 0);
    
    let total_akhir = total_barang * (1 - g_persen / 100);
    total_akhir -= g_nominal;
    if (total_akhir < 0) total_akhir = 0;

    const dis_tambahan_json = JSON.stringify(globalDiskon || {});

    // Ambil hanya bagian tanggal YYYY-MM-DD
    const tanggalOnly = tanggal ? tanggal.split('T')[0] : new Date().toISOString().split('T')[0];

    // 1. Insert Header
    const [resH] = await connection.query(
      "INSERT INTO pembelian (tanggal, user_id, suplier_id, total, dis_tambahan, keterangan, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [tanggalOnly, user_id, suplier_id, total_akhir, dis_tambahan_json, keterangan]
    );
    const pembelian_id = resH.insertId;

    // 2. Insert Details & Update Stok
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const urut = i + 1;
      
      await connection.query(
        "INSERT INTO detail_pembelian (pembelian_id, detail_urut, barang_id, jumlah, dis_1, dis_2, dis_3, dis_4, harga_satuan, subtotal, pembelian_expired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [pembelian_id, urut, item.barang_id, item.jumlah, item.diskon1 || 0, item.diskon2 || 0, item.diskon3 || 0, item.diskon4 || 0, item.harga_satuan, item.subtotal, item.pembelian_expired]
      );

      // Update stok (tambah) dan harga beli
      await connection.query(
        "UPDATE barang SET stok = stok + ?, harga_beli = ? WHERE barang_id = ?",
        [item.jumlah, item.harga_satuan, item.barang_id]
      );
    }

    await connection.commit();
    return pembelian_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Update data pembelian (Transactional)
 */
async function update(db, id, { suplier_id, tanggal, keterangan, items, globalDiskon }) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Kembalikan stok lama (Revert)
    const [oldItems] = await connection.query("SELECT barang_id, jumlah FROM detail_pembelian WHERE pembelian_id = ?", [id]);
    for (const old of oldItems) {
      await connection.query("UPDATE barang SET stok = stok - ? WHERE barang_id = ?", [old.jumlah, old.barang_id]);
    }

    // 2. Hapus detail lama
    await connection.query("DELETE FROM detail_pembelian WHERE pembelian_id = ?", [id]);

    // 3. Hitung total baru
    const total_barang = items.reduce((acc, item) => acc + Number(item.subtotal), 0);
    const g_persen = parseFloat(globalDiskon?.global_diskon_persen || 0);
    const g_nominal = parseFloat(globalDiskon?.global_diskon_nominal || 0);
    let total_akhir = total_barang * (1 - g_persen / 100) - g_nominal;
    if (total_akhir < 0) total_akhir = 0;

    // Ambil hanya bagian tanggal YYYY-MM-DD
    const tanggalOnly = tanggal ? tanggal.split('T')[0] : new Date().toISOString().split('T')[0];

    // 4. Update Header
    await connection.query(
      "UPDATE pembelian SET tanggal=?, suplier_id=?, total=?, dis_tambahan=?, keterangan=? WHERE pembelian_id=?",
      [tanggalOnly, suplier_id, total_akhir, JSON.stringify(globalDiskon || {}), keterangan, id]
    );

    // 5. Insert detail baru & Update stok baru
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await connection.query(
        "INSERT INTO detail_pembelian (pembelian_id, detail_urut, barang_id, jumlah, dis_1, dis_2, dis_3, dis_4, harga_satuan, subtotal, pembelian_expired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, i + 1, item.barang_id, item.jumlah, item.diskon1 || 0, item.diskon2 || 0, item.diskon3 || 0, item.diskon4 || 0, item.harga_satuan, item.subtotal, item.pembelian_expired]
      );
      await connection.query("UPDATE barang SET stok = stok + ?, harga_beli = ? WHERE barang_id = ?", [item.jumlah, item.harga_satuan, item.barang_id]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Hapus data pembelian (Transactional)
 */
async function remove(db, id) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Ambil detail untuk mengurangi stok (Batal beli)
    const [items] = await connection.query("SELECT barang_id, jumlah FROM detail_pembelian WHERE pembelian_id = ?", [id]);
    for (const item of items) {
      await connection.query("UPDATE barang SET stok = stok - ? WHERE barang_id = ?", [item.jumlah, item.barang_id]);
    }

    // 2. Hapus detail dan header
    await connection.query("DELETE FROM detail_pembelian WHERE pembelian_id = ?", [id]);
    const [res] = await connection.query("DELETE FROM pembelian WHERE pembelian_id = ?", [id]);

    await connection.commit();
    return res.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
