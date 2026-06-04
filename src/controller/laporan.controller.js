const reportsService = require('../service/laporan.service');

async function getPembelianReport(request, reply) {
  try {
    const summary = await reportsService.getPembelianSummary(request.server.db);
    const topProducts = await reportsService.getTopProductsRestock(request.server.db);

    return {
      status: "success",
      pembelian_summary: {
        total: {
          harian: parseFloat(summary.harian || 0),
          bulanan: parseFloat(summary.bulanan || 0),
          tahunan: parseFloat(summary.tahunan || 0)
        }
      },
      top_products_restock: topProducts.map(row => ({
        nama_barang: row.nama_barang,
        total_qty: Number(row.total_qty),
        total_biaya: parseFloat(row.total_biaya),
        satuan: row.satuan
      })),
      info: {
        tanggal_server: new Date().toISOString().split('T')[0]
      }
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ status: "error", message: "Gagal memuat laporan pembelian" });
  }
}

async function getPenjualanReport(request, reply) {
  try {
    const db = request.server.db;

    const [summary, stokKritis, terlaris, topPelanggan] = await Promise.all([
      reportsService.getPenjualanSummary(db),
      reportsService.getStokKritis(db),
      reportsService.getProdukTerlaris(db),
      reportsService.getTopPelanggan(db)
    ]);

    return {
      status: "success",
      penjualan: {
        data: {
          harian: parseFloat(summary.harian || 0),
          bulanan: parseFloat(summary.bulanan || 0),
          tahunan: parseFloat(summary.tahunan || 0)
        }
      },
      stok_kritis: stokKritis,
      produk_terlaris: terlaris.map(row => ({ ...row, total_terjual: Number(row.total_terjual) })),
      top_pelanggan: topPelanggan.map(row => ({ ...row, kontribusi: parseFloat(row.kontribusi) })),
      info: {
        tanggal_server: new Date().toISOString().split('T')[0]
      }
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ status: "error", message: "Gagal memuat laporan penjualan" });
  }
}

module.exports = { getPembelianReport, getPenjualanReport };
