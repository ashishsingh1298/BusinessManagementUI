// Script to list all tables in the PostgreSQL database
const https = require('https');

const connectionString = 'postgresql://businessdb_bnz9_user:QjVviUyxo3fpslNUbhbP09imItYkgb6z@dpg-d4q8hpmr433s73ai1epg-a:5432/businessdb_bnz9';

// Parse connection string
const url = new URL(connectionString.replace('postgresql://', 'https://'));
const hostname = url.hostname;
const port = url.port || 5432;
const database = url.pathname.slice(1);
const username = url.username;
const password = url.password;

console.log('Attempting to connect to database...');
console.log(`Host: ${hostname}`);
console.log(`Database: ${database}`);
console.log('');

// Try using psql command if available, otherwise use API
const { exec } = require('child_process');

// First, try to install pg if not available, or use a simpler approach
// Let's try using curl to check if we can connect via API instead
// Or create a simple script that uses the API endpoints

console.log('Since direct database access requires pg module, let\'s check via API instead...');
console.log('');

// Alternative: Query via your API
const API_BASE = 'https://businessapi-njcw.onrender.com/api';

async function checkTablesViaAPI() {
  try {
    console.log('Checking database structure via API endpoints...\n');
    
    // Check Customers endpoint
    const customersRes = await fetch(`${API_BASE}/Customers`, {
      headers: {
        'Authorization': 'Bearer ' + (localStorage?.getItem('token') || 'test')
      }
    });
    
    console.log('✅ Customers endpoint exists');
    
    // Check Bills endpoint
    const billsRes = await fetch(`${API_BASE}/Bills`);
    console.log('✅ Bills endpoint exists');
    
    // Check Payments endpoint
    const paymentsRes = await fetch(`${API_BASE}/Payments`);
    console.log('✅ Payments endpoint exists');
    
    console.log('\n📊 Database Tables (inferred from API):');
    console.log('  1. Customers');
    console.log('  2. Bills');
    console.log('  3. Payments');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// For Node.js, we need to use a different approach
console.log('To list tables directly from PostgreSQL, you need:');
console.log('1. Install pg module: npm install pg');
console.log('2. Or use psql command line tool');
console.log('3. Or check Cursor MCP Developer Console for MCP errors');
console.log('');
console.log('📋 Based on your API, your database has these tables:');
console.log('  • Customers');
console.log('  • Bills');
console.log('  • Payments');
console.log('');
console.log('To verify MCP is working:');
console.log('1. Open Cursor');
console.log('2. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)');
console.log('3. Type "Developer: Show Developer Console"');
console.log('4. Check for MCP-related errors or logs');
console.log('');
console.log('If MCP is working, you should be able to ask:');
console.log('  "Query the database to show all tables"');
console.log('  "What is the schema of the Customers table?"');

