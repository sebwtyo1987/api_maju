const userService = require('../service/user.service');
const bcrypt = require('bcrypt');

async function getUsers(request, reply) {
  const users = await userService.findAll(request.server.db);
  return { status: 'success', data: users };
}

async function getUserById(request, reply) {
  const { id } = request.params;
  const user = await userService.findById(request.server.db, id);
  if (!user) {
    return reply.code(404).send({ status: 'error', message: 'User tidak ditemukan' });
  }
  return { status: 'success', data: user };
}

async function createUser(request, reply) {
  const { username, password, role , nama , menu } = request.body;
  // Hash password sebelum simpan
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const userId = await userService.create(request.server.db, { 
    username, 
    password: hashedPassword, 
    nama: nama,
    menu: menu || "user", // Default menu jika tidak disediakan
    role: role  
  });

  return reply.code(201).send({ 
    status: 'success', 
    message: 'User berhasil dibuat', 
    data: { id: userId } 
  });
}

async function updateUser(request, reply) {
  const { id } = request.params;
  await userService.update(request.server.db, id, request.body);
  return { status: 'success', message: 'User berhasil diperbarui' };
}

async function deleteUser(request, reply) {
  const { id } = request.params;
  await userService.remove(request.server.db, id);
  return { status: 'success', message: 'User berhasil dihapus' };
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
