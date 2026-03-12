Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- Configuration ---
$script:ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:ServerPort = 5173
$script:ServerProcess = $null
$script:LogBuffer = New-Object System.Text.StringBuilder
$script:LocalIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual" } | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
if (-not $script:LocalIP) { $script:LocalIP = "unknown" }

# --- Helper Functions ---
function Kill-PortProcess {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc -and $proc.Id -ne 0) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 500
            }
        }
    } catch {}
}

function Is-ServerRunning {
    try {
        $connections = Get-NetTCPConnection -LocalPort $script:ServerPort -State Listen -ErrorAction SilentlyContinue
        return ($null -ne $connections -and @($connections).Count -gt 0)
    } catch {
        return $false
    }
}

function Update-Status {
    if (Is-ServerRunning) {
        $lblStatus.Text = "[ON] Server Running"
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(34, 197, 94)
        $btnStart.Enabled = $true
        $btnStop.Enabled = $true
        $btnBrowser.Enabled = $true
    } else {
        $lblStatus.Text = "[OFF] Server Stopped"
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(239, 68, 68)
        $btnStart.Enabled = $true
        $btnStop.Enabled = $false
        $btnBrowser.Enabled = $false
    }
}

# --- Main Window ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "HTML to PDF Server"
$form.Size = New-Object System.Drawing.Size(560, 460)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

# --- Title Label ---
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "HTML to PDF Server"
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::White
$lblTitle.AutoSize = $true
$lblTitle.Location = New-Object System.Drawing.Point(20, 15)
$form.Controls.Add($lblTitle)

# --- Status Label ---
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "[OFF] Server Stopped"
$lblStatus.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(239, 68, 68)
$lblStatus.AutoSize = $true
$lblStatus.Location = New-Object System.Drawing.Point(20, 55)
$form.Controls.Add($lblStatus)

# --- Button Panel ---
$btnStart = New-Object System.Windows.Forms.Button
$btnStart.Text = "[ > ] Start Server"
$btnStart.Size = New-Object System.Drawing.Size(160, 40)
$btnStart.Location = New-Object System.Drawing.Point(20, 95)
$btnStart.FlatStyle = "Flat"
$btnStart.BackColor = [System.Drawing.Color]::FromArgb(34, 197, 94)
$btnStart.ForeColor = [System.Drawing.Color]::White
$btnStart.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnStart.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnStart)

$btnStop = New-Object System.Windows.Forms.Button
$btnStop.Text = "[ = ] Stop Server"
$btnStop.Size = New-Object System.Drawing.Size(160, 40)
$btnStop.Location = New-Object System.Drawing.Point(190, 95)
$btnStop.FlatStyle = "Flat"
$btnStop.BackColor = [System.Drawing.Color]::FromArgb(239, 68, 68)
$btnStop.ForeColor = [System.Drawing.Color]::White
$btnStop.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnStop.Enabled = $false
$btnStop.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnStop)

$btnBrowser = New-Object System.Windows.Forms.Button
$btnBrowser.Text = "Open Browser"
$btnBrowser.Size = New-Object System.Drawing.Size(160, 40)
$btnBrowser.Location = New-Object System.Drawing.Point(360, 95)
$btnBrowser.FlatStyle = "Flat"
$btnBrowser.BackColor = [System.Drawing.Color]::FromArgb(59, 130, 246)
$btnBrowser.ForeColor = [System.Drawing.Color]::White
$btnBrowser.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnBrowser.Enabled = $false
$btnBrowser.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnBrowser)

# --- Network Info Label ---
$lblNetwork = New-Object System.Windows.Forms.Label
$lblNetwork.Text = "Local: http://localhost:$($script:ServerPort)  |  Network: http://$($script:LocalIP):$($script:ServerPort)"
$lblNetwork.Font = New-Object System.Drawing.Font("Consolas", 9)
$lblNetwork.ForeColor = [System.Drawing.Color]::FromArgb(120, 180, 255)
$lblNetwork.AutoSize = $true
$lblNetwork.Location = New-Object System.Drawing.Point(20, 148)
$form.Controls.Add($lblNetwork)

# --- Log Label ---
$lblLog = New-Object System.Windows.Forms.Label
$lblLog.Text = "Server Log"
$lblLog.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$lblLog.ForeColor = [System.Drawing.Color]::FromArgb(160, 160, 160)
$lblLog.AutoSize = $true
$lblLog.Location = New-Object System.Drawing.Point(20, 172)
$form.Controls.Add($lblLog)

