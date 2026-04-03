-- ============================================================
-- EMAIL MARKETING PLATFORM — COMPLETE DATABASE SCHEMA
-- Version: Final (with Roles, Subscription, WhatsApp)
-- Run: mysql -u root -p < schema.sql
-- Default Login: admin@admin.com / Admin@123
-- ============================================================

CREATE DATABASE IF NOT EXISTS email_marketing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE email_marketing;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       ENUM('super_admin','business_admin','marketing_manager','viewer') NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO roles (name) VALUES
  ('super_admin'),
  ('business_admin'),
  ('marketing_manager'),
  ('viewer');

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password            VARCHAR(255) NOT NULL,
  role_id             INT NOT NULL,
  is_verified         BOOLEAN DEFAULT TRUE,
  is_active           BOOLEAN DEFAULT TRUE,
  reset_token         VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME    DEFAULT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Default Super Admin — password: Admin@123
INSERT IGNORE INTO users (name, email, password, role_id, is_verified) VALUES
('Super Admin', 'admin@admin.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 1, TRUE);

-- ============================================================
-- 3. ROLE PERMISSIONS
-- Super Admin isse control karta hai — kaun kya dekh sakta hai
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  role_id    INT NOT NULL,
  module     VARCHAR(50) NOT NULL,
  can_view   BOOLEAN DEFAULT TRUE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit   BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_module (role_id, module),
  FOREIGN KEY (role_id)    REFERENCES roles(id),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO role_permissions
  (role_id, module, can_view, can_create, can_edit, can_delete) VALUES
-- super_admin: full access
(1,'dashboard',   1,1,1,1), (1,'campaigns',   1,1,1,1),
(1,'contacts',    1,1,1,1), (1,'templates',   1,1,1,1),
(1,'automations', 1,1,1,1), (1,'analytics',   1,1,1,1),
(1,'users',       1,1,1,1), (1,'settings',    1,1,1,1),
(1,'whatsapp',    1,1,1,1), (1,'subscription',1,1,1,1),
-- business_admin
(2,'dashboard',   1,1,1,1), (2,'campaigns',   1,1,1,1),
(2,'contacts',    1,1,1,1), (2,'templates',   1,1,1,1),
(2,'automations', 1,1,1,1), (2,'analytics',   1,1,1,1),
(2,'users',       0,0,0,0), (2,'settings',    0,0,0,0),
(2,'whatsapp',    1,1,1,0), (2,'subscription',1,0,0,0),
-- marketing_manager
(3,'dashboard',   1,0,0,0), (3,'campaigns',   1,1,1,0),
(3,'contacts',    1,1,1,0), (3,'templates',   1,1,1,0),
(3,'automations', 1,1,1,0), (3,'analytics',   1,0,0,0),
(3,'users',       0,0,0,0), (3,'settings',    0,0,0,0),
(3,'whatsapp',    1,1,1,0), (3,'subscription',0,0,0,0),
-- viewer
(4,'dashboard',   1,0,0,0), (4,'campaigns',   1,0,0,0),
(4,'contacts',    1,0,0,0), (4,'templates',   1,0,0,0),
(4,'automations', 1,0,0,0), (4,'analytics',   1,0,0,0),
(4,'users',       0,0,0,0), (4,'settings',    0,0,0,0),
(4,'whatsapp',    1,0,0,0), (4,'subscription',0,0,0,0);

-- ============================================================
-- 4. SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS segments (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100),
  email      VARCHAR(150) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  tags       JSON,
  segment_id INT DEFAULT NULL,
  status     ENUM('active','unsubscribed','bounced') DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 6. TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(150) NOT NULL,
  subject      VARCHAR(255),
  html_content LONGTEXT NOT NULL,
  created_by   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 7. CAMPAIGNS (Email)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(150) NOT NULL,
  subject         VARCHAR(255) NOT NULL,
  template_id     INT NOT NULL,
  segment_id      INT DEFAULT NULL,
  status          ENUM('draft','pending_approval','scheduled','sending','sent','rejected')
                  DEFAULT 'draft',
  scheduled_at    DATETIME DEFAULT NULL,
  approved_by     INT DEFAULT NULL,
  rejected_reason TEXT DEFAULT NULL,
  total_sent      INT DEFAULT 0,
  created_by      INT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id),
  FOREIGN KEY (segment_id)  REFERENCES segments(id)  ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id)     ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

