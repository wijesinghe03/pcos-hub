<?php

namespace App\Utils;

class Logger
{
    private static $pdo = null;

    private static function init()
    {
        if (self::$pdo === null) {
            $host = 'localhost';
            $db   = 'pcos_hub';
            $user = 'root';
            $pass = '';
            $charset = 'utf8mb4';
            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$pdo = new \PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                // Fail silently or log to file
            }
        }
    }

    public static function log($category, $severity, $message, $user = 'System')
    {
        self::init();
        if (self::$pdo === null) {
            return;
        }

        $log_id = 'LOG-' . mt_rand(1000, 9999);
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        try {
            $stmt = self::$pdo->prepare("INSERT INTO system_logs (log_id, category, severity, message, user_identifier, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$log_id, $category, $severity, $message, $user, $ip]);
        } catch (\Exception $e) {
            // Ignore
        }
    }
}
