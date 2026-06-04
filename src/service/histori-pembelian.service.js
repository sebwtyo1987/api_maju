async function cariBerdasarkanSuplier(db, id_suplier) {
  const [rows] = await db.query(
    'SELECT id_histori, id_suplier, id_barang, harga_satuan, tanggal FROM histori_pembelian WHERE id_suplier = ? ORDER BY tanggal DESC',
    [id_suplier]
  );
  return rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : null
  }));
}

async function cariHargaTerakhir(db, id_suplier, id_barang) {
  const [rows] = await db.query(
    'SELECT harga_satuan FROM histori_pembelian WHERE id_suplier = ? AND id_barang = ? ORDER BY tanggal DESC LIMIT 1',
    [id_suplier, id_barang]
  );
  return rows[0] || null;
}

async function simpanItem(db, id_suplier, items) {
  for (const item of items) {
    const id_barang = parseInt(item.barang_id);
    const harga_baru = parseFloat(item.harga_satuan);

    // 1. Cek histori terakhir untuk suplier & barang ini
    const [cek] = await db.query(
      'SELECT id_histori, harga_satuan FROM histori_pembelian WHERE id_suplier = ? AND id_barang = ? ORDER BY tanggal DESC LIMIT 1',
      [id_suplier, id_barang]
    );

    if (!cek || cek.length === 0) {
      // INSERT histori pertama kali
      await db.query(
        'INSERT INTO histori_pembelian (id_suplier, id_barang, harga_satuan, tanggal) VALUES (?, ?, ?, NOW())',
        [id_suplier, id_barang, harga_baru]
      );
    } else {
      const { id_histori, harga_satuan: harga_lama } = cek[0];

      if (parseFloat(harga_lama) !== harga_baru) {
        // UPDATE histori jika harga berubah
        await db.query(
          'UPDATE histori_pembelian SET harga_satuan = ?, tanggal = NOW() WHERE id_histori = ?',
          [harga_baru, id_histori]
        );
      }
    }
  }
  return true;
}

async function ambilDaftarDefault(db) {
  const [rows] = await db.query(
    'SELECT id_histori, id_suplier, id_barang, harga_satuan, tanggal FROM histori_pembelian ORDER BY tanggal DESC LIMIT 100'
  );
  return rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : null
  }));
}

async function perbarui(db, id_histori, data) {
  const { id_suplier, id_barang, harga_satuan } = data;
  const [result] = await db.query(
    'UPDATE histori_pembelian SET id_suplier = ?, id_barang = ?, harga_satuan = ? WHERE id_histori = ?',
    [id_suplier, id_barang, harga_satuan, id_histori]
  );
  return result.affectedRows;
}

async function hapusBerdasarkanBarang(db, id_barang) {
  const [result] = await db.query(
    'DELETE FROM histori_pembelian WHERE id_barang = ?',
    [id_barang]
  );
  return result.affectedRows;
}

module.exports = {
  cariBerdasarkanSuplier,
  cariHargaTerakhir,
  simpanItem,
  ambilDaftarDefault,
  perbarui,
  hapusBerdasarkanBarang
};
