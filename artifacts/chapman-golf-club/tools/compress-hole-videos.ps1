# Compresses the hole fly-over videos for the website.
#
# Run this from the project folder (the one that contains "src" and "public"):
#   .\tools\compress-hole-videos.ps1 -Source "C:\Users\think PAD\Desktop\GreyCode Tech"
#
# It reads 1.mp4 ... 9.mp4 from -Source and writes, for each hole:
#   public\videos\hole-N.mp4   (720p, web-friendly, sound removed)
#   public\videos\hole-N.jpg   (cover image shown before the video plays)
#
# Needs ffmpeg. Install once with:  winget install Gyan.FFmpeg   (then reopen PowerShell)
param(
  [string]$Source = "$HOME\Desktop\GreyCode Tech",
  [int]$Crf = 28
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Host "ffmpeg was not found. Run:  winget install Gyan.FFmpeg   then close and reopen PowerShell." -ForegroundColor Yellow
  exit 1
}

$out = Join-Path (Get-Location) 'public\videos'
New-Item -ItemType Directory -Force -Path $out | Out-Null

foreach ($n in 1..9) {
  $in = Join-Path $Source "$n.mp4"
  if (-not (Test-Path $in)) { Write-Host "Skipping hole ${n}: $in not found" -ForegroundColor Yellow; continue }
  Write-Host "Hole ${n}: compressing..."
  ffmpeg -hide_banner -loglevel error -y -i $in -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset slow -crf $Crf -pix_fmt yuv420p -an -movflags +faststart (Join-Path $out "hole-$n.mp4")
  ffmpeg -hide_banner -loglevel error -y -ss 1 -i $in -frames:v 1 -vf "scale=-2:'min(720,ih)'" -q:v 4 (Join-Path $out "hole-$n.jpg")
  $mb = [math]::Round((Get-Item (Join-Path $out "hole-$n.mp4")).Length / 1MB, 1)
  Write-Host "  -> hole-$n.mp4 is $mb MB"
}
Write-Host "Done. Watch each file in public\videos before committing." -ForegroundColor Green
