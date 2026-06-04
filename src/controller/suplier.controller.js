const suplierService = require('../service/suplier.service');

async function getSuplier(request, reply) {
  const { id } = request.params;
  const search = request.query.search || '';
  const page = parseInt(request.query.page || '1');
  const limit = parseInt(request.query.limit || '10');
  const offset = (page - 1) * limit;

  if (id) {
    const data = await suplierService.findById(request.server.db, id);
    if (!data) {
      return reply.code(404).send({ status: 'error', message: 'Suplier tidak ditemukan.' });
    }
    return { status: 'success', data: data };
  } else {
    const totalRows = await suplierService.countAll(request.server.db, search);
    const data = await suplierService.findAll(request.server.db, search, limit, offset);

    return {
      status: 'success',
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total_rows: totalRows,
        total_pages: Math.ceil(totalRows / limit)
      }
    };
  }
}

async function createSuplier(request, reply) {
  const { nama_suplier } = request.body || {};

  if (!nama_suplier) {
    return { status: 'error', message: 'Nama suplier wajib diisi.' };
  }

  try {
    const insertId = await suplierService.create(request.server.db, request.body);
    return reply.code(201).send({ 
      status: 'success', 
      message: 'Suplier berhasil ditambahkan.', 
      id: insertId 
    });
  } catch (error) {
    return { status: 'error', message: 'Gagal menambah suplier: ' + error.message };
  }
}

async function updateSuplier(request, reply) {
  const { id } = request.params;
  const { kode_suplier, nama_suplier, alamat, telepon, email } = request.body || {};

  if (!id || !request.body) {
    return { status: 'error', message: 'ID atau data tidak valid.' };
  }

  try {
    const input = {
      kode_suplier: kode_suplier || '',
      nama_suplier: nama_suplier || '',
      alamat: alamat || '',
      telepon: telepon || '',
      email: email || ''
    };
    const affectedRows = await suplierService.update(request.server.db, id, input);
    if (affectedRows > 0) {
      return { status: 'success', message: 'Suplier berhasil diperbarui.' };
    } else {
      return { status: 'info', message: 'Tidak ada perubahan data atau suplier tidak ditemukan.' };
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal memperbarui suplier: ' + error.message };
  }
}

async function deleteSuplier(request, reply) {
  const { id } = request.params;

  if (!id) {
    return { status: 'error', message: 'ID tidak valid.' };
  }

  try {
    const affectedRows = await suplierService.remove(request.server.db, id);
    if (affectedRows > 0) {
      return { status: 'success', message: 'Suplier berhasil dinonaktifkan.' };
    } else {
      return { status: 'error', message: 'Suplier tidak ditemukan atau sudah nonaktif.' };
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal menghapus suplier: ' + error.message };
  }
}

module.exports = { getSuplier, createSuplier, updateSuplier, deleteSuplier };
