// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

const { updateObject } = require('./object_transforms');

const defaultOptions = {
  query: {},
  findOptions: {},
  batchSize: 500,
  sleepIntervalAfterBatch: 0,
};
/**
 *
 * @param {mongoose.Model} Model
 * @param {(item:mongoose.Document)=>Promise<any>} templateFunction function used to process every item
 * @param {{
        query?:any,
        batchSize?:number,
        sleepIntervalAfterBatch?:number,
        findOptions:mongoose.QueryFindBaseOptions
    }} options additional query for data
 */
async function mongoBatchProcessing(Model, templateFunction, options = defaultOptions) {
  if (!templateFunction || typeof templateFunction !== 'function') {
    console.error('templateFunction passed to mongoBatchProcessing was undefined or not function');
    return;
  }
  const {
    query,
    batchSize,
    sleepIntervalAfterBatch,
    findOptions,
  } = updateObject(defaultOptions, options, false);

  console.log(`Start batch processing: batch size - ${batchSize}`);

  const totalItems = await Model.countDocuments(query);
  let count = 0;

  const totalBatches = Math.ceil(totalItems / batchSize);

  console.log(`Total items: ${totalItems}, batches: ${totalBatches}`);

  let latestId = null;

  for (let i = 0; i < totalBatches; i++) {
    if (latestId) {
      query._id = { $lt: latestId };
    }

    const dataItems = await Model.find(query, undefined, findOptions).sort({ _id: -1 }).limit(batchSize);
    const promises = [];
    dataItems.forEach((item) => {
      promises.push(templateFunction(item));
    });
    count += dataItems.length;
    latestId = dataItems[dataItems.length - 1]._id;
    await Promise.all(promises);
    console.log(`Processed ${count}/${totalItems}`);
    if (sleepIntervalAfterBatch) {
      console.log(`Sleeping for ${sleepIntervalAfterBatch} miliseconds`);
      await sleep(sleepIntervalAfterBatch);
    }
  }

  console.log('End batch processing');
}

const sleep = async (miliseconds) => new Promise((resolve) => {
  setTimeout(resolve, miliseconds);
});

module.exports = {
  mongoBatchProcessing,
};
