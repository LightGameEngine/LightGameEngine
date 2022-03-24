Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run chr(34) & WshShell.CurrentDirectory & "\\Start Light.cmd" & Chr(34), 0
Set WshShell = Nothing