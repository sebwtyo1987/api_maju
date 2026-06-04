const transaksiController = require('../controller/transaksi.controller');

async function transaksiRoutes(fastify) {
  const transaksiHeaderSchema = {
    type: 'object',
    properties: {
      penjualan_id: { type: 'integer' },
      tanggal: { type: 'string', format: 'date-time', nullable: true },
      user_id: { type: 'integer' },
      user_nama: { type: 'string' },
      pelanggan_id: { type: 'integer', nullable: true },
      nama_pelanggan: { type: 'string', nullable: true },
      alamat: { type: 'string', nullable: true },
      no_telepon: { type: 'string', nullable: true },
      total: { type: 'number', format: 'float' },
      created_at: { type: 'string', format: 'date-time', nullable: true },
    }
  };

  const transaksiDetailSchema = {
    type: 'object',
    properties: {
      detail_penjualan_id: { type: 'integer' },
      penjualan_id: { type: 'integer' },
      detail_urut: { type: 'integer' },
      barang_id: { type: 'integer' },
      nama_barang: { type: 'string' },
      satuan: { type: 'string' },
      jumlah: { type: 'integer' },
      harga_satuan: { type: 'number', format: 'float' },
      subtotal: { type: 'number', format: 'float' },
    }
  };

  const transaksiFullSchema = {
    type: 'object',
    properties: {
      ...transaksiHeaderSchema.properties,
      details: {
        type: 'array',
        items: transaksiDetailSchema
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

  // GET: Ambil semua transaksi atau cari berdasarkan ID/filter
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua transaksi penjualan dengan opsi filter dan pagination.',
      tags: ['Penjualan'],
      querystring: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Transaksi spesifik' },
          search: { type: 'string', description: 'Kata kunci pencarian (user, pelanggan, ID transaksi)' },
          page: { type: 'integer', default: 1, description: 'Nomor halaman' },
          limit: { type: 'integer', default: 10, description: 'Jumlah item per halaman' },
          role: { type: 'string', description: 'Filter berdasarkan role user' },
          user_id: { type: 'integer', description: 'Filter berdasarkan ID user' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: transaksiHeaderSchema
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total_rows: { type: 'integer' },
                total_pages: { type: 'integer' },
              }
            }
          }
        },
        500: errorSchema
      }
    }
  }, transaksiController.getTransaksi);

  // GET: Ambil transaksi berdasarkan ID di parameter
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail transaksi penjualan berdasarkan ID.',
      tags: ['Penjualan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Transaksi' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: transaksiFullSchema
          }
        },
        404: errorSchema,
        500: errorSchema
      }
    }
  }, transaksiController.getTransaksi);

  // GET: Ambil transaksi untuk kebutuhan cetak
  fastify.get('/print/:id', {
    schema: {
      description: 'Mengambil data lengkap transaksi (termasuk nama pelanggan dan user) untuk kebutuhan cetak.',
      tags: ['Penjualan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Transaksi' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: transaksiFullSchema
          }
        },
        404: errorSchema,
        500: errorSchema
      }
    }
  }, transaksiController.printTransaksi);

  // POST: Buat transaksi baru
  fastify.post('/', {
    schema: {
      description: 'Membuat transaksi penjualan baru.',
      tags: ['Penjualan'],
      body: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', description: 'ID User yang melakukan transaksi', example: 1 },
          pelanggan_id: { type: 'integer', nullable: true, description: 'ID Pelanggan (opsional)', example: 1 },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                barang_id: { type: 'integer', description: 'ID Barang', example: 10 },
                jumlah: { type: 'integer', description: 'Jumlah barang', example: 2 },
                harga_satuan: { type: 'number', format: 'float', description: 'Harga jual per satuan', example: 15000 },
              },
              required: ['barang_id', 'jumlah', 'harga_satuan']
            }
          }
        },
        required: ['user_id', 'items']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' }, penjualan_id: { type: 'integer' } } },
        500: errorSchema
      }
    }
  }, transaksiController.createTransaksi);

  // PUT: Update transaksi berdasarkan ID (via params)
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui transaksi penjualan berdasarkan ID.',
      tags: ['Penjualan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Penjualan' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', description: 'ID User yang melakukan transaksi', example: 1 },
          pelanggan_id: { type: 'integer', nullable: true, description: 'ID Pelanggan (opsional)', example: 1 },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                barang_id: { type: 'integer', description: 'ID Barang', example: 10 },
                jumlah: { type: 'integer', description: 'Jumlah barang', example: 1 },
                harga_satuan: { type: 'number', format: 'float', description: 'Harga jual per satuan', example: 15500 },
              },
              required: ['barang_id', 'jumlah', 'harga_satuan']
            }
          }
        },
        required: ['user_id', 'items']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' }, penjualan_id: { type: 'integer' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, transaksiController.updateTransaksi);

  // DELETE: Hapus transaksi berdasarkan ID (via params)
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus transaksi penjualan berdasarkan ID.',
      tags: ['Penjualan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Penjualan' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, transaksiController.deleteTransaksi);

  // Catatan: Route PUT / dan DELETE / tanpa ID di path dihapus karena tidak sesuai praktik RESTful API
  // dan sudah ditangani oleh route dengan parameter ID.
}

module.exports = transaksiRoutes;
