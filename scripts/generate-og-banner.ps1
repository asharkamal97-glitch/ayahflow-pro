Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ashar\.gemini\antigravity\brain\f9f80a0b-acf8-4400-8233-7db1b46b3cb4\.user_uploaded\media_1792445361011_9ba1a205.jpg"
$destPath = "C:\Users\ashar\Downloads\REA\quranify\public\og-banner.png"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source Image Dimensions: $($srcImg.Width) x $($srcImg.Height)"

$targetWidth = 1200
$targetHeight = 630

$destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($destBmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$srcRatio = $srcImg.Width / $srcImg.Height
$targetRatio = $targetWidth / $targetHeight

# Crop / fill calculation to ensure no distortion while preserving center
if ($srcRatio -gt $targetRatio) {
    # Source is wider than target
    $cropWidth = [int]($srcImg.Height * $targetRatio)
    $cropHeight = $srcImg.Height
    $cropX = [int](($srcImg.Width - $cropWidth) / 2)
    $cropY = 0
} else {
    # Source is taller than target
    $cropWidth = $srcImg.Width
    $cropHeight = [int]($srcImg.Width / $targetRatio)
    $cropX = 0
    $cropY = [int](($srcImg.Height - $cropHeight) / 2)
}

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropWidth, $cropHeight)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)

$graphics.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$graphics.Dispose()
$srcImg.Dispose()

$destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$destBmp.Dispose()

$result = [System.Drawing.Image]::FromFile($destPath)
Write-Host "Destination Image Dimensions: $($result.Width) x $($result.Height) at $destPath"
$result.Dispose()
