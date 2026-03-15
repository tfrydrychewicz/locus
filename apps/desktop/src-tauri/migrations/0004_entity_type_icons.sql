-- Replace emoji icons with Lucide icon names for built-in entity types
UPDATE entity_types SET icon = 'user'   WHERE slug = 'person';
UPDATE entity_types SET icon = 'folder' WHERE slug = 'project';
UPDATE entity_types SET icon = 'users'  WHERE slug = 'team';
UPDATE entity_types SET icon = 'scale'  WHERE slug = 'decision';
UPDATE entity_types SET icon = 'target' WHERE slug = 'okr';
