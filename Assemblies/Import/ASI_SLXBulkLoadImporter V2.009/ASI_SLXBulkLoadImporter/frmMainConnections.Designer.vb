<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmMainConnections
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        If disposing AndAlso components IsNot Nothing Then
            components.Dispose()
        End If
        MyBase.Dispose(disposing)
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(frmMainConnections))
        Me.Panel5 = New System.Windows.Forms.Panel
        Me.cmdOK = New System.Windows.Forms.Button
        Me.Label9 = New System.Windows.Forms.Label
        Me.txtSLXProviderConnection = New System.Windows.Forms.TextBox
        Me.Label10 = New System.Windows.Forms.Label
        Me.txtSLXNativeConnection = New System.Windows.Forms.TextBox
        Me.Label11 = New System.Windows.Forms.Label
        Me.txtSourceConnection = New System.Windows.Forms.TextBox
        Me.Panel4 = New System.Windows.Forms.Panel
        Me.TextBox6 = New System.Windows.Forms.TextBox
        Me.Label5 = New System.Windows.Forms.Label
        Me.cmdSLXProviderConnection = New System.Windows.Forms.Button
        Me.cmdSLXnativeConnection = New System.Windows.Forms.Button
        Me.cmdSearchSourceConnection = New System.Windows.Forms.Button
        Me.PictureBox12 = New System.Windows.Forms.PictureBox
        Me.PictureBox13 = New System.Windows.Forms.PictureBox
        Me.PictureBox14 = New System.Windows.Forms.PictureBox
        Me.PictureBox15 = New System.Windows.Forms.PictureBox
        Me.PictureBox11 = New System.Windows.Forms.PictureBox
        Me.Panel4.SuspendLayout()
        CType(Me.PictureBox12, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox13, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox14, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox15, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox11, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'Panel5
        '
        Me.Panel5.BackColor = System.Drawing.SystemColors.ControlDarkDark
        Me.Panel5.Location = New System.Drawing.Point(58, 162)
        Me.Panel5.Name = "Panel5"
        Me.Panel5.Size = New System.Drawing.Size(640, 1)
        Me.Panel5.TabIndex = 90
        '
        'cmdOK
        '
        Me.cmdOK.DialogResult = System.Windows.Forms.DialogResult.OK
        Me.cmdOK.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdOK.Location = New System.Drawing.Point(654, 256)
        Me.cmdOK.Name = "cmdOK"
        Me.cmdOK.Size = New System.Drawing.Size(75, 25)
        Me.cmdOK.TabIndex = 89
        Me.cmdOK.Text = "OK"
        '
        'Label9
        '
        Me.Label9.AutoSize = True
        Me.Label9.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label9.Location = New System.Drawing.Point(92, 220)
        Me.Label9.Name = "Label9"
        Me.Label9.Size = New System.Drawing.Size(159, 16)
        Me.Label9.TabIndex = 85
        Me.Label9.Text = "SLX Provider Connection:"
        Me.Label9.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSLXProviderConnection
        '
        Me.txtSLXProviderConnection.Location = New System.Drawing.Point(263, 216)
        Me.txtSLXProviderConnection.Name = "txtSLXProviderConnection"
        Me.txtSLXProviderConnection.Size = New System.Drawing.Size(379, 20)
        Me.txtSLXProviderConnection.TabIndex = 84
        '
        'Label10
        '
        Me.Label10.AutoSize = True
        Me.Label10.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label10.Location = New System.Drawing.Point(92, 181)
        Me.Label10.Name = "Label10"
        Me.Label10.Size = New System.Drawing.Size(147, 16)
        Me.Label10.TabIndex = 83
        Me.Label10.Text = "SLX Native Connection:"
        Me.Label10.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSLXNativeConnection
        '
        Me.txtSLXNativeConnection.Location = New System.Drawing.Point(263, 181)
        Me.txtSLXNativeConnection.Name = "txtSLXNativeConnection"
        Me.txtSLXNativeConnection.Size = New System.Drawing.Size(379, 20)
        Me.txtSLXNativeConnection.TabIndex = 82
        '
        'Label11
        '
        Me.Label11.AutoSize = True
        Me.Label11.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label11.Location = New System.Drawing.Point(92, 111)
        Me.Label11.Name = "Label11"
        Me.Label11.Size = New System.Drawing.Size(166, 16)
        Me.Label11.TabIndex = 81
        Me.Label11.Text = "Source Native Connection:"
        Me.Label11.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSourceConnection
        '
        Me.txtSourceConnection.Location = New System.Drawing.Point(263, 110)
        Me.txtSourceConnection.Name = "txtSourceConnection"
        Me.txtSourceConnection.Size = New System.Drawing.Size(379, 20)
        Me.txtSourceConnection.TabIndex = 80
        '
        'Panel4
        '
        Me.Panel4.BackColor = System.Drawing.Color.White
        Me.Panel4.Controls.Add(Me.TextBox6)
        Me.Panel4.Controls.Add(Me.Label5)
        Me.Panel4.Controls.Add(Me.PictureBox11)
        Me.Panel4.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel4.Location = New System.Drawing.Point(0, 0)
        Me.Panel4.Name = "Panel4"
        Me.Panel4.Size = New System.Drawing.Size(742, 82)
        Me.Panel4.TabIndex = 79
        '
        'TextBox6
        '
        Me.TextBox6.BackColor = System.Drawing.Color.White
        Me.TextBox6.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox6.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox6.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox6.Location = New System.Drawing.Point(95, 53)
        Me.TextBox6.Multiline = True
        Me.TextBox6.Name = "TextBox6"
        Me.TextBox6.ReadOnly = True
        Me.TextBox6.Size = New System.Drawing.Size(634, 28)
        Me.TextBox6.TabIndex = 59
        Me.TextBox6.Text = "Define Source and SalesLogix Connections" & Global.Microsoft.VisualBasic.ChrW(13) & Global.Microsoft.VisualBasic.ChrW(10) & "This is Default for all Maps"
        '
        'Label5
        '
        Me.Label5.AutoSize = True
        Me.Label5.BackColor = System.Drawing.Color.Transparent
        Me.Label5.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label5.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label5.Location = New System.Drawing.Point(89, 13)
        Me.Label5.Name = "Label5"
        Me.Label5.Size = New System.Drawing.Size(248, 33)
        Me.Label5.TabIndex = 58
        Me.Label5.Text = "Main Connections"
        '
        'cmdSLXProviderConnection
        '
        Me.cmdSLXProviderConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSLXProviderConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSLXProviderConnection.Location = New System.Drawing.Point(654, 220)
        Me.cmdSLXProviderConnection.Name = "cmdSLXProviderConnection"
        Me.cmdSLXProviderConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSLXProviderConnection.TabIndex = 94
        Me.cmdSLXProviderConnection.Text = "Search  "
        Me.cmdSLXProviderConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSLXProviderConnection.UseVisualStyleBackColor = True
        '
        'cmdSLXnativeConnection
        '
        Me.cmdSLXnativeConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSLXnativeConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSLXnativeConnection.Location = New System.Drawing.Point(654, 181)
        Me.cmdSLXnativeConnection.Name = "cmdSLXnativeConnection"
        Me.cmdSLXnativeConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSLXnativeConnection.TabIndex = 93
        Me.cmdSLXnativeConnection.Text = "Search  "
        Me.cmdSLXnativeConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSLXnativeConnection.UseVisualStyleBackColor = True
        '
        'cmdSearchSourceConnection
        '
        Me.cmdSearchSourceConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSearchSourceConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSearchSourceConnection.Location = New System.Drawing.Point(654, 110)
        Me.cmdSearchSourceConnection.Name = "cmdSearchSourceConnection"
        Me.cmdSearchSourceConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSearchSourceConnection.TabIndex = 92
        Me.cmdSearchSourceConnection.Text = "Search  "
        Me.cmdSearchSourceConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSearchSourceConnection.UseVisualStyleBackColor = True
        '
        'PictureBox12
        '
        Me.PictureBox12.Image = CType(resources.GetObject("PictureBox12.Image"), System.Drawing.Image)
        Me.PictureBox12.Location = New System.Drawing.Point(7, 147)
        Me.PictureBox12.Name = "PictureBox12"
        Me.PictureBox12.Size = New System.Drawing.Size(32, 32)
        Me.PictureBox12.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox12.TabIndex = 91
        Me.PictureBox12.TabStop = False
        '
        'PictureBox13
        '
        Me.PictureBox13.Image = CType(resources.GetObject("PictureBox13.Image"), System.Drawing.Image)
        Me.PictureBox13.Location = New System.Drawing.Point(58, 220)
        Me.PictureBox13.Name = "PictureBox13"
        Me.PictureBox13.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox13.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox13.TabIndex = 88
        Me.PictureBox13.TabStop = False
        '
        'PictureBox14
        '
        Me.PictureBox14.Image = CType(resources.GetObject("PictureBox14.Image"), System.Drawing.Image)
        Me.PictureBox14.Location = New System.Drawing.Point(58, 181)
        Me.PictureBox14.Name = "PictureBox14"
        Me.PictureBox14.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox14.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox14.TabIndex = 87
        Me.PictureBox14.TabStop = False
        '
        'PictureBox15
        '
        Me.PictureBox15.Image = CType(resources.GetObject("PictureBox15.Image"), System.Drawing.Image)
        Me.PictureBox15.Location = New System.Drawing.Point(58, 114)
        Me.PictureBox15.Name = "PictureBox15"
        Me.PictureBox15.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox15.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox15.TabIndex = 86
        Me.PictureBox15.TabStop = False
        '
        'PictureBox11
        '
        Me.PictureBox11.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox11.Image = CType(resources.GetObject("PictureBox11.Image"), System.Drawing.Image)
        Me.PictureBox11.Location = New System.Drawing.Point(8, 7)
        Me.PictureBox11.Name = "PictureBox11"
        Me.PictureBox11.Size = New System.Drawing.Size(72, 72)
        Me.PictureBox11.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox11.TabIndex = 57
        Me.PictureBox11.TabStop = False
        '
        'frmMainConnections
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(742, 293)
        Me.Controls.Add(Me.cmdSLXProviderConnection)
        Me.Controls.Add(Me.cmdSLXnativeConnection)
        Me.Controls.Add(Me.cmdSearchSourceConnection)
        Me.Controls.Add(Me.PictureBox12)
        Me.Controls.Add(Me.Panel5)
        Me.Controls.Add(Me.cmdOK)
        Me.Controls.Add(Me.PictureBox13)
        Me.Controls.Add(Me.PictureBox14)
        Me.Controls.Add(Me.PictureBox15)
        Me.Controls.Add(Me.Label9)
        Me.Controls.Add(Me.txtSLXProviderConnection)
        Me.Controls.Add(Me.Label10)
        Me.Controls.Add(Me.txtSLXNativeConnection)
        Me.Controls.Add(Me.Label11)
        Me.Controls.Add(Me.txtSourceConnection)
        Me.Controls.Add(Me.Panel4)
        Me.Name = "frmMainConnections"
        Me.Text = "Main Connections"
        Me.Panel4.ResumeLayout(False)
        Me.Panel4.PerformLayout()
        CType(Me.PictureBox12, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox13, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox14, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox15, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox11, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents cmdSLXProviderConnection As System.Windows.Forms.Button
    Friend WithEvents cmdSLXnativeConnection As System.Windows.Forms.Button
    Friend WithEvents cmdSearchSourceConnection As System.Windows.Forms.Button
    Friend WithEvents PictureBox12 As System.Windows.Forms.PictureBox
    Friend WithEvents Panel5 As System.Windows.Forms.Panel
    Friend WithEvents cmdOK As System.Windows.Forms.Button
    Friend WithEvents PictureBox13 As System.Windows.Forms.PictureBox
    Friend WithEvents PictureBox14 As System.Windows.Forms.PictureBox
    Friend WithEvents PictureBox15 As System.Windows.Forms.PictureBox
    Friend WithEvents Label9 As System.Windows.Forms.Label
    Friend WithEvents txtSLXProviderConnection As System.Windows.Forms.TextBox
    Friend WithEvents Label10 As System.Windows.Forms.Label
    Friend WithEvents txtSLXNativeConnection As System.Windows.Forms.TextBox
    Friend WithEvents Label11 As System.Windows.Forms.Label
    Friend WithEvents txtSourceConnection As System.Windows.Forms.TextBox
    Friend WithEvents Panel4 As System.Windows.Forms.Panel
    Friend WithEvents TextBox6 As System.Windows.Forms.TextBox
    Friend WithEvents Label5 As System.Windows.Forms.Label
    Friend WithEvents PictureBox11 As System.Windows.Forms.PictureBox
End Class
