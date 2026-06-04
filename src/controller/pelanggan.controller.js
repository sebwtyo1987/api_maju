const pelangganService = require('../service/pelanggan.service');

async function getPelanggan(request, reply) {
  const id = request.params.id || request.query.id;
  const { search } = request.query;

  if (id) {
    const data = await pelangganService.findById(request.server.db, id);
    if (!data) {
      return { status: 'error', message: 'Pelanggan tidak ditemukan.' };
    }
    return { status: 'success', data: [data] };
  }

  if (search) {
    const data = await pelangganService.search(request.server.db, search);
    return { status: 'success', data };
  }

  const data = await pelangganService.findAll(request.server.db);
  return { status: 'success', data };
}

async function createPelanggan(request, reply) {
  const { nama_pelanggan, alamat, no_telepon } = request.body || {};

  if (!nama_pelanggan) {
    return { status: 'error', message: 'Nama pelanggan wajib diisi.' };
  }

  try {
    const input = {
      nama_pelanggan: nama_pelanggan.toUpperCase(),
      alamat: alamat || '',
      no_telepon: no_telepon || ''
    };
    await pelangganService.create(request.server.db, input);
    return { status: 'success', message: 'Pelanggan berhasil ditambahkan.' };
  } catch (error) {
    return { status: 'error', message: 'Gagal menambah pelanggan: ' + error.message };
  }
}

async function updatePelanggan(request, reply) {
  const id = request.params.id || request.query.id;
  const { nama_pelanggan, alamat, no_telepon } = request.body || {};

  if (!id || !request.body) {
    return { status: 'error', message: 'Data tidak lengkap untuk update.' };
  }

  try {
    const input = {
      nama_pelanggan: nama_pelanggan ? nama_pelanggan.toUpperCase() : '',
      alamat: alamat || '',
      no_telepon: no_telepon || ''
    };
    await pelangganService.update(request.server.db, id, input);
    return { status: 'success', message: 'Pelanggan berhasil diperbarui.' };
  } catch (error) {
    return { status: 'error', message: 'Gagal memperbarui pelanggan: ' + error.message };
  }
}

async function deletePelanggan(request, reply) {
  const id = request.params.id || request.query.id;

  if (!id) {
    return { status: 'error', message: 'ID pelanggan tidak valid.' };
  }

  try {
    const affectedRows = await pelangganService.remove(request.server.db, id);
    if (affectedRows > 0) {
      return { status: 'success', message: 'Pelanggan berhasil dihapus.' };
    } else {
      return { status: 'error', message: 'Pelanggan tidak ditemukan atau sudah dihapus.' };
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal menghapus pelanggan: ' + error.message };
  }
}

module.exports = { getPelanggan, createPelanggan, updatePelanggan, deletePelanggan };
