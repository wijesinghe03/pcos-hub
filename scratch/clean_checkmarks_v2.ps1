$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$root = "c:\xampp\htdocs\pcos-hub"
$exts = @("*.php", "*.html", "*.js", "*.css")

# Unicode characters for the symbols
$checkClean = [char]0x2713 # ✓
$checkGarbled = [char]0x00E2 + [char]0x0153 + [char]0x201C # âœ“

$patterns = @("$checkClean ", $checkClean, "$checkGarbled ", $checkGarbled)

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
            # Skip files that can't be read/written
        }
    }
}
