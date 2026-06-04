/**
 * Tagihan Controller
 */
const tagihanService = require('../service/tagihan.service');

const getTagihan = async (request, reply) => {
  try {
    const { id } = request.params;
    const search = request.query.search || '';
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');
    const offset = (page - 1) * limit;
    const db = request.server.db;

    if (id) {
      const data = await tagihanService.findById(db, id);
      if (!data) return reply.code(404).send({ status: 'error', message: 'Tagihan tidak ditemukan' });
      const details = await tagihanService.findDetails(db, id);
      return { status: 'success', data: { ...data, details } };
    }

    const totalRows = await tagihanService.countAll(db, search);
    const data = await tagihanService.findAll(db, search, limit, offset);
    
    return {
      status: 'success',
      data: data,
      pagination: {
        page,
        limit,
        total_rows: totalRows,
        total_pages: Math.ceil(totalRows / limit)
      }
    };
  } catch (err) {
    return reply.code(500).send({ status: 'error', message: err.message });
  }
};

const createTagihan = async (request, reply) => {
  try {
    const input = {
      tagihan_tanggal: request.body.tagihan_tanggal,
      tagihan_nama: request.body.tagihan_nama,
      tagihan_jumlah: request.body.tagihan_jumlah,
      tagihan_total: request.body.tagihan_total,
      tagihan_setor: request.body.tagihan_setor
    };

    const existingId = request.body.tagihan_id;
    const insertId = await tagihanService.create(request.server.db, input, existingId);
    const message = existingId ? 'Tagihan berhasil diperbarui (re-create)' : 'Tagihan berhasil dibuat';

    return reply.code(201).send({ status: 'success', message, id: insertId });
  } catch (err) {
    return reply.code(500).send({ status: 'error', message: err.message });
  }
};

const updateTagihan = async (request, reply) => {
  try {
    const { id } = request.params;
    const { 
      tagihan_tanggal, 
      tagihan_nama, 
      tagihan_jumlah, 
      tagihan_total, 
      tagihan_setor,
      details
    } = request.body;

    const affectedRows = await tagihanService.updateWithDetails(request.server.db, id, {
      tagihan_tanggal,
      tagihan_nama,
      tagihan_jumlah,
      tagihan_total,
      tagihan_setor,
      details
    });
    
    if (affectedRows > 0) {
      return { status: 'success', message: 'Tagihan berhasil diperbarui' };
    }
    return reply.code(404).send({ status: 'error', message: 'Tagihan tidak ditemukan' });
  } catch (err) {
    return reply.code(500).send({ status: 'error', message: err.message });
  }
};

const deleteTagihan = async (request, reply) => {
  try {
    const { id } = request.params;
    const affectedRows = await tagihanService.remove(request.server.db, id);
    if (affectedRows > 0) {
      return { status: 'success', message: 'Tagihan berhasil dihapus' };
    }
    return reply.code(404).send({ status: 'error', message: 'Tagihan tidak ditemukan' });
  } catch (err) {
    return reply.code(500).send({ status: 'error', message: err.message });
  }
};

module.exports = {
  getTagihan,
  createTagihan,
  updateTagihan,
  deleteTagihan
};
