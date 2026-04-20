Set WshShell = CreateObject("WScript.Shell")
WshShell.Run Chr(34) & Replace(WScript.ScriptFullName, "start-ehr-lite.vbs", "start-app-headless.bat") & Chr(34), 0, False
