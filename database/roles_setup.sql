-- Roles and Permissions Schema

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `perm_key` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perm_key` (`perm_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data
INSERT INTO `roles` (`name`, `description`, `icon`) VALUES
('Super Admin', 'Full system access and management.', '🔒'),
('Hospital Admin', 'Manage hospital details, staff, and appointments.', '🏥'),
('Diagnostic Staff', 'Upload and manage patient lab results and reports.', '💉'),
('Web Content Manager', 'Manage blog posts, FAQs, and public content.', '✍️'),
('Patient', 'Standard user with access to personal health data.', '👤');

INSERT INTO `permissions` (`perm_key`, `name`, `description`, `category`) VALUES
('view_users', 'View User Directory', 'Can browse and search all registered users.', 'User Management'),
('edit_users', 'Edit User Profiles', 'Can modify account details and reset passwords.', 'User Management'),
('delete_users', 'Delete/Suspend Users', 'Can deactivate accounts or remove user data.', 'User Management'),
('approve_hospitals', 'Approve New Hospitals', 'Review and verify partner facility applications.', 'Hospital Management'),
('edit_hospitals', 'Modify Partner Details', 'Update hospital information and capacity.', 'Hospital Management'),
('view_logs', 'Access System Logs', 'View detailed backend activity and security logs.', 'Advanced Settings'),
('edit_security', 'Modify Security Policies', 'Change MFA requirements and firewall rules.', 'Advanced Settings');

-- Assign all permissions to Super Admin (ID 1)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Assign subset to Hospital Admin (ID 2)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE category = 'Hospital Management';
