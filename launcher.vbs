Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = scriptDir

' Check for node_modules and install if missing
If Not fso.FolderExists(scriptDir & "\node_modules") Then
    shell.Run "cmd /c cd /d """ & scriptDir & """ && npm install", 1, True
End If

' Launch PowerShell GUI without console window
shell.Run "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptDir & "\launcher.ps1""", 0, False
