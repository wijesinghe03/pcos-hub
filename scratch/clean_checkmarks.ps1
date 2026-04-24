$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$root = "c:\xampp\htdocs\pcos-hub"
$exts = @("*.php", "*.html", "*.js", "*.css")
$patterns = @("âœ“ ", "âœ“", "✓ ", "✓")

foreach ($ext in $exts) {
    Get-ChildItem -Path $root -Filter $ext -Recurse | ForEach-Object {
        try {
            $content = [System.IO.File]::ReadAllText($_.FullName, $utf8NoBom)
            $modified = $false
            foreach ($p in $patterns) {
                if ($content.Contains($p)) {
                    $content = $content.Replace($p, "")
                    $modified = $true
                }
            }
            if ($modified) {
                [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
                Write-Host "Cleaned: $($_.FullName)"
            }
        } catch {
            Write-Warning "Could not process $($_.FullName)"
        }
    }
}
