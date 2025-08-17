import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

function normalizeCa(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (raw.includes("-----BEGIN CERTIFICATE-----")) return raw;
  try { return Buffer.from(raw, "base64").toString("utf8"); } catch { return raw; }
}

export class DatabaseModel {
  private _pool: pg.Pool;

  constructor() {
    const hasConnString = !!process.env.DATABASE_URL;
    const ca = normalizeCa(process.env.DB_CA_CERT);

    // 🔎 Logs úteis (não expõem segredos)
    console.log("[DB] NODE_ENV =", process.env.NODE_ENV);
    console.log("[DB] Tem DATABASE_URL? ", hasConnString);

    let config: pg.PoolConfig;

    if (hasConnString) {
      // PRODUÇÃO: usa somente DATABASE_URL (Supabase Pooler)
      // 👇 Força no-verify por padrão (resolve SELF_SIGNED_CERT_IN_CHAIN)
      //    Se você definir DB_CA_CERT, passa a validar a cadeia.
      config = {
        connectionString: process.env.DATABASE_URL,
        ssl: ca
          ? { ca, rejectUnauthorized: true }
          : { rejectUnauthorized: false }, // << força no-verify
        max: 10,
        idleTimeoutMillis: 10_000,
      };

      try {
        const u = new URL(process.env.DATABASE_URL!);
        console.log("[DB] Host =", u.hostname, "Port =", u.port || "(default)");
        console.log("[DB] Pooler? ", u.hostname.includes("pooler.supabase.com"));
        console.log("[DB] SSL no-verify? ", !ca);
      } catch {
        console.log("[DB] DATABASE_URL inválida");
      }

    } else {
      // LOCAL: mantém como você usa
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
      console.log("[DB] Usando config local (campos separados).");
    }

    this._pool = new pg.Pool(config);
  }

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

  public get pool() {
    return this._pool;
  }
}
