/**
 * @fileoverview User DTO — shapes the data returned to the client,
 * stripping sensitive fields from the Mongoose document.
 */

class UserDTO {
  static from(user) {
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static fromMany(users) {
    return users.map((user) => UserDTO.from(user));
  }
}

module.exports = UserDTO;
