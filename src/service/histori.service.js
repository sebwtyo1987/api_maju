// tampilkan semua histori

async function tampilSemua(db) {
  const [rows] = await db.query('SELECT * FROM histori_penjualan ORDER BY tanggal DESC');
  return rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : null
  }));
}

async function cariBerdasarkanPelanggan(db, id_pelanggan) {
  const [rows] = await db.query(
    'SELECT * FROM histori_penjualan WHERE id_pelanggan = ? ORDER BY tanggal DESC',
    [id_pelanggan]
  );
  return rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : null
  }));
}

async function cariHargaTerakhir(db, id_pelanggan, id_barang) {
  const [rows] = await db.query(
    'SELECT harga_satuan FROM histori_penjualan WHERE id_pelanggan = ? AND id_barang = ? ORDER BY tanggal DESC LIMIT 1',
    [id_pelanggan, id_barang]
  );
  return rows[0] || null;
}

async function simpanItem(db, pelanggan_id, items) {
  // Iterasi item untuk simpan/update histori
  for (const item of items) {
    const { barang_id, harga_satuan } = item;

    // Cek histori terakhir
    const [cek] = await db.query(
      'SELECT id_histori, harga_satuan FROM histori_penjualan WHERE id_pelanggan = ? AND id_barang = ? ORDER BY id_histori DESC LIMIT 1',
      [pelanggan_id, barang_id]
    );

    if (!cek || cek.length === 0) {
      // Insert histori baru jika belum ada
      await db.query(
        'INSERT INTO histori_penjualan (id_pelanggan, id_barang, harga_satuan) VALUES (?, ?, ?)',
        [pelanggan_id, barang_id, harga_satuan]
      );
    } else {
      const { id_histori, harga_satuan: harga_lama } = cek[0];
      // Update hanya jika harga berubah (Sesuai logika PHP)
      if (parseFloat(harga_lama) !== parseFloat(harga_satuan)) {
        await db.query(
          'UPDATE histori_penjualan SET harga_satuan = ?, tanggal = NOW() WHERE id_histori = ?',
          [harga_satuan, id_histori]
        );
      }
    }
  }
}

async function perbarui(db, id_histori, data) {
  const { id_pelanggan, id_barang, harga_satuan } = data;
  const [result] = await db.query(
    'UPDATE histori_penjualan SET id_pelanggan = ?, id_barang = ?, harga_satuan = ? WHERE id_histori = ?',
    [id_pelanggan, id_barang, harga_satuan, id_histori]
  );
  return result.affectedRows;
}

async function hapusBerdasarkanBarang(db, id_barang) {
  const [result] = await db.query(
    'DELETE FROM histori_penjualan WHERE id_barang = ?',
    [id_barang]
  );
  return result.affectedRows;
}

module.exports = {
  tampilSemua,
  cariBerdasarkanPelanggan,
  cariHargaTerakhir,
  simpanItem,
  perbarui,
  hapusBerdasarkanBarang
};
