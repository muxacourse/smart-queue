<?php
    require_once '../config.php';

    // Get all migration files
    $migrations = glob(__DIR__ . '/*_migration.php');

    // Check if migration files exist
    if (!$migrations) {
        echo "No migration files found.";
    }

    // Execute each migration file
    foreach ($migrations as $migration) {

        require $migration;

    }

    echo "<p style='color:green'>.......... Done.</p>";