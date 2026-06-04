function castHeaderRow(row) {
  if (!row) return null;

  const tanggal = (() => {
    if (!row.tanggal) return null;
    const d = new Date(row.tanggal);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  })();

  const createdAt = (() => {
    if (!row.created_at) return null;
    const d = new Date(row.created_at);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  })();

  return {
    ...row,
    penjualan_id: Number(row.penjualan_id),
    user_id: Number(row.user_id),
    pelanggan_id: row.pelanggan_id === null ? null : Number(row.pelanggan_id),
    tanggal,
    created_at: createdAt,
    total: parseFloat(row.total || 0),
  };
}

function castDetailRow(row) {
  return {
    ...row,
    detail_penjualan_id: row.detail_penjualan_id === undefined ? row.detail_penjualan_id : Number(row.detail_penjualan_id),
    penjualan_id: Number(row.penjualan_id),
    detail_urut: Number(row.detail_urut || 0),
    barang_id: Number(row.barang_id),
    jumlah: Number(row.jumlah),
    harga_satuan: parseFloat(row.harga_satuan || 0),
    subtotal: parseFloat(row.subtotal || 0),
  };
}

async function calculateSaleTotals(conn, penjualanId) {
  const [subtotalRows] = await conn.query(
    'SELECT SUM(subtotal) AS total_detail_subtotal FROM detail_penjualan WHERE penjualan_id = ?',
    [penjualanId]
  );

  const subtotal = parseFloat(subtotalRows[0]?.total_detail_subtotal || 0);

  await conn.query(
    'UPDATE penjualan SET total = ? WHERE penjualan_id = ?',
    [subtotal, penjualanId]
  );

  return {
    subtotal,
    total: subtotal,
  };
}

