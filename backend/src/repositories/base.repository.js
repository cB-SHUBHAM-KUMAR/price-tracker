/**
 * @fileoverview Base repository — implements generic CRUD that all other
 * repositories can inherit. Follows the Repository pattern to abstract
 * the data-access layer away from business logic.
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, select = '') {
    return this.model.findById(id).select(select);
  }

  async findOne(filter, select = '') {
    return this.model.findOne(filter).select(select);
  }

  async findAll(filter = {}, { page = 1, limit = 10, sort = '-createdAt', select = '' } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).select(select).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
