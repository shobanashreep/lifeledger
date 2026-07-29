-- ============================================================
-- LifeLedger — Seed Data (system default categories)
-- ============================================================
USE lifeledger;

INSERT INTO categories (id, user_id, name, icon, color, is_system) VALUES
(UUID(), NULL, 'Passport',            'book-user',        '#6366f1', 1),
(UUID(), NULL, 'Driving License',     'car-front',         '#22c55e', 1),
(UUID(), NULL, 'Vehicle Insurance',   'shield-check',       '#f59e0b', 1),
(UUID(), NULL, 'Health Insurance',    'heart-pulse',        '#ef4444', 1),
(UUID(), NULL, 'Warranty',            'badge-check',        '#0ea5e9', 1),
(UUID(), NULL, 'Rental Agreement',    'home',               '#8b5cf6', 1),
(UUID(), NULL, 'Subscription',        'refresh-cw',         '#ec4899', 1),
(UUID(), NULL, 'Membership',          'id-card',            '#14b8a6', 1),
(UUID(), NULL, 'Certificate',         'graduation-cap',     '#f97316', 1),
(UUID(), NULL, 'Bill',                'receipt',            '#84cc16', 1),
(UUID(), NULL, 'Appliance Service',   'wrench',             '#64748b', 1),
(UUID(), NULL, 'Other',               'folder',             '#6b7280', 1);
