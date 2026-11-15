<?php

    $host = "localhost";
    $username = "root";
    $password = "";
    $database = "my_database";

    try{
        // Connect to MySQL server
        $conn = mysqli_connect($host, $username, $password);

        // Check server connection
        if (!$conn) {
            die("MySQL connection failed: " . mysqli_connect_error());
        }

        // Create database if it does not exist
        $sql = "CREATE DATABASE IF NOT EXISTS `$database`";

        if (!mysqli_query($conn, $sql)) {
            die("Database creation failed: " . mysqli_error($conn));
        }

        // Select the database
        if (!mysqli_select_db($conn, $database)) {
            die("Database selection failed: " . mysqli_error($conn));
        }
    }
    catch(\Exception $e)
    {
        die($e->getMessage());
    }