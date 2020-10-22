// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

/**
 *
 * @param {mongoose.Model} Model
 * @param {(item:mongoose.Document)=>Promise<any>} templateFunction
 * @param {any} query
 * @param {number} BATCH_SIZE
 */
async function mongoBatchProcessing(Model, templateFunction, query = {}, BATCH_SIZE = 500) {
  if (!templateFunction || typeof templateFunction !== 'function') {
    console.error('templateFunction passed to mongoBatchProcessing wasn undefined or not function');
    return;
  }
  console.log('Start batch processing');

  const totalItems = await Model.countDocuments(query);
  let count = 0;

  const totalBatches = Math.ceil(totalItems / BATCH_SIZE);

  console.log(`Total batches: ${totalBatches}`);

  for (let i = 0; i < totalBatches; i++) {
    const dataItems = await Model.find(query).limit(BATCH_SIZE).skip(i * BATCH_SIZE);
    const promises = [];
    dataItems.forEach((item) => {
      promises.push(templateFunction(item));
    });
    count += dataItems.length;
    await Promise.all(promises);
    console.log(`Processed ${count}/${totalItems}`);
  }

  console.log('End batch processing');
}

module.exports = {
  mongoBatchProcessing,
};
