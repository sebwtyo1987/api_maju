const bcrypt = require('bcrypt');
const authService = require('../service/auth.service');

async function loginHandler(request, reply) {
  const { username, password } = request.body || {};

  if (!username || !password) {
    return { status: 'error', message: 'Username dan password wajib diisi!' };
  }

  const user = await authService.findUserByUsername(request.server.db, username.trim());

  if (!user) {
    return { status: 'error', message: 'User tidak ditemukan!' };
  }

  // Sesuai logika PHP: Mendukung plaintext (untuk migrasi/dev) dan Bcrypt Hash
  const isPlaintextMatch = user.password === password.trim();
  let isHashedMatch = false;

  try {
    isHashedMatch = await bcrypt.compare(password.trim(), user.password);
  } catch (err) {
    isHashedMatch = false;
  }

  if (isPlaintextMatch || isHashedMatch) {
    return {
      status: 'success',
      message: 'Login berhasil!',
      data: {
        id: user.user_id,
        username: user.username,
        role: user.role
      }
    };
  }

  return { status: 'error', message: 'Password salah!' };
}

module.exports = { loginHandler };
