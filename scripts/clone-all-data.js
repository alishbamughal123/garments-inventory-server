process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');
require('dotenv').config();

async function cloneAll() {
  console.log('🚀 Cloning ALL tables from Live DB (defaultdb) -> Dev DB (garments_dev)...\n');

  const liveUrl = process.env.DATABASE_URL.replace('/garments_dev', '/defaultdb');
  const devUrl = process.env.DATABASE_URL.replace('/defaultdb', '/garments_dev');

  const sourcePool = new Pool({ connectionString: liveUrl, ssl: { rejectUnauthorized: false } });
  const targetPool = new Pool({ connectionString: devUrl, ssl: { rejectUnauthorized: false } });

  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();

  try {
    const tablesRes = await sourceClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE' 
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables to copy.\n`);

    // Disable triggers and foreign keys during load
    await targetClient.query(`SET session_replication_role = 'replica';`);

    // Step 1: Clean all target tables once
    console.log('Cleaning existing Dev DB data...');
    for (const table of tables) {
      try {
        await targetClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);
      } catch (e) {}
    }
    console.log('✓ Dev DB tables cleaned!\n');

    // Step 2: Copy each table data
    for (const table of tables) {
      const targetTableCheck = await targetClient.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );

      if (targetTableCheck.rowCount === 0) {
        console.log(`- Table "${table}": [Skipped: not in target DB]`);
        continue;
      }

      const sourceData = await sourceClient.query(`SELECT * FROM "${table}"`);
      const rows = sourceData.rows;

      if (rows.length === 0) {
        console.log(`- Table "${table}": 0 rows`);
        continue;
      }

      const targetColsRes = await targetClient.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      
      const targetColTypes = {};
      for (const r of targetColsRes.rows) {
        targetColTypes[r.column_name] = r.udt_name;
      }

      const sourceCols = Object.keys(rows[0]);
      const columns = sourceCols.filter(c => targetColTypes[c]);
      const quotedCols = columns.map(c => `"${c}"`).join(', ');

      const chunkSize = 50;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const values = [];
        const valueClauses = [];
        let paramIdx = 1;

        for (const row of chunk) {
          const rowPlaceholders = [];
          for (const col of columns) {
            let val = row[col];
            const udt = targetColTypes[col];

            if (udt === 'json' || udt === 'jsonb') {
              if (val === null || val === undefined) {
                values.push(null);
                rowPlaceholders.push(`$${paramIdx++}::jsonb`);
              } else {
                let jsonStr = typeof val === 'string' ? val : JSON.stringify(val);
                values.push(jsonStr);
                rowPlaceholders.push(`$${paramIdx++}::jsonb`);
              }
            } else {
              values.push(val);
              rowPlaceholders.push(`$${paramIdx++}`);
            }
          }
          valueClauses.push(`(${rowPlaceholders.join(', ')})`);
        }

        const query = `INSERT INTO "${table}" (${quotedCols}) VALUES ${valueClauses.join(', ')}`;
        await targetClient.query(query, values);
      }

      console.log(`✓ Table "${table}": ${rows.length} rows copied!`);
    }

    // Step 3: Re-enable origin replication role
    await targetClient.query(`SET session_replication_role = 'origin';`);
    console.log('\n🎉 ALL LIVE DATA HAS BEEN PERFECTLY CLONED TO GARMENTS_DEV!');
  } catch (error) {
    console.error('\n❌ Copy failed:', error);
  } finally {
    sourceClient.release();
    targetClient.release();
    await sourcePool.end();
    await targetPool.end();
    process.exit(0);
  }
}

cloneAll();
