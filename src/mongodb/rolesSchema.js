const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  roleID: { type: String, required: true },
  username: { type: String, required: true }
});

module.exports = mongoose.model('Role', roleSchema);
