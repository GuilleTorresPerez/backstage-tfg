// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('audit_events', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
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
    table.jsonb('meta').notNullable().defaultTo('{}');
    table.text('error_message');
  });

  await knex.raw(
    'CREATE INDEX audit_events_ts_desc_idx ON audit_events (ts DESC)',
  );
  await knex.raw(
    'CREATE INDEX audit_events_actor_idx ON audit_events (actor_ref)',
  );
  await knex.raw(
    'CREATE INDEX audit_events_event_id_idx ON audit_events (event_id)',
  );
  await knex.raw(
    'CREATE INDEX audit_events_plugin_id_idx ON audit_events (plugin_id)',
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('audit_events');
};
