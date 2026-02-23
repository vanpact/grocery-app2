# 003 Key Entities

Parsed from the Spec Kit `spec-template.md` Key Entities section.

## Source Mapping

- `specs/00-product-spec.md`
- `specs/20-architecture-contracts.md`

## Canonical Entities

### Household

- Represents the collaboration boundary for users, lists, and security scope.
- Key attributes: `name`, `createdBy`, `createdAt`, `updatedAt`.
- Relationship: one household has many memberships, lists, stores, items, and events.

### Membership

- Represents a user role assignment in a household.
- Key attributes: `householdId`, `userId`, `role`.
- Relationship: links users to households; role is committed `suggest` or `validate`.

### Store

- Represents aisle configuration context used for ordering shopping items.
- Key attributes: `householdId`, `name`, `aisleOrder`.
- Relationship: referenced by lists for store-specific ordering.

### List

- Represents a planning container (`menus`, `recurrents`, `occasionals`, `custom`).
- Key attributes: `householdId`, `type`, `name`, `recurrence`, `storeId`.
- Relationship: one list has many items.

### Item

- Represents one grocery line and its lifecycle state.
- Key attributes: `name`, `nameSlug`, `qty`, `unit`, `tags`, `aisleKey`, `status`, `version`.
- Relationship: belongs to one list and household; references `suggestedBy` and `validatedBy`.

### Event

- Represents immutable action history for diagnostics and verification evidence.
- Key attributes: `householdId`, `type`, `ref`, `payload`, `at`.
- Relationship: tracks actions performed on items/lists in a household scope.

## Canonical Lifecycle States

- `draft`
- `suggested`
- `validated`
- `bought`
