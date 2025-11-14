<# 
 bootstrap-workbench.ps1
 Creates Workbench (/workbench) structure and public HTML carcass stubs for IPAN.
 Run from the ROOT of your repo in Windows PowerShell:
   powershell -ExecutionPolicy Bypass -NoProfile -File .\bootstrap-workbench.ps1
 Or just right-click -> "Run with PowerShell" while opened at repo root.
#>

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "—— $msg" -ForegroundColor Cyan }
function Ensure-Dir($path) {
  if (-not (Test-Path -Path $path -PathType Container)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    Write-Host "Created dir: $path" -ForegroundColor Green
  } else {
    Write-Host "Exists dir : $path" -ForegroundColor DarkGray
  }
}
function Ensure-File($path, $content) {
  if (-not (Test-Path -Path $path -PathType Leaf)) {
    $content | Set-Content -Path $path -Encoding UTF8
    Write-Host "Created file: $path" -ForegroundColor Green
  } else {
    Write-Host "Exists file : $path (skipped)" -ForegroundColor DarkGray
  }
}
function Append-LinesIfMissing($path, [string[]]$lines) {
  if (-not (Test-Path $path)) {
    $lines -join "`n" | Set-Content -Path $path -Encoding UTF8
    Write-Host "Created file: $path" -ForegroundColor Green
    return
  }
  $text = Get-Content -Path $path -Raw -Encoding UTF8
  $added = 0
  foreach ($line in $lines) {
    if ($text -notmatch [regex]::Escape($line)) {
      Add-Content -Path $path -Value $line
      $added++
    }
  }
  if ($added -gt 0) {
    Write-Host "Updated $path (+$added line(s))" -ForegroundColor Green
  } else {
    Write-Host "No changes to $path" -ForegroundColor DarkGray
  }
}

Write-Step "Detecting frontend folder"
$frontendIpan = "frontend\ipan"
if (-not (Test-Path $frontendIpan -PathType Container)) {
  Write-Host "Warning: $frontendIpan not found. Will create it." -ForegroundColor Yellow
  Ensure-Dir $frontendIpan
  Ensure-Dir "$frontendIpan\src"
  Ensure-Dir "$frontendIpan\public"
}

Write-Step "Creating Workbench directories"
Ensure-Dir "workbench"
Ensure-Dir "workbench\prototypes\carcass\v1"
Ensure-Dir "workbench\frames"
Ensure-Dir "workbench\drafts"
# keep marker so drafts/ exists even if empty
Ensure-File "workbench\drafts\.gitkeep" ""

Write-Step "Creating Workbench files"
$providers = @'
import React from "react";
export const DevProviders: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;
export default DevProviders;
'@
Ensure-File "workbench\providers.dev.tsx" $providers

$frame = @'
import React from "react";
export const FrameShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div style={{display:"grid",gridTemplateRows:"48px 1fr",height:"100vh",fontFamily:"Inter,system-ui,Arial"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderBottom:"1px solid #3c3c3c"}}>
      <strong>Workbench</strong><span style={{opacity:.6}}>— изолированное превью</span>
    </div>
    <div style={{minHeight:0}}>{children}</div>
  </div>
);
export default FrameShell;
'@
Ensure-File "workbench\frames\FrameShell.tsx" $frame

$carcassPreview = @'
import React from "react";
export default function CarcassPreview() {
  return (
    <iframe
      title="Carcass HTML"
      src="/lab/carcass/index.html"
      style={{border:0,width:"100%",height:"100%"}}
    />
  );
}
'@
Ensure-File "workbench\prototypes\carcass\v1\CarcassPreview.play.tsx" $carcassPreview

$registry = @'
import React from "react";
import CarcassPreview from "./prototypes/carcass/v1/CarcassPreview.play";
export type Proto = { id: string; title: string; component: React.FC };
export const registry: Proto[] = [
  { id: "carcass-v1", title: "Carcass / v1 (HTML iframe)", component: CarcassPreview },
];
'@
Ensure-File "workbench\registry.ts" $registry

$app = @'
import React, { useMemo } from "react";
import { registry } from "./registry";
import DevProviders from "./providers.dev";
import FrameShell from "./frames/FrameShell";

export default function WorkbenchApp() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || registry[0]?.id;
  const Active = useMemo(
    () => registry.find(r => r.id === id)?.component ?? (() => <div>Not found</div>),
    [id]
  );

  return (
    <DevProviders>
      <FrameShell>
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",height:"100%"}}>
          <aside style={{borderRight:"1px solid #3c3c3c",padding:8,overflow:"auto"}}>
            {registry.map(r => (
              <div key={r.id} style={{padding:"6px 8px"}}>
                <a href={`/_lab?id=${encodeURIComponent(r.id)}`} style={{textDecoration:"none"}}>
                  {r.title}
                </a>
              </div>
            ))}
          </aside>
          <main style={{minHeight:0}}><Active/></main>
        </div>
      </FrameShell>
    </DevProviders>
  );
}
'@
Ensure-File "workbench\WorkbenchApp.tsx" $app

Write-Step "Public lab carcass stubs"
Ensure-Dir "$frontendIpan\public\lab\carcass"

$stubHtml = @'
<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Carcass Stub</title>
<style>body,html{margin:0;height:100%} .grid{display:grid;grid-template-columns:240px 1fr;grid-template-rows:56px 1fr;height:100%} header,aside,main{outline:1px solid #3c3c3c}</style>
</head><body>
<div class="grid">
  <header>Header (stub)</header>
  <aside>Left (stub)</aside>
  <main style="padding:16px">Main (stub). Замените этот файл на ваш реальный HTML-каркас.</main>
</div>
</body></html>
'@
Ensure-File "$frontendIpan\public\lab\carcass\index.html" $stubHtml

$stubJson = @'
{ "version": "stub", "notes": "Положите сюда ваш carcass.config.json" }
'@
Ensure-File "$frontendIpan\public\lab\carcass\carcass.config.json" $stubJson

Write-Step "Patch .gitignore with workbench rules (if needed)"
Append-LinesIfMissing ".gitignore" @(
"workbench/drafts/",
"workbench/**/_snapshots/"
)

Write-Host "`n✅ Done. Next: add dev route '/_lab' in your router to render workbench/WorkbenchApp.tsx." -ForegroundColor Green
