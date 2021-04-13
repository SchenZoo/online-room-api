/* eslint-disable import/no-dynamic-require */
const cliSelect = require('cli-select');
const { getAllDirFiles, initializeDatabase } = require('../script_utils');

async function offerAndRunMigration() {
  try {
    console.log('Please choose the file you want to run');
    const files = (await getAllDirFiles(__dirname)).filter((fileName) => fileName !== 'index.js');
    const { value: selectedFile } = await cliSelect({
      values: files,
    });
    console.log(`You have selected: ${selectedFile}`);
    initializeDatabase();
    const migration = require(`./${selectedFile}`);
    await migration.execute();
    console.log('Finished executing migration successfully');
  } catch (err) {
    if (!err) {
      return console.log('Cancelled picking migration script');
    }
    console.log('Error happened while running migration');
    console.error(err);
    process.exit(1);
  }
  process.exit(0);
}

offerAndRunMigration();
