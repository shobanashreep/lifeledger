-- ============================================================
-- LifeLedger Database Schema (MySQL 8+)
-- ============================================================

CREATE DATABASE IF NOT EXISTS lifeledger
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lifeledger;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  full_name         VARCHAR(120)  NOT NULL,
  email             VARCHAR(150)  NOT NULL UNIQUE,
  password_hash     VARCHAR(255)  NOT NULL,
  phone             VARCHAR(20)   NULL,
  avatar_url        VARCHAR(255)  NULL,
  email_notifications  TINYINT(1) NOT NULL DEFAULT 1,
  reminder_days_before INT        NOT NULL DEFAULT 7,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- categories  (system defaults + user-created custom categories)
-- ------------------------------------------------------------
CREATE TABLE categories (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NULL,                 -- NULL = system default category
  name          VARCHAR(80)   NOT NULL,
  icon          VARCHAR(50)   NOT NULL DEFAULT 'folder',
  color         VARCHAR(20)   NOT NULL DEFAULT '#6366f1',
  is_system     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_category_name (user_id, name),
  INDEX idx_categories_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- life_items  (the core records: passport, insurance, etc.)
-- ------------------------------------------------------------
CREATE TABLE life_items (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  user_id         CHAR(36)      NOT NULL,
  category_id     CHAR(36)      NULL,
  title           VARCHAR(150)  NOT NULL,
  description     TEXT          NULL,
  provider        VARCHAR(150)  NULL,
  reference_number VARCHAR(150) NULL,
  start_date      DATE          NULL,
  expiry_date     DATE          NULL,
  cost            DECIMAL(12,2) NULL,
  currency        VARCHAR(10)   NOT NULL DEFAULT 'INR',
  reminder_enabled TINYINT(1)   NOT NULL DEFAULT 1,
  reminder_days_before INT      NOT NULL DEFAULT 7,
  status          ENUM('active','expiring_soon','expired','archived')
                                NOT NULL DEFAULT 'active',
  notes           TEXT          NULL,
  is_deleted      TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_life_items_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_life_items_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_life_items_user (user_id),
  INDEX idx_life_items_expiry (expiry_date),
  INDEX idx_life_items_status (status),
  INDEX idx_life_items_category (category_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- documents  (uploaded files attached to a life_item)
-- ------------------------------------------------------------
CREATE TABLE documents (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  life_item_id  CHAR(36)      NOT NULL,
  file_name     VARCHAR(255)  NOT NULL,
  original_name VARCHAR(255)  NOT NULL,
  file_path     VARCHAR(500)  NOT NULL,
  file_type     VARCHAR(100)  NOT NULL,
  file_size     BIGINT        NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_item
    FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE,
  INDEX idx_documents_item (life_item_id),
  INDEX idx_documents_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- reminders
-- ------------------------------------------------------------
CREATE TABLE reminders (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  life_item_id  CHAR(36)      NOT NULL,
  remind_at     DATE          NOT NULL,
  message       VARCHAR(255)  NOT NULL,
  is_sent       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminders_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_item
    FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE,
  INDEX idx_reminders_user (user_id),
  INDEX idx_reminders_date (remind_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  life_item_id  CHAR(36)      NULL,
  title         VARCHAR(150)  NOT NULL,
  message       VARCHAR(500)  NOT NULL,
  type          ENUM('expiry','reminder','system','document','activity')
                                NOT NULL DEFAULT 'system',
  is_read       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_item
    FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- activity_logs
-- ------------------------------------------------------------
CREATE TABLE activity_logs (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  action        ENUM('created','updated','deleted','uploaded_document',
                      'deleted_document','created_reminder','login','logout')
                                NOT NULL,
  entity_type   VARCHAR(50)   NOT NULL,     -- e.g. 'life_item', 'document'
  entity_id     CHAR(36)      NULL,
  description   VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;
