// src/model/DatabaseModel.ts
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

function normalizeCa(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (raw.includes("-----BEGIN CERTIFICATE-----")) return raw;
  try {
    // permite colar a CA em base64 no Render
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return raw;
  }
}

export class DatabaseModel {
  private _pool: pg.Pool;

  constructor() {
    const hasConnString = !!process.env.DATABASE_URL;
    const ca = normalizeCa(process.env.DB_CA_CERT);

    // Logs de diagnóstico (não expõem segredos)
    try {
      console.log("[DB] NODE_ENV =", process.env.NODE_ENV);
      console.log("[DB] DATABASE_URL presente? ", hasConnString);
      if (hasConnString) {
        const u = new URL(process.env.DATABASE_URL!);
        console.log("[DB] Host =", u.hostname, "Port =", u.port || "(default)");
        console.log("[DB] Pooler? ", u.hostname.includes("pooler.supabase.com"));
      } else {
        console.log("[DB] Usando config local (DB_HOST/DB_USER/DB_NAME...)");
      }
      console.log("[DB] DB_CA_CERT presente? ", !!ca);
    } catch {
      /* ignore */
    }

    let config: pg.PoolConfig;

    if (hasConnString) {
      // PRODUÇÃO (Render): usar apenas a connection string do Supabase Pooler
      config = {
        connectionString: process.env.DATABASE_URL, // ex.: ...pooler.supabase.com:5432/postgres?sslmode=require
        ssl: ca
          ? { ca, rejectUnauthorized: true } // valida a cadeia com a CA fornecida
          : { rejectUnauthorized: false },   // fallback prático p/ resolver SELF_SIGNED_CERT_IN_CHAIN
        max: 10,
        idleTimeoutMillis: 10_000,
      };
    } else {
      // LOCAL: mantém sua conexão por campos
      const isProd = process.env.NODE_ENV === "production";
      config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
        ssl: isProd ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 10_000,
      };
    }

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
      console.error("Não foi possível conectar ao banco de dados");
      return false;
    }
  }

  /** Expor o pool */
  public get pool() {
    return this._pool;
  }
}
