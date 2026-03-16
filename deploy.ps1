$src = "$PSScriptRoot\index.html"
$dst = "U:\web-vietnam\index.html"

Copy-Item $src $dst -Force
Write-Host "Deployed to $dst" -ForegroundColor Green
