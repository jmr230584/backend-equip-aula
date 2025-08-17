import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export class DatabaseModel {
  private _pool: pg.Pool;

  constructor() {
    const useConnString = !!process.env.DATABASE_URL;

    const config: pg.PoolConfig = useConnString
      ? {
          connectionString: process.env.DATABASE_URL, // ex: postgresql://user:pass@host:5432/postgres?sslmode=require
          ssl: { rejectUnauthorized: false },          // Supabase exige TLS
          max: 10,
          idleTimeoutMillis: 10_000,
        }
      : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: Number(process.env.DB_PORT) || 5432,
          ssl:
            process.env.NODE_ENV === "production"
              ? { rejectUnauthorized: false }
              : undefined,
          max: 10,
          idleTimeoutMillis: 10_000,
        };

    this._pool = new pg.Pool(config);
  }

  /** Teste simples de conexão */
  public async testeConexao() {
    try {
      const { rows } = await this._pool.query("select now()");
      console.clear();
      console.log("Database connected!", rows[0].now);
      return true;
    } catch (error) {
      console.error("Error to connect database X(", error);
      return false;
    }
  }

  /** Exponha o pool para uso nos DAOs/Repos */
  public get pool() {
    return this._pool;
  }
}
