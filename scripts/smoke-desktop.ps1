$ErrorActionPreference = 'Stop'
$appPath = Join-Path $PSScriptRoot '../release/win-unpacked/CognitiveGeo.exe'
if (!(Test-Path -LiteralPath $appPath)) { throw 'Packaged CognitiveGeo executable is missing.' }
foreach ($mode in @('standard','compatibility')) {
  $profile = Join-Path $env:RUNNER_TEMP ('cognitivegeo-smoke-' + $mode + '-' + [guid]::NewGuid().ToString('N'))
  $stdout = Join-Path $env:RUNNER_TEMP ('cognitivegeo-' + $mode + '.log')
  $stderr = Join-Path $env:RUNNER_TEMP ('cognitivegeo-' + $mode + '-error.log')
  $arguments = @('--smoke-test', ('--user-data-dir="' + $profile + '"'))
  if ($mode -eq 'compatibility') { $arguments += '--compatibility-mode' }
  $process = Start-Process -FilePath $appPath -ArgumentList $arguments -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  if (!$process.WaitForExit(90000)) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue; throw "Packaged app timed out in $mode mode." }
  if (Test-Path -LiteralPath $stdout) { Get-Content -LiteralPath $stdout }
  if ($process.ExitCode -ne 0) { if (Test-Path -LiteralPath $stderr) { Get-Content -LiteralPath $stderr }; throw "Packaged app failed in $mode mode ($($process.ExitCode))." }
  $report = Get-Content -LiteralPath $stdout | Where-Object { $_ -match '^\{"smoke":' } | Select-Object -Last 1 | ConvertFrom-Json
  if (!$report -or !$report.smoke.desktop -or $report.smoke.navigation -ne 15) { throw 'Packaged workspace did not initialize.' }
  if ($mode -eq 'compatibility' -and !$report.smoke.fallback) { throw 'Compatibility mode did not activate.' }
}
