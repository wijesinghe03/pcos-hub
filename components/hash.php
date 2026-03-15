<?php
// hash.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $plainPassword = $_POST["password"];

    // Generate bcrypt hash
    $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);

    echo "<h3>Plain Password:</h3> " . htmlspecialchars($plainPassword);
    echo "<br><br>";
    echo "<h3>Hashed Password:</h3> " . $hashedPassword;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Password Hash Generator</title>
</head>
<body>

    <h2>Generate Password Hash</h2>

    <form method="POST">
        <input type="text" name="password" placeholder="Enter password" required>
        <button type="submit">Generate</button>
    </form>

</body>
</html>
