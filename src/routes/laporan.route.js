const reportsController = require('../controller/laporan.controller');

async function reportsRoutes(fastify) {
  const errorSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' }
    }
  };

  // GET: Laporan Pembelian
  fastify.get('/pembelian', {
    schema: {
      description: 'Mengambil laporan ringkasan pembelian dan top produk yang di-restock.',
      tags: ['Laporan'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            pembelian_summary: {
              type: 'object',
              properties: {
                total: {
                  type: 'object',
                  properties: {
                    harian: { type: 'number', format: 'float', example: 1500000 },
                    bulanan: { type: 'number', format: 'float', example: 30000000 },
                    tahunan: { type: 'number', format: 'float', example: 360000000 }
                  }
                }
              }
            },
            top_products_restock: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nama_barang: { type: 'string', example: 'Susu Cair' },
                  total_qty: { type: 'integer', example: 500 },
                  total_biaya: { type: 'number', format: 'float', example: 4000000 },
                  satuan: { type: 'string', example: 'PCS' }
                }
              }
            },
            info: {
              type: 'object',
              properties: {
                tanggal_server: { type: 'string', format: 'date-time', nullable: true }
              }
            }
          }
        },
        500: errorSchema
      }
    }
  }, reportsController.getPembelianReport);

  // GET: Laporan Penjualan
  fastify.get('/penjualan', {
    schema: {
      description: 'Mengambil laporan ringkasan penjualan, stok kritis, produk terlaris, dan top pelanggan.',
      tags: ['Laporan'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            penjualan: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    harian: { type: 'number', format: 'float', example: 2000000 },
                    bulanan: { type: 'number', format: 'float', example: 45000000 },
                    tahunan: { type: 'number', format: 'float', example: 500000000 }
                  }
                }
              }
            },
            stok_kritis: {
              type: 'array',
              items: { type: 'object', properties: { nama_barang: { type: 'string' }, stok: { type: 'integer' }, satuan: { type: 'string' } } }
            },
            produk_terlaris: {
              type: 'array',
              items: { type: 'object', properties: { nama_barang: { type: 'string' }, total_terjual: { type: 'integer' } } }
            },
            top_pelanggan: {
              type: 'array',
              items: { type: 'object', properties: { nama_pelanggan: { type: 'string' }, kontribusi: { type: 'number', format: 'float' } } }
            },
            info: {
              type: 'object',
              properties: {
                tanggal_server: { type: 'string', format: 'date-time', nullable: true }
              }
            }
          }
        },
        500: errorSchema
      }
    }
  }, reportsController.getPenjualanReport);
}

module.exports = reportsRoutes;
