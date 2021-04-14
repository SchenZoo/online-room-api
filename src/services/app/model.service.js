// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { ObjectTransforms, QueryParams } = require('../../common');
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
  async preSaveDocTransform(partialDocument) {
    return partialDocument;
  }

  /**
   *
   * @param {any} document
   * @param {'create'|'update'} operationType
   */
  async postSaveDocTransform(document) {
    return document;
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
   *
   * @returns {Promise<mongoose.Document>}
   */
  async create(partialDocument) {
    const processedDocument = await this.preSaveDocTransform(partialDocument, 'create');
    const document = await new this.Model(processedDocument).save();
    return this.postSaveDocTransform(document);
  }

  /**
   *
   * @param {mongoose.Document} document
   * @param {any} partialDocument
   */
  async updateObject(document, partialDocument = {}) {
    const processedDocument = await this.preSaveDocTransform(partialDocument, 'update');
    ObjectTransforms.updateObject(document, processedDocument, true);
    await document.save();
    return this.postSaveDocTransform(document);
  }

  /**
   *
   * @param {any} query
   * @param {any} partialDocument
   */
  async updateOne(query, partialDocument = {}) {
    const processedDocument = await this.preSaveDocTransform(partialDocument, 'update');
    const document = await this.findOne(query);
    if (!document) {
      throw new NotFoundError(`${this.Model.modelName} not found!`, true);
    }
    ObjectTransforms.updateObject(document, processedDocument, true);
    await document.save();
    return this.postSaveDocTransform(document);
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
      throw new NotFoundError(`${this.Model.modelName} not found!`, true);
    }
    return document;
  }

  /**
 *
 * @param {Record<string,string>} queryParams
 * @param {{additionalQuery: any, additionalForbiddenProps: [], findOptions:mongoose.QueryFindBaseOptions}} options
 */
  async getPaginated(queryParams, options = {}) {
    const {
      additionalQuery = {}, additionalForbiddenProps = [], findOptions = {
        lean: true,
      },
    } = options;

    const {
      mongoQuery,
      skip,
      limit,
      sort,
      searchString,
      projection,
      relations,
    } = QueryParams.normalizeQueryOptions(queryParams, { transformOpts: { excludePagination: true } });

    const {
      searchProps,
      sortProps,
      relationProps,
      forbiddenProps = [],
    } = this.Model.schema.options;

    const findQuery = QueryParams.searchStringToMongoQuery(searchString, searchProps, {
      ...mongoQuery,
      ...additionalQuery,
    });

    const countQuery = this.Model.countDocuments(findQuery);

    const projectionFiltered = this.filterProjection(projection, [...forbiddenProps, ...additionalForbiddenProps]);

    const dataQuery = this.Model.find(findQuery, undefined, {
      projection: projectionFiltered.join(' '),
      ...findOptions,
    })
      .skip(skip)
      .limit(limit);

    if (sort && sortProps) {
      dataQuery.sort(ObjectTransforms.pick(sort, sortProps, true));
    } else {
      dataQuery.sort({ _id: -1 });
    }

    if (relations && relationProps) {
      dataQuery.populate(relations.filter((el) => relationProps.includes(el)));
    }

    const [items, count] = await Promise.all([dataQuery, countQuery]);

    return {
      items,
      itemsTotal: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(skip / limit) + 1,
    };
  }

  /**
   *
   * @param {Record<string,string>} queryParams
   * @param {{ query: Record<string,string>, additionalForbiddenProps: [], findOptions: mongoose.QueryFindBaseOptions}} options
   */
  async getOne(query = {}, options = {}) {
    const {
      query: queryParams = {}, findOptions = {
        lean: true,
      }, additionalForbiddenProps = [],
    } = options;

    const {
      mongoQuery,
      searchString,
      projection,
      relations,
    } = QueryParams.normalizeQueryOptions(queryParams, { transformOpts: { excludePagination: true } });

    const {
      searchProps,
      relationProps,
      forbiddenProps = [],
    } = this.Model.schema.options;

    const findQuery = QueryParams.searchStringToMongoQuery(searchString, searchProps, {
      ...mongoQuery,
      ...query,
    });

    const projectionFiltered = this.filterProjection(projection, [...forbiddenProps, ...additionalForbiddenProps]);

    const document = await this.findOne(findQuery, undefined, {
      projection: projectionFiltered,
      ...findOptions,
    });

    if (!document) {
      throw new NotFoundError(`${this.Model.modelName} not found!`, true);
    }

    if (relations && relationProps) {
      document.populate(relations.filter((el) => relationProps.includes(el)));
      await document.execPopulate();
    }

    return document;
  }

  filterProjection(projection, forbiddenFields) {
    if (!forbiddenFields) {
      return;
    }
    const defaultForbidden = forbiddenFields.map((field) => `-${field}`);
    if (!projection) {
      return defaultForbidden;
    }
    const excludingMode = projection.every((field) => field.startsWith('-'));
    const projectionWithoutSigns = projection.map((field) => field.replace('-', ''));
    if (excludingMode) {
      return [...defaultForbidden, ...projectionWithoutSigns.map((field) => `-${field}`)];
    }
    const filteredProjection = projectionWithoutSigns
      .filter((field) => forbiddenFields.every((forbiddenField) => !field.startsWith(forbiddenField)));
    return filteredProjection.length ? filteredProjection : defaultForbidden;
  }
}


module.exports = {
  ModelService,
};
