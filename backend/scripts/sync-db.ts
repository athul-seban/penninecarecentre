import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

// One-shot: creates/updates the schema (TypeORM synchronize) and runs every
// module's OnModuleInit seeder (default admin, CMS pages, team, jobs, reviews)
// against whichever DATABASE_URL / DB_* vars are set, regardless of NODE_ENV.
// Safe to re-run — synchronize and the seeders are idempotent.
async function run() {
  process.env.DB_FORCE_SYNC = 'true';
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  await app.close();
  console.log('Database schema synced and seed data applied.');
}

run().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