-- ============================================================
-- 8. CAMPAIGN CONTACTS
-- Kaun sa contact kaun si campaign mein tha
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  contact_id  INT NOT NULL,
  status      ENUM('pending','sent','failed') DEFAULT 'pending',
  sent_at     TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_cc (campaign_id, contact_id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id)  REFERENCES contacts(id)  ON DELETE CASCADE
);

-- ============================================================
-- 9. EMAIL EVENTS (Tracking)
-- Open, click, bounce, unsubscribe track karta hai
-- ============================================================
CREATE TABLE IF NOT EXISTS email_events (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  contact_id  INT NOT NULL,
  event_type  ENUM('sent','opened','clicked','bounced','unsubscribed') NOT NULL,
  link_url    VARCHAR(500) DEFAULT NULL,
  ip_address  VARCHAR(45)  DEFAULT NULL,
  user_agent  TEXT         DEFAULT NULL,
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id)  REFERENCES contacts(id)  ON DELETE CASCADE
);

-- ============================================================
-- 10. AUTOMATIONS
-- Trigger-based email sequences
-- ============================================================
CREATE TABLE IF NOT EXISTS automations (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  workflow_json JSON NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 11. UNSUBSCRIBE LIST
-- Global unsubscribe list — inhe email mat karo
-- ============================================================
CREATE TABLE IF NOT EXISTS unsubscribe_list (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(150) NOT NULL UNIQUE,
  unsubscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. SYSTEM SETTINGS
-- Key-value settings store
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_val TEXT,
  updated_by  INT DEFAULT NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 13. AUDIT LOGS
-- Kaun ne kya kiya — track karta hai
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT DEFAULT NULL,
  action_type ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  module      VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address  VARCHAR(45),
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 14. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  name                 VARCHAR(100) NOT NULL,
  price                DECIMAL(10,2) DEFAULT 0.00,
  duration             INT DEFAULT 30,
  max_contacts         INT DEFAULT 1000,
  max_emails_per_month INT DEFAULT 10000,
  features             JSON,
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO subscription_plans
  (name, price, duration, max_contacts, max_emails_per_month, features) VALUES
('Free',       0.00,    30,   500,   5000,
 '["Email Campaigns","Basic Analytics","1 User"]'),
('Basic',      999.00,  30,  2000,  20000,
 '["Email Campaigns","Analytics","5 Users","CSV Import"]'),
('Pro',        2999.00, 30, 10000, 100000,
 '["Email Campaigns","WhatsApp Campaigns","Advanced Analytics","20 Users","CSV Import","Automation"]'),
('Enterprise', 7999.00, 30, 99999, 999999,
 '["All Features","Unlimited Users","Priority Support","Custom Integration"]');

-- ============================================================
-- 15. SUBSCRIPTIONS
-- User ko kaunsa plan assign hai
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  plan_id     INT NOT NULL,
  status      ENUM('active','expired','cancelled') DEFAULT 'active',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- ============================================================
-- 16. WHATSAPP CONFIG (Green API)
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  instance_id  VARCHAR(100) NOT NULL,
  api_token    VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   INT DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 17. WHATSAPP CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(150) NOT NULL,
  message      TEXT NOT NULL,
  media_url    VARCHAR(500) DEFAULT NULL,
  segment_id   INT DEFAULT NULL,
  status       ENUM('draft','sending','sent','failed') DEFAULT 'draft',
  total_sent   INT DEFAULT 0,
  total_failed INT DEFAULT 0,
  scheduled_at DATETIME DEFAULT NULL,
  created_by   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 18. WHATSAPP LOGS
-- Har message ka record
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  contact_id  INT NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  status      ENUM('sent','failed') DEFAULT 'sent',
  error_msg   TEXT DEFAULT NULL,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id)  REFERENCES contacts(id)           ON DELETE CASCADE
);

-- ============================================================
-- INDEXES (Performance ke liye)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contacts_email     ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status    ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status   ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_schedule ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_events_camp  ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type  ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- ============================================================
-- DONE — Total 18 tables
-- ============================================================