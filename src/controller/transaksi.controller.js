const transaksiService = require('../service/transaksi.service');

async function getTransaksi(request, reply) {
  const id = request.params.id || request.query.id;

  try {
    if (id) {
      const transaksi = await transaksiService.findById(request.server.db, id);
      if (!transaksi) {
        return { status: 'error', message: 'Penjualan tidak ditemukan.' };
      }

      return { status: 'success', data: transaksi };
    }

    const result = await transaksiService.findAll(request.server.db, request.query || {});
    return {
      status: 'success',
      ...result,
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      status: 'error',
      message: 'Gagal memuat data transaksi: ' + error.message,
    });
  }
}

async function printTransaksi(request, reply) {
  const { id } = request.params;

  try {
    const data = await transaksiService.getPrintData(request.server.db, id);
    if (!data) {
      return reply.code(404).send({
        status: 'error',
        message: 'Transaksi tidak ditemukan.',
      });
    }

    return { status: 'success', data };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      status: 'error',
      message: 'Gagal memuat data cetak transaksi: ' + error.message,
    });
  }
}

async function createTransaksi(request, reply) {
  try {
    const penjualanId = await transaksiService.create(request.server.db, request.body || {});
    return {
      status: 'success',
      message: 'Penjualan berhasil ditambahkan.',
      penjualan_id: penjualanId,
    };
  } catch (error) {
    request.log.error(error);
    return {
      status: 'error',
      message: 'Gagal menambah penjualan: ' + error.message,
    };
  }
}

async function updateTransaksi(request, reply) {
  const id = request.params.id || request.query.id;
  if (!id) {
    return { status: 'error', message: 'ID penjualan tidak ditemukan.' };
  }

  try {
    await transaksiService.update(request.server.db, Number(id), request.body || {});
    return {
      status: 'success',
      message: 'Penjualan berhasil diperbarui.',
      penjualan_id: Number(id),
    };
  } catch (error) {
    request.log.error(error);
    return {
      status: 'error',
      message: 'Gagal memperbarui penjualan: ' + error.message,
    };
  }
}

async function deleteTransaksi(request, reply) {
  const id = request.params.id || request.query.id;
  if (!id) {
    return { status: 'error', message: 'ID penjualan tidak ditemukan.' };
  }

  try {
    const affectedRows = await transaksiService.remove(request.server.db, Number(id));
    if (affectedRows > 0) {
      return { status: 'success', message: 'Penjualan berhasil dihapus.' };
    }

    return { status: 'error', message: 'Penjualan tidak ditemukan.' };
  } catch (error) {
    request.log.error(error);
    return {
      status: 'error',
      message: 'Gagal menghapus penjualan: ' + error.message,
    };
  }
}

module.exports = {
  getTransaksi,
  createTransaksi,
  updateTransaksi,
  deleteTransaksi,
  printTransaksi,
};
