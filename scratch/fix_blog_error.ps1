$path = "src/pages/blog.html"
$content = Get-Content $path -Raw
$content = $content -replace "document.getElementById\('navbar-placeholder'\).innerHTML = renderNavbar\('blog'\);", "const nb = document.getElementById('navbar-placeholder'); if (nb) nb.innerHTML = renderNavbar('blog');"
$content = $content -replace "document.getElementById\('footer-placeholder'\).innerHTML = renderFooter\(\);", "const fb = document.getElementById('footer-placeholder'); if (fb) fb.innerHTML = renderFooter();"
[System.IO.File]::WriteAllText((Resolve-Path $path), $content, [System.Text.Encoding]::UTF8)
