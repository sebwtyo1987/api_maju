const barangService = require('../service/barang.service');

async function getBarang(request, reply) {
  const id = request.params.id || request.query.id;
  const { search, page, limit } = request.query;

  if (id) {
    const barang = await barangService.findById(request.server.db, id);
    if (!barang) {
      return { status: 'error', message: 'Barang tidak ditemukan.' };
    }
    return { status: 'success', data: barang };
  }

  if (search) {
    // Untuk pencarian, saat ini kita masih mengembalikan semua hasil (atau Anda bisa mengupdate service search)
    const barangList = await barangService.search(request.server.db, search);
    return { status: 'success', data: barangList };
  }

  // Jika client tidak mengirimkan parameter pagination, kirim semua data menggunakan findAll
  if (!page && !limit) {
    const barangList = await barangService.findAll(request.server.db);
    return { status: 'success', data: barangList };
  }

  // Logika Pagination
  const p = parseInt(page || '1');
  const l = parseInt(limit || '10');
  const offset = (p - 1) * l;

  const totalRows = await barangService.countAll(request.server.db);
  const barangList = await barangService.findAllPag(request.server.db, l, offset);

  return {
    status: 'success',
    data: barangList,
    pagination: {
      page: p,
      limit: l,
      total_rows: totalRows,
      total_pages: Math.ceil(totalRows / l)
    }
  };
}

async function createBarang(request, reply) {
  const { barcode, nama_barang, kategori_id, harga_hna, harga_beli, stok, satuan, gambar } = request.body;

  if (!barcode || !nama_barang || !kategori_id) {
    return { status: 'error', message: 'Barcode, nama barang, dan kategori wajib diisi.' };
  }

  console.log('Received data for new barang:', request.body);
  if (harga_hna < 0 || stok < 0) {
    return { status: 'error', message: 'Harga dan stok tidak boleh negatif.' };
  }

  try {
    const insertId = await barangService.create(request.server.db, request.body);
    return {
      status: 'success',
      message: 'Barang berhasil ditambahkan.',
      data: { barang_id: insertId },
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { status: 'error', message: 'Nama barang sudah digunakan.' };
    }
    request.log.error(error);
    return { status: 'error', message: 'Gagal menambah barang: ' + error.message };
  }
}

async function updateBarang(request, reply) {
  const id = request.params.id || request.query.id;
  const { nama_barang, kategori_id, harga_hna, stok, gambar } = request.body;

  if (!id || !request.body) {
    return { status: 'error', message: 'Data tidak lengkap untuk update.' };
  }

  if (harga_hna < 0 || stok < 0) {
    return { status: 'error', message: 'Harga dan stok tidak boleh negatif.' };
  }

  try {
    const result = await barangService.update(request.server.db, id, request.body);
    if (result.affectedRows > 0) {
      return { status: 'success', message: 'Barang berhasil diperbarui.' };
    } else {
      return { status: 'info', message: 'Tidak ada perubahan data atau barang tidak ditemukan.' };
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { status: 'error', message: 'Nama barang sudah digunakan.' };
    }
    request.log.error(error);
    return { status: 'error', message: 'Gagal memperbarui barang: ' + error.message };
  }
}

async function deleteBarang(request, reply) {
  const id = request.params.id || request.query.id;

  if (!id) {
    return { status: 'error', message: 'ID barang tidak valid.' };
  }

  const affectedRows = await barangService.remove(request.server.db, id);
  if (affectedRows > 0) {
    return { status: 'success', message: 'Barang berhasil dihapus.' };
  } else {
    return { status: 'error', message: 'Barang tidak ditemukan atau sudah dihapus.' };
  }
}

module.exports = {
  getBarang,
  createBarang,
  updateBarang,
  deleteBarang,
};
