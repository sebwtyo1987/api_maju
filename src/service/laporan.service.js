async function getPembelianSummary(db) {
  await db.query("SET time_zone = '+07:00'");
  const [rows] = await db.query(`
    SELECT 
      SUM(CASE WHEN DATE(tanggal) = CURDATE() THEN total ELSE 0 END) as harian,
      SUM(CASE WHEN MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE()) THEN total ELSE 0 END) as bulanan,
      SUM(total) as tahunan
    FROM pembelian 
    WHERE YEAR(tanggal) = YEAR(CURDATE())
  `);
  return rows[0];
}

async function getTopProductsRestock(db) {
  const [rows] = await db.query(`
    SELECT 
      b.nama_barang, 
      SUM(dp.jumlah) as total_qty, 
      SUM(dp.subtotal) as total_biaya,
      b.satuan
    FROM detail_pembelian dp 
    JOIN barang b ON dp.barang_id = b.barang_id 
    GROUP BY dp.barang_id 
    ORDER BY total_qty DESC 
    LIMIT 10
  `);
  return rows;
}

async function getPenjualanSummary(db) {
  await db.query("SET time_zone = '+07:00'");
  const [rows] = await db.query(`
    SELECT 
      SUM(CASE WHEN DATE(tanggal) = CURDATE() THEN total ELSE 0 END) as harian,
      SUM(CASE WHEN MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE()) THEN total ELSE 0 END) as bulanan,
      SUM(total) as tahunan
    FROM penjualan 
    WHERE YEAR(tanggal) = YEAR(CURDATE())
  `);
  return rows[0];
}

async function getStokKritis(db) {
  const [rows] = await db.query(`
    SELECT nama_barang, stok, satuan 
    FROM barang 
    WHERE stok <= 5 AND aktif = 1 
    ORDER BY stok ASC 
    LIMIT 10
  `);
  return rows;
}

async function getProdukTerlaris(db) {
  const [rows] = await db.query(`
    SELECT b.nama_barang, SUM(dp.jumlah) as total_terjual 
    FROM detail_penjualan dp 
    JOIN barang b ON dp.barang_id = b.barang_id 
    GROUP BY dp.barang_id 
    ORDER BY total_terjual DESC 
    LIMIT 5
  `);
  return rows;
}

async function getTopPelanggan(db) {
  const [rows] = await db.query(`
    SELECT pl.nama_pelanggan, SUM(p.total) as kontribusi 
    FROM penjualan p
    JOIN pelanggan pl ON p.pelanggan_id = pl.pelanggan_id
    GROUP BY p.pelanggan_id
    ORDER BY kontribusi DESC
    LIMIT 5
  `);
  return rows;
}

module.exports = { 
  getPembelianSummary, 
  getTopProductsRestock,
  getPenjualanSummary,
  getStokKritis,
  getProdukTerlaris,
  getTopPelanggan
};
