import { Module, Global } from '@nestjs/common';
import pg from 'pg';
import { ConfigService } from '@nestjs/config';

type PoolOptions = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

type PoolInstance = {
  query(text: string, params?: ReadonlyArray<unknown>): Promise<unknown>;
  end: () => Promise<void>;
};

type PgModule = {
  Pool: new (config: PoolOptions) => PoolInstance;
};

const { Pool } = pg as unknown as PgModule;

@Global()
@Module({
  providers: [
    {
      provide: 'PG',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.getOrThrow<string>('DB_HOST');
        const port = Number(config.getOrThrow<string>('DB_PORT'));
        const user = config.getOrThrow<string>('DB_USER');
        const password = config.getOrThrow<string>('DB_PASSWORD');
        const database = config.getOrThrow<string>('DB_NAME');

        const poolConfig: PoolOptions = {
          host,
          port,
          user,
          password,
          database,
        };

        const pool: PoolInstance = new Pool(poolConfig);
        return pool;
      },
    },
  ],
  exports: ['PG'],
})
export class DatabaseModule {}
