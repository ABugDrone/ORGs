# NSIS — Windows Installer Skill Reference

Source: https://nsis.sourceforge.io/Docs/

---

## What is NSIS?

NSIS (Nullsoft Scriptable Install System) is a free, open-source tool for creating Windows installers. It compiles a script + files into a single `.exe` installer. electron-builder uses NSIS internally to produce Windows `.exe` installers.

Key facts:
- Adds only ~34KB overhead to the installer
- Produces a single self-contained `.exe`
- Supports install/uninstall, registry, shortcuts, environment variables
- Used by electron-builder for `target: "nsis"`

---

## Script Structure

A `.nsi` script has three main parts:

```nsi
; 1. Installer Attributes — name, output file, install dir
Name "ORGs"
OutFile "ORGs-Setup.exe"
InstallDir "$PROGRAMFILES\ORGs"

; 2. Pages — wizard steps shown to user
Page directory    ; let user choose install dir
Page instfiles    ; show progress

; 3. Sections — what gets installed
Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\*.*"
  File /r "dist-electron\*.*"
  
  ; Create shortcut
  CreateShortcut "$DESKTOP\ORGs.lnk" "$INSTDIR\ORGs.exe"
  
  ; Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Add to Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "DisplayName" "ORGs"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\ORGs.lnk"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs"
SectionEnd
```

---

## Key Commands

### File Operations
```nsi
File "myfile.exe"           ; include a single file
File /r "folder\*.*"        ; include folder recursively
SetOutPath "$INSTDIR"       ; set destination directory
```

### Registry
```nsi
WriteRegStr HKLM "Software\MyApp" "Version" "1.0"
ReadRegStr $0 HKLM "Software\MyApp" "Version"
DeleteRegKey HKLM "Software\MyApp"
```

### Shortcuts
```nsi
CreateShortcut "$DESKTOP\App.lnk" "$INSTDIR\App.exe"
CreateShortcut "$SMPROGRAMS\App\App.lnk" "$INSTDIR\App.exe"
```

### Variables & Constants
```nsi
$INSTDIR        ; installation directory
$PROGRAMFILES   ; C:\Program Files
$APPDATA        ; C:\Users\User\AppData\Roaming
$DESKTOP        ; Desktop path
$SMPROGRAMS     ; Start Menu\Programs
$TEMP           ; Temp directory
$WINDIR         ; C:\Windows
```

### Flow Control
```nsi
IfErrors label_error label_ok
MessageBox MB_OK "Installation complete!"
MessageBox MB_YESNO "Continue?" IDYES yes_label IDNO no_label
```

---

## electron-builder NSIS Config

electron-builder wraps NSIS. Key config options in `package.json`:

```json
"nsis": {
  "oneClick": false,              // false = show wizard, true = silent install
  "allowToChangeInstallationDirectory": true,
  "installerIcon": "build/icon.ico",
  "uninstallerIcon": "build/icon.ico",
  "installerHeaderIcon": "build/icon.ico",
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "shortcutName": "ORGs",
  "perMachine": false,            // false = per-user install (no admin needed)
  "allowElevation": true,
  "runAfterFinish": true,         // launch app after install
  "deleteAppDataOnUninstall": false
}
```

**`perMachine: false`** is important — installs to `%APPDATA%\Local\Programs\` instead of `Program Files`, so no admin rights needed.

---

## Why electron-builder NSIS Fails on Windows Without Admin

electron-builder downloads macOS code-signing tools (`winCodeSign`) even for Windows-only builds. These tools contain Unix symlinks that Windows can't extract without either:
1. **Developer Mode** enabled (Settings → System → For Developers)
2. **Running as Administrator**
3. **Pre-cached** tools from a previous successful build

The symlink error:
```
ERROR: Cannot create symbolic link: A required privilege is not held by the client.
```

This is a known electron-builder issue. The fix options:
- Enable Developer Mode (safe, reversible)
- Run terminal as Administrator
- Use `target: "portable"` instead of `"nsis"` (no code-signing tools needed)
- Use GitHub Actions (Linux/macOS runners don't have this issue)

---

## Portable vs NSIS Target

| Feature | `portable` | `nsis` |
|---------|-----------|--------|
| Output | Single `.exe` | Setup wizard `.exe` |
| Installation | Run directly | Installs to Program Files |
| Uninstaller | None | Yes (Add/Remove Programs) |
| Shortcuts | None | Desktop + Start Menu |
| Admin required | No | Optional (`perMachine`) |
| Code-signing tools | Not needed | Required (causes symlink issue) |
| Best for | Quick testing | Final distribution |

---

## Manual NSIS Script for ORGs (Alternative to electron-builder)

If electron-builder keeps failing, NSIS can be used directly:

1. Install NSIS from https://nsis.sourceforge.io/Download
2. Write `installer.nsi`:

```nsi
!include "MUI2.nsh"

Name "ORGs"
OutFile "ORGs-Setup-1.0.0-beta.exe"
InstallDir "$LOCALAPPDATA\Programs\ORGs"
InstallDirRegKey HKCU "Software\ORGs" ""
RequestExecutionLevel user   ; no admin needed

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "ORGs" SecMain
  SetOutPath "$INSTDIR"
  File /r "release\win-unpacked\*.*"
  
  WriteRegStr HKCU "Software\ORGs" "" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  CreateDirectory "$SMPROGRAMS\ORGs"
  CreateShortcut "$SMPROGRAMS\ORGs\ORGs.lnk" "$INSTDIR\ORGs.exe"
  CreateShortcut "$DESKTOP\ORGs.lnk" "$INSTDIR\ORGs.exe"
  
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "DisplayName" "ORGs - Organizational Reports Gathering System"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "Publisher" "DroneBug Technologies"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs" \
    "DisplayVersion" "1.0.0-beta"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\ORGs.lnk"
  Delete "$SMPROGRAMS\ORGs\ORGs.lnk"
  RMDir "$SMPROGRAMS\ORGs"
  DeleteRegKey HKCU "Software\ORGs"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ORGs"
SectionEnd
```

3. Compile: `makensis installer.nsi`
4. Output: `ORGs-Setup-1.0.0-beta.exe`

This approach bypasses electron-builder entirely and works without admin or Developer Mode.

---

*Content sourced from [nsis.sourceforge.io/Docs](https://nsis.sourceforge.io/Docs/) — paraphrased for compliance.*
