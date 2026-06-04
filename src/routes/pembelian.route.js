const pembelianController = require('../controller/pembelian.controller');

async function pembelianRoutes(fastify) {
  const pembelianItemSchema = {
    type: 'object',
    properties: {
      barang_id: { type: 'integer', description: 'ID Barang' },
      jumlah: { type: 'integer', description: 'Jumlah barang yang dibeli' },
      harga_satuan: { type: 'number', format: 'float', description: 'Harga beli per satuan' },
      subtotal: { type: 'number', format: 'float', description: 'Subtotal untuk item ini' },
      pembelian_expired: { type: 'string', format: 'date', description: 'Tanggal expired barang', nullable: true },
      diskon1: { type: 'number', format: 'float', default: 0 },
      diskon2: { type: 'number', format: 'float', default: 0 },
      diskon3: { type: 'number', format: 'float', default: 0 },
      diskon4: { type: 'number', format: 'float', default: 0 },
    },
    required: ['barang_id', 'jumlah', 'harga_satuan', 'subtotal']
  };

  const globalDiskonSchema = {
    type: 'object',
    properties: {
      global_diskon_persen: { type: 'number', format: 'float', default: 0 },
      global_diskon_nominal: { type: 'number', format: 'float', default: 0 },
    }
  };

  const pembelianDetailSchema = {
    type: 'object',
    properties: {
      pembelian_id: { type: 'integer' },
      tanggal: { type: 'string', nullable: true },
      user_id: { type: 'integer' },
      user_nama: { type: 'string' },
      suplier_id: { type: 'integer' },
      nama_suplier: { type: 'string' },
      total: { type: 'number', format: 'float' },
      keterangan: { type: 'string' },
      dis_tambahan: { type: 'string' }, // JSON string
      created_at: { type: 'string', nullable: true },
      details: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            detail_pembelian_id: { type: 'integer' },
            pembelian_id: { type: 'integer' },
            detail_urut: { type: 'integer' },
            barang_id: { type: 'integer' },
            nama_barang: { type: 'string' },
            barcode: { type: 'string' },
            jumlah: { type: 'integer' },
            diskon1: { type: 'number', format: 'float' },
            diskon2: { type: 'number', format: 'float' },
            diskon3: { type: 'number', format: 'float' },
            diskon4: { type: 'number', format: 'float' },
            harga_satuan: { type: 'number', format: 'float' },
            subtotal: { type: 'number', format: 'float' },
            pembelian_expired: { type: 'string', nullable: true },
          }
        }
      }
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' }
    }
  };

  // GET: Ambil semua pembelian
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua transaksi pembelian.',
      tags: ['Pembelian'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: pembelianDetailSchema
            }
          }
        },
        500: errorSchema
      }
    }
  }, pembelianController.getAllPembelian);

  // GET: Ambil pembelian berdasarkan ID
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail transaksi pembelian berdasarkan ID.',
      tags: ['Pembelian'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pembelian' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: pembelianDetailSchema
          }
        },
        404: errorSchema,
        500: errorSchema
      }
    }
  }, pembelianController.getPembelianById);

  // POST: Buat pembelian baru
  fastify.post('/', {
    schema: {
      description: 'Membuat transaksi pembelian baru.',
      tags: ['Pembelian'],
      body: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', description: 'ID User yang melakukan pembelian', example: 1 },
          suplier_id: { type: 'integer', description: 'ID Suplier', example: 1 },
          tanggal: { type: 'string', format: 'date', description: 'Tanggal pembelian', example: '2024-01-01' },
          keterangan: { type: 'string', description: 'Keterangan tambahan', example: 'Pembelian rutin bulanan' },
          items: {
            type: 'array',
            items: pembelianItemSchema
          },
          globalDiskon: globalDiskonSchema
        },
        required: ['suplier_id', 'items']
      },
      response: {
        201: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' }, id: { type: 'integer' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, pembelianController.createPembelian);

  // PUT: Update pembelian berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui transaksi pembelian berdasarkan ID.',
      tags: ['Pembelian'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pembelian' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', description: 'ID User yang melakukan pembelian', example: 1 },
          suplier_id: { type: 'integer', description: 'ID Suplier', example: 1 },
          tanggal: { type: 'string', format: 'date', description: 'Tanggal pembelian', example: '2024-01-01' },
          keterangan: { type: 'string', description: 'Keterangan tambahan', example: 'Pembelian rutin bulanan diperbarui' },
          items: {
            type: 'array',
            items: pembelianItemSchema
          },
          globalDiskon: globalDiskonSchema
        },
        required: ['suplier_id', 'items']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, pembelianController.updatePembelian);

  // DELETE: Hapus pembelian berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus transaksi pembelian berdasarkan ID.',
      tags: ['Pembelian'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pembelian' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        404: errorSchema,
        500: errorSchema
      }
    }
  }, pembelianController.deletePembelian);
}

module.exports = pembelianRoutes;
