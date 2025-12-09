// Script to query PostgreSQL database and list all tables
const { Client } = require('pg');

const connectionString = 'postgresql://businessdb_bnz9_user:QjVviUyxo3fpslNUbhbP09imItYkgb6z@dpg-d4q8hpmr433s73ai1epg-a:5432/businessdb_bnz9';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Required for some cloud databases
  }
});

async function listTables() {
  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Query to get all tables
    const tablesQuery = `
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📊 Fetching all tables...\n');
    const result = await client.query(tablesQuery);

    if (result.rows.length === 0) {
      console.log('⚠️  No tables found in the public schema.\n');
    } else {
      console.log(`✅ Found ${result.rows.length} table(s):\n`);
      console.log('┌─────────────────────────────────────────────────────────┐');
      console.log('│ Table Name                    │ Type                    │');
      console.log('├─────────────────────────────────────────────────────────┤');
      
      result.rows.forEach((row, index) => {
        const tableName = row.table_name.padEnd(28);
        const tableType = row.table_type.padEnd(22);
        console.log(`│ ${tableName} │ ${tableType} │`);
      });
      
      console.log('└─────────────────────────────────────────────────────────┘\n');

      // Get column details for each table
      console.log('📋 Table Details:\n');
      for (const row of result.rows) {
        const tableName = row.table_name;
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = $1
          ORDER BY ordinal_position;
        `;
        
        const columnsResult = await client.query(columnsQuery, [tableName]);
        
        console.log(`\n📌 ${tableName.toUpperCase()}`);
        console.log('─'.repeat(60));
        
        if (columnsResult.rows.length > 0) {
          columnsResult.rows.forEach(col => {
            const maxLength = col.character_maximum_length 
              ? `(${col.character_maximum_length})` 
              : '';
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            
            console.log(`  • ${col.column_name.padEnd(25)} ${col.data_type.toUpperCase()}${maxLength} ${nullable}${defaultValue}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the query
listTables();

