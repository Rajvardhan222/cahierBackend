// worker.js
import { run } from 'graphile-worker';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const main = async () => {
    const jobsDirectory = join(__dirname, 'jobs');

    // Ensure the environment variable is set
    const connectionString = process.env.CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("CONNECTION_STRING environment variable is not set.");
    }
  
    // Construct the URL for the transactionJob module
    const transactionJobPath = pathToFileURL(join(jobsDirectory, 'transactionJob.js')).href;
  
    await run({
      connectionString,
      taskList: {
        transactionJob: (await import(transactionJobPath)).default,
      },
    });
};

 main().catch(err => {
  console.error(err);
  process.exit(1);
});

export default main
