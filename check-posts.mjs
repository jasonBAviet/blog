import pg from 'pg';
const { Client } = pg;

// Kiểm tra n8n database xem có lưu bài không
const client = new Client({
  host: '103.166.182.190',
  port: 5432,
  database: 'n8n_inet641',
  user: 'n8n_inet641',
  password: 'n8n_inet641',
  ssl: false
});

try {
  await client.connect();
  console.log('Connected to n8n_inet641 DB\n');

  // Liệt kê tables
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE'
     ORDER BY table_name`
  );
  console.log('Tables in n8n DB:', tables.rows.map(r => r.table_name).join(', '));

  // Kiểm tra workflow executions gần đây
  try {
    const wf = await client.query(
      `SELECT id, "workflowId", "startedAt", "stoppedAt", status, mode
       FROM execution_entity
       WHERE "startedAt" >= '2026-01-01'
       ORDER BY "startedAt" DESC LIMIT 20`
    );
    console.log(`\nWorkflow executions from 2026: ${wf.rows.length}`);
    wf.rows.forEach(r => {
      console.log(`  [${r.status}] ${r.startedAt?.toISOString?.()?.slice(0,16)} wf:${r.workflowId}`);
    });
  } catch(e) {
    console.log('No execution_entity table or:', e.message);
  }

  // Kiểm tra workflow definitions
  try {
    const workflows = await client.query(
      `SELECT id, name, active FROM workflow_entity ORDER BY id`
    );
    console.log('\nWorkflows:', workflows.rows.map(r => `[${r.active?'ON':'OFF'}] ${r.name}`).join('\n  '));
  } catch(e) {
    console.log('No workflow_entity:', e.message);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await client.end();
}