function buildListFilters({ role, userId, search }) {
  const clauses = [];
  const params = [];

  if (role === 'kasir' && userId > 0) {
    clauses.push('p.user_id = ?');
    params.push(userId);
  }

  if (search) {
    const like = `%${search}%`;
    clauses.push('(u.nama LIKE ? OR pl.nama_pelanggan LIKE ? OR CAST(p.penjualan_id AS CHAR) LIKE ?)');
    params.push(like, like, like);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

async function findById(db, id) {
  const [rows] = await db.query(
    `SELECT p.*, u.nama AS user_nama, pl.nama_pelanggan, pl.alamat, pl.no_telepon
     FROM penjualan p
     JOIN users u ON p.user_id = u.user_id
     LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.pelanggan_id
     WHERE p.penjualan_id = ?`,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  const transaksi = castHeaderRow(rows[0]);
  const [detailRows] = await db.query(
    `SELECT dp.*, b.nama_barang, b.satuan
     FROM detail_penjualan dp
     JOIN barang b ON dp.barang_id = b.barang_id
     WHERE dp.penjualan_id = ?
     ORDER BY dp.detail_urut ASC`,
    [id]
  );

  transaksi.details = detailRows.map(castDetailRow);
  return transaksi;
}

/**
 * Mengambil data lengkap untuk cetak nota
 * Termasuk join ke tabel users dan pelanggan
 */
async function getPrintData(db, id) {
  return findById(db, id);
}

async function findAll(db, options = {}) {
  const page = Number(options.page || 0);
  const limit = Number(options.limit || 0);
  const role = String(options.role || '');
  const userId = Number(options.user_id || 0);
  const search = String(options.search || '').trim();
  const { whereSql, params } = buildListFilters({ role, userId, search });

  if (limit > 0) {
    const currentPage = page > 0 ? page : 1;
    const offset = (currentPage - 1) * limit;

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM penjualan p
       JOIN users u ON p.user_id = u.user_id
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.pelanggan_id
       ${whereSql}`,
      params
    );

    const [rows] = await db.query(
      `SELECT p.*, u.nama AS user_nama, pl.nama_pelanggan, pl.alamat, pl.no_telepon
       FROM penjualan p
       JOIN users u ON p.user_id = u.user_id
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.pelanggan_id
       ${whereSql}
       ORDER BY p.tanggal DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalRows = Number(countRows[0]?.total || 0);

    return {
      data: rows.map(castHeaderRow),
      pagination: {
        page: currentPage,
        limit,
        total_rows: totalRows,
        total_pages: limit > 0 ? Math.ceil(totalRows / limit) : 0,
      },
    };
  }

  const [rows] = await db.query(
    `SELECT p.*, u.nama AS user_nama, pl.nama_pelanggan, pl.alamat, pl.no_telepon
     FROM penjualan p
     JOIN users u ON p.user_id = u.user_id
     LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.pelanggan_id
     ${whereSql}
     ORDER BY p.tanggal DESC`,
    params
  );

  return {
    data: rows.map(castHeaderRow),
  };
}

function normalizePayload(data = {}) {
  return {
    user_id: Number(data.user_id || 1),
    pelanggan_id: data.pelanggan_id === '' || data.pelanggan_id === undefined ? null : Number(data.pelanggan_id),
    items: Array.isArray(data.items) ? data.items : [],
  };
}

async function insertDetailsAndAdjustStock(conn, penjualanId, items) {
  for (const item of items) {
    const detailUrut = Number(item.detail_urut || 0);
    const barangId = Number(item.barang_id);
    const jumlah = Number(item.jumlah);
    const hargaSatuan = parseFloat(item.harga_satuan || 0);
    const subtotal = jumlah * hargaSatuan;

    if (!barangId) {
      throw new Error('barang_id wajib diisi.');
    }

    if (jumlah <= 0) {
      throw new Error('Jumlah barang harus lebih dari 0.');
    }

    const [stockRows] = await conn.query(
      'SELECT stok FROM barang WHERE barang_id = ? FOR UPDATE',
      [barangId]
    );

    if (!stockRows.length) {
      throw new Error(`Barang ID ${barangId} tidak ditemukan.`);
    }

    const currentStock = Number(stockRows[0].stok || 0);
    if (currentStock < jumlah) {
      throw new Error(`Stok barang ${barangId} tidak mencukupi. Tersedia: ${currentStock}`);
    }

    await conn.query(
      `INSERT INTO detail_penjualan
       (penjualan_id, detail_urut, barang_id, jumlah, harga_satuan)
       VALUES (?, ?, ?, ?, ?)`,
      [penjualanId, detailUrut, barangId, jumlah, hargaSatuan]
    );

    await conn.query(
      'UPDATE barang SET stok = stok - ? WHERE barang_id = ?',
      [jumlah, barangId]
    );
  }
}

async function create(db, payload) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const { user_id, pelanggan_id, items } = normalizePayload(payload);
    if (!items.length) {
      throw new Error('Detail penjualan tidak boleh kosong.');
    }

    const [headerResult] = await conn.query(
      'INSERT INTO penjualan (user_id, pelanggan_id) VALUES (?, ?)',
      [user_id, pelanggan_id]
    );

    const penjualanId = headerResult.insertId;
    await insertDetailsAndAdjustStock(conn, penjualanId, items);
    await calculateSaleTotals(conn, penjualanId);

    await conn.commit();
    return penjualanId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function update(db, penjualanId, payload) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const { user_id, pelanggan_id, items } = normalizePayload(payload);
    if (!items.length) {
      throw new Error('Detail penjualan tidak boleh kosong.');
    }

    const [existingRows] = await conn.query(
      'SELECT penjualan_id FROM penjualan WHERE penjualan_id = ? FOR UPDATE',
      [penjualanId]
    );

    if (!existingRows.length) {
      throw new Error('Penjualan tidak ditemukan.');
    }

    const [oldDetailRows] = await conn.query(
      'SELECT barang_id, jumlah FROM detail_penjualan WHERE penjualan_id = ?',
      [penjualanId]
    );

    for (const oldItem of oldDetailRows) {
      await conn.query(
        'UPDATE barang SET stok = stok + ? WHERE barang_id = ?',
        [Number(oldItem.jumlah), Number(oldItem.barang_id)]
      );
    }

    await conn.query('DELETE FROM detail_penjualan WHERE penjualan_id = ?', [penjualanId]);
    await conn.query(
      'UPDATE penjualan SET user_id = ?, pelanggan_id = ? WHERE penjualan_id = ?',
      [user_id, pelanggan_id, penjualanId]
    );

    await insertDetailsAndAdjustStock(conn, penjualanId, items);
    await calculateSaleTotals(conn, penjualanId);

    await conn.commit();
    return { affectedRows: 1 };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function remove(db, penjualanId) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      'SELECT penjualan_id FROM penjualan WHERE penjualan_id = ? FOR UPDATE',
      [penjualanId]
    );

    if (!existingRows.length) {
      await conn.rollback();
      return 0;
    }

    const [detailRows] = await conn.query(
      'SELECT barang_id, jumlah FROM detail_penjualan WHERE penjualan_id = ?',
      [penjualanId]
    );

    for (const item of detailRows) {
      await conn.query(
        'UPDATE barang SET stok = stok + ? WHERE barang_id = ?',
        [Number(item.jumlah), Number(item.barang_id)]
      );
    }

    await conn.query('DELETE FROM detail_penjualan WHERE penjualan_id = ?', [penjualanId]);
    const [result] = await conn.query('DELETE FROM penjualan WHERE penjualan_id = ?', [penjualanId]);

    await conn.commit();
    return result.affectedRows;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getPrintData,
};
