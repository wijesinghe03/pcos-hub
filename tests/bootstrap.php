<?php

/**
 * Test Bootstrap for PCOS-Hub
 * Sets up a mock database environment for Unit tests.
 */

define('TEST_ENVIRONMENT', true);

// Setup an in-memory SQLite database for testing if MySQL is unavailable
try {
    $pdo = new \PDO('sqlite::memory:');
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

    // Create minimal schema for tests if needed
    $pdo->exec("CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY,
        full_name TEXT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        status TEXT DEFAULT 'active'
    )");
} catch (\Exception $e) {
    die("Could not initialize test database: " . $e->getMessage());
}
