// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { MongoListOptions } = require('../list_options');
const { ObjectTransforms, RegExp: { escapeRegExp } } = require('../../common');
const { NotFoundError } = require('../../errors/general');

class ModelService {
  /**
     *
     * @param {mongoose.Model} Model
     */
  constructor(Model) {
    this.Model = Model;
  }


  /**
   *
   * @param {any} partialDocument
   * @param {'create'|'update'} operationType
   */
  async partialDocumentTransformation(partialDocument) {
    return partialDocument;
  }

  /**
   *
   * @param {any} query
   * @param {string} projection
   * @param {mongoose.QueryFindBaseOptions} findOptions
   */
  async findAll(query, projection, findOptions = {}) {
    return this.Model.find(query, projection, findOptions);
  }

  /**
   *
   * @param {any} query
   * @param {string} projection
   * @param {mongoose.QueryFindBaseOptions} findOptions
   */
  findOne(query, projection, findOptions) {
    return this.Model.findOne(query, projection, findOptions);
  }


  /**
   *
   * @param {any} partialDocument
   */
  async create(partialDocument) {
    const processedDocument = await this.partialDocumentTransformation(partialDocument, 'create');
    return new this.Model(processedDocument).save();
  }

  /**
   *
   * @param {mongoose.Document} document
   * @param {any} partialDocument
   */
  async updateObject(document, partialDocument = {}) {
    const processedDocument = await this.partialDocumentTransformation(partialDocument, 'update');
    ObjectTransforms.updateObject(document, processedDocument, true);
    return document.save();
  }

  /**
   *
   * @param {any} query
   * @param {any} partialDocument
   */
  async updateOne(query, partialDocument = {}) {
    const processedDocument = await this.partialDocumentTransformation(partialDocument, 'update');
    const document = await this.Model.findOne(query);
    if (!document) {
      throw new NotFoundError('Document not found!');
    }
    ObjectTransforms.updateObject(document, processedDocument, true);
    await document.save();
    return document;
  }

  /**
   *
   * @param {mongoose.Document} document
   */
  async removeObject(document) {
    return document.remove();
  }

  /**
   *
   * @param {any} query
   */
  async removeOne(query) {
    const document = await this.Model.findOneAndRemove(query);
    if (!document) {
      throw new NotFoundError('Document not found!');
    }
    return document;
  }


  /**
   *
   * @param {MongoListOptions} listOptions
   * @param {string} projection
   * @param {mongoose.QueryFindBaseOptions} findOptions
   */
  async find(listOptions, projection, findOptions) {
    const {
      mongoQuery, skip, limit, sort,
    } = listOptions;
    let { searchString } = listOptions;
    searchString = searchString && searchString.trim();

    const query = {
      ...mongoQuery,
    };

    const { searchProps } = this.Model.schema.options;
    if (searchString && searchProps) {
      const regex = new RegExp(escapeRegExp(searchString)
        .split(' ')
        .map((regexp) => `(.*${regexp}.*)`)
        .join('|'), 'i');
      const searchStringQueries = searchProps.map((searchProp) => (
        {
          [searchProp]: { $regex: regex },
        }
      ));
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchStringQueries }];
      } else {
        query.$or = searchStringQueries;
      }
    }

    const countQuery = this.Model.countDocuments(query);
    const dataQuery = this.Model.find(query, projection, findOptions)
      .skip(skip)
      .limit(limit);

    if (sort) {
      dataQuery.sort(sort);
    }

    const [items, count] = await Promise.all([dataQuery, countQuery]);

    return {
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(skip / limit) + 1,
    };
  }
}

module.exports = {
  ModelService,
};
