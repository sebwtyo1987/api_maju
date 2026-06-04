const authRoutes = require('../../modules/auth/auth.route');
const healthRoutes = require('../../modules/health/health.route');
const userRoutes = require('../user.route');
const barangRoutes = require('../barang.route');
const kategoriRoutes = require('../kategori.route');
const historiRoutes = require('../histori.route');
const suplierRoutes = require('../suplier.route');
const pelangganRoutes = require('../pelanggan.route');
const reportsRoutes = require('../laporan.route');
const transaksiRoutes = require('../transaksi.route');
const pembelianRoutes = require('../pembelian.route');
const historiPembelianRoutes = require('../histori-pembelian.route');
const tagihanRoutes = require('../tagihan.route');

async function v1Routes(fastify) {
  await fastify.register(authRoutes);
  await fastify.register(userRoutes, { prefix: '/users' });
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(barangRoutes, { prefix: '/barang' });
  await fastify.register(kategoriRoutes, { prefix: '/kategori' });
  await fastify.register(historiRoutes, { prefix: '/histori' });
  await fastify.register(suplierRoutes, { prefix: '/suplier' });
  await fastify.register(pelangganRoutes, { prefix: '/pelanggan' });
  await fastify.register(reportsRoutes, { prefix: '/laporan' });
  await fastify.register(transaksiRoutes, { prefix: '/transaksi' });
  await fastify.register(pembelianRoutes, { prefix: '/pembelian' });
  await fastify.register(historiPembelianRoutes, { prefix: '/histori_pembelian' });
  await fastify.register(tagihanRoutes, { prefix: '/tagihan' });
}

module.exports = v1Routes;
