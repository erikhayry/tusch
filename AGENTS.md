# Agent instructions

## Zod-first data types

- For every application-owned runtime data shape—domain entities, route data,
  form and action inputs/results, persisted snapshots, API payloads, and DTOs—
  define a Zod schema as the source of truth.
- Derive TypeScript types from that schema with `z.infer`, `z.input`, or
  `z.output`. Do not maintain a parallel handwritten interface or type alias
  for the same data shape.
- Use `z.input` for values before schema transforms and `z.output` for parsed
  values after transforms.
- Validate untrusted data at boundaries, including form submissions,
  persisted storage, API requests, route inputs, and external service responses.
- Reuse and compose existing schemas rather than duplicating their fields.
- Keep framework- and library-owned types as imported TypeScript types. Do not
  create Zod schemas solely to mirror framework callbacks, generic utility
  types, Svelte snippets, or HTML attribute types.
- When component props combine framework attributes with app-owned data, schema
  the app-owned data fields and retain the framework type for its attributes.
