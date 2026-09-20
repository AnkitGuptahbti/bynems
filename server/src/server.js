require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { env, validateEnv, connectDatabase } = require('./config');
const { logger } = require('./config/logger');

let server;
let shuttingDown = false;

async function start() {
  validateEnv();
  await connectDatabase();
  logger.info({ database: mongoose.connection.name }, 'Database connected');
  server = app.listen(env.port, () => {
    logger.info({ port: env.port, environment: env.nodeEnv }, 'API server started');
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');
  try {
    if (server) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    await mongoose.connection.close();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.fatal({ err: error }, 'Graceful shutdown failed');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => {
  logger.fatal({ err: error }, 'Unhandled promise rejection');
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

start().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start API');
  process.exit(1);
});
