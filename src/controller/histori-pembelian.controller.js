const historiPembelianService = require('../service/histori-pembelian.service');

async function ambilDaftar(request, reply) {
  const data = await historiPembelianService.ambilDaftarDefault(request.server.db);
  return { status: 'success', data };
}

async function cariSuplier(request, reply) {
  const { id_suplier } = request.query;
  if (!id_suplier) {
    return reply.status(400).send({ status: 'error', message: 'id_suplier wajib' });
  }
  const data = await historiPembelianService.cariBerdasarkanSuplier(request.server.db, id_suplier);
  return {
    status: 'success',
    jumlah_data: data.length,
    data
  };
}

async function ambilHargaTerakhir(request, reply) {
  const { id_suplier, id_barang } = request.body || {};
  
  if (!id_suplier || !id_barang) {
    return reply.status(400).send({ status: 'error', message: 'id_suplier dan id_barang wajib diisi' });
  }

  const result = await historiPembelianService.cariHargaTerakhir(request.server.db, id_suplier, id_barang);
  if (result) {
    return { status: 'ada', harga: result.harga_satuan };
  }
  return { status: 'tidak_ada' };
}

async function simpanHistori(request, reply) {
  const { suplier_id, items } = request.body || {};
  if (!suplier_id || !items || items.length === 0) {
    return reply.status(400).send({ status: 'error', message: 'Data tidak lengkap' });
  }
  try {
    await historiPembelianService.simpanItem(request.server.db, suplier_id, items);
    return { status: 'success', message: 'Histori pembelian berhasil disimpan' };
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

async function ubahHistori(request, reply) {
  const { id_histori, id_suplier, id_barang, harga_satuan } = request.body || {};
  if (!id_histori) {
    return reply.status(400).send({ status: 'error', message: 'id_histori wajib' });
  }
  try {
    await historiPembelianService.perbarui(request.server.db, id_histori, { id_suplier, id_barang, harga_satuan });
    return { status: 'success', message: 'Histori berhasil diperbarui' };
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

async function hapusHistori(request, reply) {
  const { id_barang } = request.body || {};
  if (!id_barang) {
    return reply.status(400).send({ status: 'error', message: 'id_barang wajib' });
  }
  try {
    await historiPembelianService.hapusBerdasarkanBarang(request.server.db, id_barang);
    return { status: 'success', message: 'Histori berhasil dihapus' };
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

module.exports = {
  ambilDaftar,
  cariSuplier,
  ambilHargaTerakhir,
  simpanHistori,
  ubahHistori,
  hapusHistori
};
