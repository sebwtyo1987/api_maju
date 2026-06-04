async function findUserByUsername(db, username) {
  const [rows] = await db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0];
}

module.exports = {
  findUserByUsername,
};
