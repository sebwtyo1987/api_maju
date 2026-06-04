const kategoriService = require('../service/kategori.service');

function toUpperCaseStrings(obj) {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (typeof newObj[key] === 'string') {
      newObj[key] = newObj[key].toUpperCase();
    }
  }
  return newObj;
}

async function getKategori(request, reply) {
  const id = request.params.id || request.query.id;
  const { search } = request.query;

  if (id) {
    const data = await kategoriService.findById(request.server.db, id);
    if (!data) {
      return { status: 'error', message: 'Kategori tidak ditemukan.' };
    }
    return { status: 'success', data: [data] };
  }

  if (search) {
    const data = await kategoriService.search(request.server.db, search);
    return { status: 'success', data };
  }

  const data = await kategoriService.findAll(request.server.db);
  return { status: 'success', data };
}

async function createKategori(request, reply) {
  const input = toUpperCaseStrings(request.body);

  if (!input.nama_kategori) {
    return { status: 'error', message: 'Nama kategori wajib diisi.' };
  }

  try {
    await kategoriService.create(request.server.db, input);
    return { status: 'success', message: 'Kategori berhasil ditambahkan.' };
  } catch (error) {
    return { status: 'error', message: 'Gagal menambah kategori: ' + error.message };
  }
}

async function updateKategori(request, reply) {
  const id = request.params.id || request.query.id;
  const input = toUpperCaseStrings(request.body);

  if (!id || !request.body) {
    return { status: 'error', message: 'Data tidak lengkap untuk update.' };
  }

  try {
    await kategoriService.update(request.server.db, id, input);
    return { status: 'success', message: 'Kategori berhasil diperbarui.' };
  } catch (error) {
    return { status: 'error', message: 'Gagal memperbarui kategori: ' + error.message };
  }
}

async function deleteKategori(request, reply) {
  const id = request.params.id || request.query.id;

  if (!id) {
    return { status: 'error', message: 'ID kategori tidak valid.' };
  }

  try {
    const affectedRows = await kategoriService.remove(request.server.db, id);
    if (affectedRows > 0) {
      return { status: 'success', message: 'Kategori berhasil dihapus.' };
    } else {
      return { status: 'error', message: 'Kategori tidak ditemukan atau sudah dihapus.' };
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal menghapus kategori: ' + error.message };
  }
}

module.exports = { getKategori, createKategori, updateKategori, deleteKategori };
