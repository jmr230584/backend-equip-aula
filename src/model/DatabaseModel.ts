import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

function normalizeCaFromEnv(raw?: string): string | undefined {
  if (!raw) return undefined;
  // Se já veio o PEM "cru"
  if (raw.includes("-----BEGIN CERTIFICATE-----")) return raw;
  // Se veio base64 (às vezes é mais prático colar como base64 no Render)
  try {
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return raw; // último recurso
  }
}

export class DatabaseModel {
  private _pool: pg.Pool;

  constructor() {
    const useConnString = !!process.env.DATABASE_URL;

    // Se estiver usando o pooler do Supabase em produção, preferimos validar com a CA
    const caFromEnv = normalizeCaFromEnv(process.env.DB_CA_CERT);

    const config: pg.PoolConfig = useConnString
      ? {
          // Produção: 1 variável só
          connectionString: process.env.DATABASE_URL, // ex: postgres://user:pass@aws-0-xxx.pooler.supabase.com:5432/db?sslmode=require
          ssl: caFromEnv
            ? {
                ca: caFromEnv,             // valida a cadeia cert (recomendado)
                rejectUnauthorized: true,
              }
            : {
                //fallback seguro o suficiente para Render+Supabase para não gerenciar a CA
                rejectUnauthorized: false,
              },
          max: 10,
          idleTimeoutMillis: 10_000,
        }
      : {
          // Local
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
  public async testeConexao(): Promise<boolean> {
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
