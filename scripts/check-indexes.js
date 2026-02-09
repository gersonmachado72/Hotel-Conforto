const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDuplicateIndexes() {
  console.log('🔍 Verificando índices duplicados...');
  
  try {
    // 1. Conexão com banco
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'luck',
      password: process.env.DB_PASSWORD || '0397154#_!54179330_#!wsx_yhn#!',
      database: process.env.DB_NAME || 'hotel_conforto',
      port: process.env.DB_PORT || 3306
    });

    console.log(`📊 Banco: ${process.env.DB_NAME || 'hotel_conforto'}`);

    // 2. Query para encontrar índices duplicados
    const [rows] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME) as columns,
        COUNT(*) as total_duplicates
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND INDEX_NAME NOT IN ('PRIMARY')
        AND INDEX_NAME REGEXP '^[a-z]+_[0-9]+$'
      GROUP BY TABLE_NAME, INDEX_NAME
      ORDER BY TABLE_NAME, INDEX_NAME
    `, [process.env.DB_NAME || 'hotel_conforto']);

    // 3. Verificar resultados
    if (rows.length === 0) {
      console.log('✅ Nenhum índice duplicado encontrado!');
      await connection.end();
      return;
    }

    console.log(`⚠️  ENCONTRADOS ${rows.length} ÍNDICES DUPLICADOS:`);
    console.log('=' .repeat(50));
    
    let totalRemoved = 0;
    
    // 4. Processar cada índice duplicado
    for (const row of rows) {
      console.log(`📋 ${row.TABLE_NAME}.${row.INDEX_NAME}`);
      console.log(`   Colunas: ${row.columns}`);
      console.log(`   Duplicados: ${row.total_duplicates}`);

      try {
        await connection.execute(`DROP INDEX \`${row.INDEX_NAME}\` ON \`${row.TABLE_NAME}\``);
        console.log(`   ✅ REMOVIDO: ${row.INDEX_NAME}`);
        totalRemoved++;
      } catch (error) {
        console.log(`   ❌ ERRO ao remover ${row.INDEX_NAME}: ${error.message}`);
      }
      
      
      console.log('─'.repeat(50));
    }

    // 5. Resumo
    console.log('\n📈 RESUMO:');
    console.log(`   Total detectados: ${rows.length}`);
    console.log(`   Total removidos: ${totalRemoved}`);
    
    if (rows.length > 10) {
      console.log('\n🚨 ALERTA: Muitos índices duplicados!');
      console.log('   Considere desativar `alter: true` no sequelize.sync()');
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ ERRO na verificação:', error.message);
    process.exit(1);
  }
}

// 6. Verificar TODAS as tabelas para excesso de índices
async function checkAllTablesIndexCount() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'luck',
      password: process.env.DB_PASSWORD || '0397154#_!54179330_#!wsx_yhn#!',
      database: process.env.DB_NAME || 'hotel_conforto'
    });

    console.log('\n🔢 Verificando contagem total de índices por tabela...');
    
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COUNT(*) as total_indexes,
        SUM(CASE WHEN INDEX_NAME = 'PRIMARY' THEN 1 ELSE 0 END) as primary_keys,
        SUM(CASE WHEN NON_UNIQUE = 0 THEN 1 ELSE 0 END) as unique_indexes
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
      GROUP BY TABLE_NAME
      HAVING COUNT(*) > 10
      ORDER BY total_indexes DESC
    `, [process.env.DB_NAME || 'hotel_conforto']);

    if (tables.length > 0) {
      console.log('⚠️  TABELAS COM MUITOS ÍNDICES (>10):');
      console.log('=' .repeat(60));
      console.log('Tabela            | Total | Primary | Unique | Status');
      console.log('-' .repeat(60));
      
      for (const table of tables) {
        const status = table.total_indexes > 30 ? '🚨 CRÍTICO' : 
                      table.total_indexes > 20 ? '⚠️  ALTO' : 
                      '📊 ELEVADO';
        console.log(
          `${table.TABLE_NAME.padEnd(17)} | ${table.total_indexes.toString().padEnd(5)} | ${table.primary_keys.toString().padEnd(7)} | ${table.unique_indexes.toString().padEnd(6)} | ${status}`
        );
        
        // Alerta para limite do MySQL (64 índices)
        if (table.total_indexes > 60) {
          console.log(`   ⚠️  PERIGO: Próximo do limite de 64 índices do MySQL!`);
        }
        if (table.total_indexes > 50) {
          console.log(`   🔴 URGENTE: Mais de 50 índices, risco de ultrapassar 64!`);
        }
      }
    } else {
      console.log('✅ Todas as tabelas têm quantidade razoável de índices (<10)');
    }

    await connection.end();
    
  } catch (error) {
    console.error('Erro na verificação de tabelas:', error.message);
  }
}

// 7. Função para limpar TODOS os índices duplicados automaticamente
async function cleanupAllDuplicateIndexes() {
  console.log('🧹 Limpando TODOS os índices duplicados...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'luck',
      password: process.env.DB_PASSWORD || '0397154#_!54179330_#!wsx_yhn#!',
      database: process.env.DB_NAME || 'hotel_conforto'
    });

    // Primeiro, listar índices duplicados
    const [duplicates] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND INDEX_NAME NOT IN ('PRIMARY')
        AND INDEX_NAME REGEXP '^[a-z]+_[0-9]+$'
      GROUP BY TABLE_NAME, INDEX_NAME
    `, [process.env.DB_NAME || 'hotel_conforto']);

    if (duplicates.length === 0) {
      console.log('✅ Nenhum índice duplicado para limpar.');
      await connection.end();
      return;
    }

    // Remover cada índice duplicado
    let removedCount = 0;
    for (const dup of duplicates) {
      try {
        await connection.execute(`DROP INDEX \`${dup.INDEX_NAME}\` ON \`${dup.TABLE_NAME}\``);
        console.log(`   ✅ Removido: ${dup.TABLE_NAME}.${dup.INDEX_NAME} (${dup.columns})`);
        removedCount++;
      } catch (error) {
        console.log(`   ❌ Falha ao remover ${dup.INDEX_NAME}: ${error.message}`);
      }
    }

    console.log(`\n📊 RESULTADO: ${removedCount} índices duplicados removidos.`);
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
  }
}

// 8. Executar conforme parâmetro
async function main() {
  const command = process.argv[2] || 'check';
  
  switch (command) {
    case 'check':
      await checkDuplicateIndexes();
      await checkAllTablesIndexCount();
      break;
      
    case 'cleanup':
      await cleanupAllDuplicateIndexes();
      break;
      
    case 'all':
      await checkDuplicateIndexes();
      await checkAllTablesIndexCount();
      await cleanupAllDuplicateIndexes();
      break;
      
    default:
      console.log('Uso: node scripts/check-indexes.js [comando]');
      console.log('Comandos:');
      console.log('  check    - Verificar índices (padrão)');
      console.log('  cleanup  - Remover índices duplicados');
      console.log('  all      - Verificar e limpar');
      break;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

// Exportar funções para uso em outros arquivos
module.exports = {
  checkDuplicateIndexes,
  checkAllTablesIndexCount,
  cleanupAllDuplicateIndexes,
  main
};

