<?php

require_once '../config.php';

try {

    // Check whether demo table exists
    $check = mysqli_query($conn, "SHOW TABLES LIKE 'demo'");

    if (mysqli_num_rows($check) == 0) {

        // Create demo table
        $sql = "CREATE TABLE demo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        mysqli_query($conn, $sql);

        echo "<p style='color:green'>.......... Demo table created successfully.</p>";
    }

}
catch (\Exception $e) {

    die("Migration failed: " . $e->getMessage());

}