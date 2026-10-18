$ErrorActionPreference = 'Stop'

$androidDir = $PSScriptRoot
$repoDir = Split-Path -Parent $androidDir
$keystorePath = 'C:\Users\ashar\ayahflow-upload.jks'
$propertiesPath = Join-Path $androidDir 'key.properties'
$bundlePath = Join-Path $androidDir 'app\build\outputs\bundle\release\app-release.aab'

if (-not (Test-Path -LiteralPath $keystorePath -PathType Leaf)) {
    throw 'Upload keystore was not found at C:\Users\ashar\ayahflow-upload.jks.'
}
if (Test-Path -LiteralPath $propertiesPath) {
    throw 'android/key.properties already exists. It was left untouched; review it locally before continuing.'
}

$ignored = & git -C $repoDir check-ignore --quiet -- android/key.properties
if ($LASTEXITCODE -ne 0) {
    throw 'android/key.properties is not confirmed Git-ignored. No credentials were written.'
}

$keytool = (Get-Command keytool.exe -ErrorAction Stop).Source
$jarsigner = (Get-Command jarsigner.exe -ErrorAction Stop).Source

function ConvertFrom-SecurePrompt([string] $Prompt) {
    $secureValue = Read-Host -Prompt $Prompt -AsSecureString
    if ($secureValue.Length -eq 0) {
        throw 'A password was left blank. No signing configuration was written.'
    }
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function ConvertTo-PropertiesValue([string] $Value) {
    $builder = [System.Text.StringBuilder]::new()
    foreach ($character in $Value.ToCharArray()) {
        switch ([int] $character) {
            9  { [void] $builder.Append('\t'); continue }
            10 { [void] $builder.Append('\n'); continue }
            12 { [void] $builder.Append('\f'); continue }
            13 { [void] $builder.Append('\r'); continue }
            32 { [void] $builder.Append('\ '); continue }
            33 { [void] $builder.Append('\!'); continue }
            35 { [void] $builder.Append('\#'); continue }
            58 { [void] $builder.Append('\:'); continue }
            61 { [void] $builder.Append('\='); continue }
            92 { [void] $builder.Append('\\'); continue }
            default { [void] $builder.Append($character) }
        }
    }
    return $builder.ToString()
}

$storePassword = $null
$keyPassword = $null
$privateKeyAliases = @()
try {
    $storePassword = ConvertFrom-SecurePrompt 'Enter the upload keystore password (input is hidden)'
    $env:AYAHFLOW_KEYSTORE_PASSWORD = $storePassword

    $listing = & $keytool '-J-Duser.language=en' '-J-Duser.country=US' -list -v -keystore $keystorePath '-storepass:env' AYAHFLOW_KEYSTORE_PASSWORD 2>&1
    $keytoolExitCode = $LASTEXITCODE
    if ($keytoolExitCode -ne 0) {
        throw 'Keystore verification failed. Check the password locally; no password was displayed.'
    }

    $currentAlias = $null
    foreach ($line in $listing) {
        if ([string] $line -match '^Alias name:\s*(.+)$') {
            $currentAlias = $Matches[1].Trim()
        }
        elseif ([string] $line -match '^Entry type:\s*PrivateKeyEntry\s*$' -and $currentAlias) {
            $privateKeyAliases += $currentAlias
        }
    }
    $privateKeyAliases = @($privateKeyAliases | Select-Object -Unique)
    if ($privateKeyAliases.Count -eq 0) {
        throw 'The keystore has no private-key entry. No signing configuration was written.'
    }

    if ($privateKeyAliases.Count -eq 1) {
        $alias = $privateKeyAliases[0]
    }
    else {
        Write-Host 'Private-key aliases found:'
        $privateKeyAliases | ForEach-Object { Write-Host "  $_" }
        $alias = Read-Host 'Enter the alias to use'
        if ($privateKeyAliases -notcontains $alias) {
            throw 'The selected alias is not a private-key alias in this keystore.'
        }
    }

    Write-Host "Verified private-key alias: $alias"
    $keyPassword = ConvertFrom-SecurePrompt 'Enter the private-key password (input is hidden)'

    $keystoreProperty = ConvertTo-PropertiesValue ($keystorePath.Replace('\', '/'))
    $aliasProperty = ConvertTo-PropertiesValue $alias
    $storePasswordProperty = ConvertTo-PropertiesValue $storePassword
    $keyPasswordProperty = ConvertTo-PropertiesValue $keyPassword
    $propertyLines = @(
        "storeFile=$keystoreProperty",
        "storePassword=$storePasswordProperty",
        "keyAlias=$aliasProperty",
        "keyPassword=$keyPasswordProperty"
    )
    [System.IO.File]::WriteAllLines($propertiesPath, $propertyLines, [System.Text.UTF8Encoding]::new($false))

    Push-Location $androidDir
    try {
        & .\gradlew.bat bundleRelease
        if ($LASTEXITCODE -ne 0) {
            throw "Gradle release bundle build failed with exit code $LASTEXITCODE. key.properties was retained locally for correction."
        }
    }
    finally {
        Pop-Location
    }

    if (-not (Test-Path -LiteralPath $bundlePath -PathType Leaf)) {
        throw 'Gradle completed, but the expected release AAB was not found.'
    }

    $signatureCheck = & $jarsigner -verify -verbose -certs $bundlePath 2>&1
    $jarsignerExitCode = $LASTEXITCODE
    $signatureText = $signatureCheck -join "`n"
    if ($jarsignerExitCode -ne 0 -or $signatureText -notmatch '(?m)^jar verified\.$') {
        throw 'The release AAB did not pass jarsigner verification. Inspect the local build output; no credentials were printed.'
    }

    $bundle = Get-Item -LiteralPath $bundlePath
    Write-Host 'Release AAB signature verified.'
    Write-Host "AAB: $($bundle.FullName)"
    Write-Host "Size: $($bundle.Length) bytes"
    Write-Host 'Local signing properties were created and remain Git-ignored.'
}
finally {
    Remove-Item Env:AYAHFLOW_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
    $storePassword = $null
    $keyPassword = $null
    $listing = $null
    $signatureCheck = $null
    $signatureText = $null
}
