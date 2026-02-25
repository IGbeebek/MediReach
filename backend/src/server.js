const app = require('./app');
const config = require('./config');
const { pool } = require('./database/db');

const start = async () => {
  try {
    // Verify database connection
    const client = await pool.connect();
    console.log('✅  Connected to PostgreSQL');
    client.release();

    app.listen(config.port, () => {
      console.log(`🚀  MediReach API running on http://localhost:${config.port}`);
      console.log(`    Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
