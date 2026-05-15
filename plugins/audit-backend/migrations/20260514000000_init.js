// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const isPg = knex.client.config.client === 'pg';

  if (isPg) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  }

  await knex.schema.createTable('audit_events', table => {
    const idCol = table.uuid('id').primary();
    if (isPg) {
      idCol.defaultTo(knex.raw('gen_random_uuid()'));
    }
    table.timestamp('ts', { useTz: true }).notNullable();
    table.text('event_id').notNullable();
    table.text('severity').notNullable();
    table.text('status').notNullable();
    table.text('actor_ref');
    table.text('plugin_id').notNullable();
    table.text('source_ip');
    table.text('user_agent');
    table.text('http_method');
    table.text('http_path');
    if (isPg) {
      table.jsonb('meta').notNullable().defaultTo('{}');
    } else {
      table.json('meta').notNullable().defaultTo('{}');
    }
    table.text('error_message');
  });

  await knex.schema.alterTable('audit_events', table => {
    table.index(['ts'], 'audit_events_ts_desc_idx');
    table.index(['actor_ref'], 'audit_events_actor_idx');
    table.index(['event_id'], 'audit_events_event_id_idx');
    table.index(['plugin_id'], 'audit_events_plugin_id_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('audit_events');
};
