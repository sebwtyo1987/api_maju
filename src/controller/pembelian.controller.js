const pembelianService = require('../service/pembelian.service');

async function getAllPembelian(request, reply) {
  const data = await pembelianService.findAll(this.db);
  return { status: 'success', data };
}

async function getPembelianById(request, reply) {
  const { id } = request.params;
  const data = await pembelianService.findById(this.db, id);
  if (!data) {
    return reply.status(404).send({ status: 'error', message: 'Pembelian tidak ditemukan' });
  }
  return { status: 'success', data };
}

async function createPembelian(request, reply) {
  const { suplier_id, items } = request.body;

  if (!suplier_id) {
    return reply.status(400).send({ status: 'error', message: 'Suplier wajib dipilih.' });
  }
  if (!items || items.length === 0) {
    return reply.status(400).send({ status: 'error', message: 'Item pembelian kosong' });
  }

  // Validasi expired seperti di PHP
  for (const item of items) {
    if (!item.pembelian_expired) {
      return reply.status(400).send({ status: 'error', message: 'Tanggal expired wajib diisi untuk semua barang.' });
    }
  }

  try {
    const id = await pembelianService.create(this.db, request.body);
    return reply.status(201).send({ status: 'success', message: 'Pembelian berhasil disimpan', id });
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

async function updatePembelian(request, reply) {
  const { id } = request.params;
  const { suplier_id, items } = request.body;

  if (!suplier_id || !items || items.length === 0) {
    return reply.status(400).send({ status: 'error', message: 'Data tidak valid' });
  }

  for (const item of items) {
    if (!item.pembelian_expired) {
      return reply.status(400).send({ status: 'error', message: 'Tanggal expired wajib diisi untuk semua barang.' });
    }
  }

  try {
    await pembelianService.update(this.db, id, request.body);
    return { status: 'success', message: 'Pembelian berhasil diperbarui' };
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

async function deletePembelian(request, reply) {
  const { id } = request.params;
  try {
    const affected = await pembelianService.remove(this.db, id);
    if (affected === 0) {
      return reply.status(404).send({ status: 'error', message: 'ID tidak valid' });
    }
    return { status: 'success', message: 'Pembelian berhasil dihapus' };
  } catch (error) {
    return reply.status(500).send({ status: 'error', message: error.message });
  }
}

module.exports = {
  getAllPembelian,
  getPembelianById,
  createPembelian,
  updatePembelian,
  deletePembelian
};
