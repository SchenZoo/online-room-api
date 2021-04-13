/* eslint-disable import/no-dynamic-require */
const cliSelect = require('cli-select');
const { getAllDirFiles, initializeDatabase } = require('../script_utils');

async function offerAndRunScript() {
  try {
    console.log('Please choose the script you want to run');
    const files = (await getAllDirFiles(__dirname)).filter((fileName) => fileName !== 'index.js');
    const { value: selectedFile } = await cliSelect({
      values: files,
    });
    console.log(`You have selected: ${selectedFile}`);
    initializeDatabase();
    const script = require(`./${selectedFile}`);
    await script.execute();
    console.log('Finished executing script successfully');
  } catch (err) {
    if (!err) {
      return console.log('Cancelled picking script');
    }
    console.log('Error happened while running script');
    console.error(err);
    process.exit(1);
  }
  process.exit(0);
}

offerAndRunScript();
