const historiService = require('../service/histori.service');

async function tampilSemuaHistori(request, reply) {
  const data = await historiService.tampilSemua(request.server.db);
  return {
    status: 'success',
    jumlah_data: data.length,
    data
  };
}

async function cariPelanggan(request, reply) {
  const { id_pelanggan } = request.query;
  if (!id_pelanggan) {
    return { status: 'error', message: 'id_pelanggan wajib' };
  }
  const data = await historiService.cariBerdasarkanPelanggan(request.server.db, id_pelanggan);
  return {
    status: 'success',
    jumlah_data: data.length,
    data
  };
}

async function ambilHargaTerakhir(request, reply) {
  const { id_pelanggan, id_barang } = request.body || {};

  if (!id_pelanggan || !id_barang) {
    return reply.status(400).send({ status: 'error', message: 'id_pelanggan dan id_barang wajib diisi' });
  }

  console.log('ambilHargaTerakhir pelanggan:', { id_pelanggan, id_barang });
  const result = await historiService.cariHargaTerakhir(request.server.db, id_pelanggan, id_barang);
  if (result) {
    return { status: 'ada', harga: result.harga_satuan };
  }
  return { status: 'tidak_ada' };
}

async function simpanHistori(request, reply) {
  const { pelanggan_id, items } = request.body || {};
  if (!pelanggan_id || !items) {
    return { status: 'error', message: 'JSON tidak valid' };
  }
  try {
    await historiService.simpanItem(request.server.db, pelanggan_id, items);
    return { status: 'success', message: 'Histori disimpan' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function ubahHistori(request, reply) {
  const { id_histori, id_pelanggan, id_barang, harga_satuan } = request.body || {};
  if (!id_histori) {
    return { status: 'error', message: 'id_histori wajib' };
  }
  try {
    await historiService.perbarui(request.server.db, id_histori, { id_pelanggan, id_barang, harga_satuan });
    return { status: 'success', message: 'Histori berhasil diperbarui' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function hapusHistori(request, reply) {
  const id_barang = request.body?.id_barang || request.query?.barang_id;
  if (!id_barang) {
    return { status: 'error', message: 'id_barang wajib' };
  }

  try {
    const affectedRows = await historiService.hapusBerdasarkanBarang(request.server.db, id_barang);

    // Menyesuaikan pesan berdasarkan cara pemanggilan (delete vs hapus_barang di PHP)
    const isResetAction = !!request.query?.barang_id;
    const message = isResetAction
      ? "Histori harga barang berhasil direset"
      : "Histori berhasil dihapus";

    if (affectedRows > 0) {
      return { status: 'success', message };
    } else {
      return { status: 'error', message: 'Histori tidak ditemukan' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

module.exports = {
  tampilSemuaHistori,
  cariPelanggan,
  ambilHargaTerakhir,
  simpanHistori,
  ubahHistori,
  hapusHistori
};