# --- Log TextBox ---
$txtLog = New-Object System.Windows.Forms.TextBox
$txtLog.Multiline = $true
$txtLog.ReadOnly = $true
$txtLog.ScrollBars = "Vertical"
$txtLog.Size = New-Object System.Drawing.Size(510, 220)
$txtLog.Location = New-Object System.Drawing.Point(20, 192)
$txtLog.BackColor = [System.Drawing.Color]::FromArgb(20, 20, 20)
$txtLog.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 200)
$txtLog.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtLog.BorderStyle = "FixedSingle"
$form.Controls.Add($txtLog)

function Append-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    $txtLog.AppendText("[$timestamp] $Message`r`n")
    $txtLog.SelectionStart = $txtLog.Text.Length
    $txtLog.ScrollToCaret()
}

# --- Timer for status polling & log reading ---
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1500

$timer.Add_Tick({
    Update-Status

    # Read stdout from temp log file
    if ($script:LogFile -and (Test-Path $script:LogFile)) {
        try {
            $content = Get-Content $script:LogFile -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -ne $script:LastLogContent) {
                $newContent = if ($script:LastLogContent) {
                    $content.Substring($script:LastLogContent.Length)
                } else {
                    $content
                }
                $script:LastLogContent = $content
                $lines = $newContent -split "`n" | Where-Object { $_.Trim() -ne "" }
                foreach ($line in $lines) {
                    $clean = $line.Trim()
                    if ($clean) {
                        Append-Log $clean
                    }
                }
            }
        } catch {}
    }
})

# --- Start Button Handler ---
$btnStart.Add_Click({
    $btnStart.Enabled = $false
    Append-Log "Starting server..."

    # Kill existing processes on the port
    if (Is-ServerRunning) {
        Append-Log "Killing existing process on port $($script:ServerPort)..."
        Kill-PortProcess -Port $script:ServerPort
        Start-Sleep -Milliseconds 1000
    }

    # Setup temp log file
    $script:LogFile = [System.IO.Path]::GetTempFileName()
    $script:LastLogContent = ""

    # Start npm run dev as background process
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c npm run dev > `"$($script:LogFile)`" 2>&1"
    $psi.WorkingDirectory = $script:ProjectDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.WindowStyle = "Hidden"

    try {
        $script:ServerProcess = [System.Diagnostics.Process]::Start($psi)
        Append-Log "Server process started (PID: $($script:ServerProcess.Id))"
    } catch {
        Append-Log "ERROR: Failed to start server - $_"
        $btnStart.Enabled = $true
        return
    }

    # Wait a moment then check
    Start-Sleep -Milliseconds 2000
    Update-Status
    $btnStart.Enabled = $true
})

# --- Stop Button Handler ---
$btnStop.Add_Click({
    Append-Log "Stopping server..."

    Kill-PortProcess -Port $script:ServerPort

    # Also kill the cmd process we started
    if ($script:ServerProcess -and -not $script:ServerProcess.HasExited) {
        try {
            # Kill the process tree
            $parentId = $script:ServerProcess.Id
            Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $parentId } | ForEach-Object {
                Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            }
            Stop-Process -Id $parentId -Force -ErrorAction SilentlyContinue
        } catch {}
    }

    $script:ServerProcess = $null
    Start-Sleep -Milliseconds 1000
    Update-Status
    Append-Log "Server stopped."
})

# --- Browser Button Handler ---
$btnBrowser.Add_Click({
    Start-Process "http://localhost:$($script:ServerPort)"
    Append-Log "Opening browser..."
})

# --- Form Closing: cleanup ---
$form.Add_FormClosing({
    $timer.Stop()

    if ($script:ServerProcess -and -not $script:ServerProcess.HasExited) {
        $result = [System.Windows.Forms.MessageBox]::Show(
            "Server is still running. Stop it before closing?",
            "Confirm Exit",
            [System.Windows.Forms.MessageBoxButtons]::YesNoCancel,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )
        if ($result -eq "Yes") {
            Kill-PortProcess -Port $script:ServerPort
            if ($script:ServerProcess -and -not $script:ServerProcess.HasExited) {
                $parentId = $script:ServerProcess.Id
                Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $parentId } | ForEach-Object {
                    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
                }
                Stop-Process -Id $parentId -Force -ErrorAction SilentlyContinue
            }
        } elseif ($result -eq "Cancel") {
            $_.Cancel = $true
            $timer.Start()
            return
        }
    }

    # Clean up temp log file
    if ($script:LogFile -and (Test-Path $script:LogFile)) {
        Remove-Item $script:LogFile -Force -ErrorAction SilentlyContinue
    }
})

# --- Initial state ---
Append-Log "Launcher ready. Project: $($script:ProjectDir)"
if (Is-ServerRunning) {
    Append-Log "Detected server already running on port $($script:ServerPort)."
}
Update-Status
$timer.Start()

# --- Show GUI ---
[System.Windows.Forms.Application]::Run($form)


