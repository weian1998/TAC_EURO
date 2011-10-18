<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmMain
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
        Me.components = New System.ComponentModel.Container
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(frmMain))
        Dim DataGridViewCellStyle4 As System.Windows.Forms.DataGridViewCellStyle = New System.Windows.Forms.DataGridViewCellStyle
        Dim DataGridViewCellStyle5 As System.Windows.Forms.DataGridViewCellStyle = New System.Windows.Forms.DataGridViewCellStyle
        Dim DataGridViewCellStyle6 As System.Windows.Forms.DataGridViewCellStyle = New System.Windows.Forms.DataGridViewCellStyle
        Me.Panel1 = New System.Windows.Forms.Panel
        Me.ToolStrip1 = New System.Windows.Forms.ToolStrip
        Me.cmdToolSave = New System.Windows.Forms.ToolStripButton
        Me.PictureBox6 = New System.Windows.Forms.PictureBox
        Me.Label2 = New System.Windows.Forms.Label
        Me.Label1 = New System.Windows.Forms.Label
        Me.MenuStrip1 = New System.Windows.Forms.MenuStrip
        Me.FileToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.NewProjectToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.OpenProjectToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.SaveProjectToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.SaveProjectAsToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.ConnectionToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.MainConnectionToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.HelpToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.AboutToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.StatusStrip1 = New System.Windows.Forms.StatusStrip
        Me.ToolStripStatusLabel1 = New System.Windows.Forms.ToolStripStatusLabel
        Me.lblStatus = New System.Windows.Forms.ToolStripStatusLabel
        Me.ProgressBar1 = New System.Windows.Forms.ProgressBar
        Me.ContextMenuStrip1 = New System.Windows.Forms.ContextMenuStrip(Me.components)
        Me.AddMapToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.EditToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.DeleteToolStripMenuItem = New System.Windows.Forms.ToolStripMenuItem
        Me.ImageList1 = New System.Windows.Forms.ImageList(Me.components)
        Me.SplitContainer1 = New System.Windows.Forms.SplitContainer
        Me.GroupBox1 = New System.Windows.Forms.GroupBox
        Me.lstMaps = New System.Windows.Forms.ListView
        Me.tbMain = New System.Windows.Forms.TabControl
        Me.tbConnection = New System.Windows.Forms.TabPage
        Me.Panel7 = New System.Windows.Forms.Panel
        Me.TextBox4 = New System.Windows.Forms.TextBox
        Me.Label12 = New System.Windows.Forms.Label
        Me.PictureBox10 = New System.Windows.Forms.PictureBox
        Me.cmdSearchSLXProviderConnection = New System.Windows.Forms.Button
        Me.cmdSearchSLXNativeConnection = New System.Windows.Forms.Button
        Me.cmdSearchSourceNativeConnection = New System.Windows.Forms.Button
        Me.cmdSaveMapConnections = New System.Windows.Forms.Button
        Me.PictureBox5 = New System.Windows.Forms.PictureBox
        Me.Panel3 = New System.Windows.Forms.Panel
        Me.PictureBox3 = New System.Windows.Forms.PictureBox
        Me.PictureBox2 = New System.Windows.Forms.PictureBox
        Me.PictureBox1 = New System.Windows.Forms.PictureBox
        Me.Label8 = New System.Windows.Forms.Label
        Me.txtSLXProvider = New System.Windows.Forms.TextBox
        Me.Label7 = New System.Windows.Forms.Label
        Me.txtSLXNative = New System.Windows.Forms.TextBox
        Me.Label6 = New System.Windows.Forms.Label
        Me.txtSourceNative = New System.Windows.Forms.TextBox
        Me.tbMapping = New System.Windows.Forms.TabPage
        Me.cmdRemove = New System.Windows.Forms.Button
        Me.dgSourceTargetMapping = New System.Windows.Forms.DataGridView
        Me.cmdMap = New System.Windows.Forms.Button
        Me.Label14 = New System.Windows.Forms.Label
        Me.cboSourcePK = New System.Windows.Forms.ComboBox
        Me.Label13 = New System.Windows.Forms.Label
        Me.Button1 = New System.Windows.Forms.Button
        Me.grpDestination = New System.Windows.Forms.GroupBox
        Me.dgTarget = New System.Windows.Forms.DataGridView
        Me.Button17 = New System.Windows.Forms.Button
        Me.cboSLXTable = New System.Windows.Forms.ComboBox
        Me.grpSource = New System.Windows.Forms.GroupBox
        Me.dgSource = New System.Windows.Forms.DataGridView
        Me.cmdSourceRefresh = New System.Windows.Forms.Button
        Me.chkUseQuery = New System.Windows.Forms.CheckBox
        Me.cmdQuery = New System.Windows.Forms.Button
        Me.cboSourceTable = New System.Windows.Forms.ComboBox
        Me.tbCreateTempTable = New System.Windows.Forms.TabPage
        Me.pgbarTempTable = New System.Windows.Forms.ProgressBar
        Me.Panel2 = New System.Windows.Forms.Panel
        Me.TextBox2 = New System.Windows.Forms.TextBox
        Me.Label3 = New System.Windows.Forms.Label
        Me.PictureBox4 = New System.Windows.Forms.PictureBox
        Me.grpTempTable = New System.Windows.Forms.GroupBox
        Me.Label4 = New System.Windows.Forms.Label
        Me.txtTempTableName = New System.Windows.Forms.TextBox
        Me.cmdGenerateTempTable = New System.Windows.Forms.Button
        Me.cmdSaveTempTable = New System.Windows.Forms.Button
        Me.tbView = New System.Windows.Forms.TabPage
        Me.cmdCreateIntialViewSQL = New System.Windows.Forms.Button
        Me.rdoUsedEditedViewSQL = New System.Windows.Forms.RadioButton
        Me.rdoUseIntialView = New System.Windows.Forms.RadioButton
        Me.grpEditedViewSQL = New System.Windows.Forms.GroupBox
        Me.txtEditedViewSQL = New System.Windows.Forms.TextBox
        Me.cmdGenerateView = New System.Windows.Forms.Button
        Me.Panel5 = New System.Windows.Forms.Panel
        Me.TextBox3 = New System.Windows.Forms.TextBox
        Me.Label9 = New System.Windows.Forms.Label
        Me.PictureBox8 = New System.Windows.Forms.PictureBox
        Me.grpIntialViw = New System.Windows.Forms.GroupBox
        Me.txtViewName = New System.Windows.Forms.TextBox
        Me.Label10 = New System.Windows.Forms.Label
        Me.txtIntialViewScript = New System.Windows.Forms.TextBox
        Me.cmdSaveView = New System.Windows.Forms.Button
        Me.tbDTS = New System.Windows.Forms.TabPage
        Me.cmdCreateDTSScript = New System.Windows.Forms.Button
        Me.Button15 = New System.Windows.Forms.Button
        Me.GroupBox2 = New System.Windows.Forms.GroupBox
        Me.txtDTSscript = New System.Windows.Forms.TextBox
        Me.Panel4 = New System.Windows.Forms.Panel
        Me.TextBox1 = New System.Windows.Forms.TextBox
        Me.Label5 = New System.Windows.Forms.Label
        Me.PictureBox7 = New System.Windows.Forms.PictureBox
        Me.cmdSaveDTSScript = New System.Windows.Forms.Button
        Me.tbFixes = New System.Windows.Forms.TabPage
        Me.cmdExecuteSQLScript = New System.Windows.Forms.Button
        Me.GroupBox3 = New System.Windows.Forms.GroupBox
        Me.txtSQLScript = New System.Windows.Forms.TextBox
        Me.Panel6 = New System.Windows.Forms.Panel
        Me.TextBox5 = New System.Windows.Forms.TextBox
        Me.Label11 = New System.Windows.Forms.Label
        Me.PictureBox9 = New System.Windows.Forms.PictureBox
        Me.cmdSaveFixes = New System.Windows.Forms.Button
        Me.OpenFileDialog1 = New System.Windows.Forms.OpenFileDialog
        Me.SaveFileDialog1 = New System.Windows.Forms.SaveFileDialog
        Me.BackgroundWorker1 = New System.ComponentModel.BackgroundWorker
        Me.Panel1.SuspendLayout()
        Me.ToolStrip1.SuspendLayout()
        CType(Me.PictureBox6, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.MenuStrip1.SuspendLayout()
        Me.StatusStrip1.SuspendLayout()
        Me.ContextMenuStrip1.SuspendLayout()
        Me.SplitContainer1.Panel1.SuspendLayout()
        Me.SplitContainer1.Panel2.SuspendLayout()
        Me.SplitContainer1.SuspendLayout()
        Me.GroupBox1.SuspendLayout()
        Me.tbMain.SuspendLayout()
        Me.tbConnection.SuspendLayout()
        Me.Panel7.SuspendLayout()
        CType(Me.PictureBox10, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox5, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox3, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox2, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.tbMapping.SuspendLayout()
        CType(Me.dgSourceTargetMapping, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.grpDestination.SuspendLayout()
        CType(Me.dgTarget, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.grpSource.SuspendLayout()
        CType(Me.dgSource, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.tbCreateTempTable.SuspendLayout()
        Me.Panel2.SuspendLayout()
        CType(Me.PictureBox4, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.grpTempTable.SuspendLayout()
        Me.tbView.SuspendLayout()
        Me.grpEditedViewSQL.SuspendLayout()
        Me.Panel5.SuspendLayout()
        CType(Me.PictureBox8, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.grpIntialViw.SuspendLayout()
        Me.tbDTS.SuspendLayout()
        Me.GroupBox2.SuspendLayout()
        Me.Panel4.SuspendLayout()
        CType(Me.PictureBox7, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.tbFixes.SuspendLayout()
        Me.GroupBox3.SuspendLayout()
        Me.Panel6.SuspendLayout()
        CType(Me.PictureBox9, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'Panel1
        '
        Me.Panel1.BackColor = System.Drawing.Color.White
        Me.Panel1.Controls.Add(Me.ToolStrip1)
        Me.Panel1.Controls.Add(Me.PictureBox6)
        Me.Panel1.Controls.Add(Me.Label2)
        Me.Panel1.Controls.Add(Me.Label1)
        Me.Panel1.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel1.Location = New System.Drawing.Point(0, 24)
        Me.Panel1.Name = "Panel1"
        Me.Panel1.Size = New System.Drawing.Size(890, 132)
        Me.Panel1.TabIndex = 1
        '
        'ToolStrip1
        '
        Me.ToolStrip1.Items.AddRange(New System.Windows.Forms.ToolStripItem() {Me.cmdToolSave})
        Me.ToolStrip1.Location = New System.Drawing.Point(0, 0)
        Me.ToolStrip1.Name = "ToolStrip1"
        Me.ToolStrip1.Size = New System.Drawing.Size(890, 25)
        Me.ToolStrip1.TabIndex = 4
        Me.ToolStrip1.Text = "ToolStrip1"
        '
        'cmdToolSave
        '
        Me.cmdToolSave.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Image
        Me.cmdToolSave.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdToolSave.ImageTransparentColor = System.Drawing.Color.Magenta
        Me.cmdToolSave.Name = "cmdToolSave"
        Me.cmdToolSave.Size = New System.Drawing.Size(23, 22)
        Me.cmdToolSave.Text = "Save"
        '
        'PictureBox6
        '
        Me.PictureBox6.Image = CType(resources.GetObject("PictureBox6.Image"), System.Drawing.Image)
        Me.PictureBox6.Location = New System.Drawing.Point(12, 28)
        Me.PictureBox6.Name = "PictureBox6"
        Me.PictureBox6.Size = New System.Drawing.Size(96, 96)
        Me.PictureBox6.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox6.TabIndex = 3
        Me.PictureBox6.TabStop = False
        '
        'Label2
        '
        Me.Label2.BackColor = System.Drawing.Color.Transparent
        Me.Label2.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label2.ForeColor = System.Drawing.Color.Silver
        Me.Label2.Location = New System.Drawing.Point(136, 92)
        Me.Label2.Name = "Label2"
        Me.Label2.Size = New System.Drawing.Size(416, 32)
        Me.Label2.TabIndex = 2
        Me.Label2.Text = "Quick Easy way to Create in BULK SLXIDs for FAST Imports"
        '
        'Label1
        '
        Me.Label1.BackColor = System.Drawing.Color.Transparent
        Me.Label1.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label1.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label1.Location = New System.Drawing.Point(123, 43)
        Me.Label1.Name = "Label1"
        Me.Label1.Size = New System.Drawing.Size(606, 40)
        Me.Label1.TabIndex = 1
        Me.Label1.Text = " SalesLogix Import Tool for SLX Developers"
        '
        'MenuStrip1
        '
        Me.MenuStrip1.Items.AddRange(New System.Windows.Forms.ToolStripItem() {Me.FileToolStripMenuItem, Me.ConnectionToolStripMenuItem, Me.HelpToolStripMenuItem})
        Me.MenuStrip1.Location = New System.Drawing.Point(0, 0)
        Me.MenuStrip1.Name = "MenuStrip1"
        Me.MenuStrip1.Size = New System.Drawing.Size(890, 24)
        Me.MenuStrip1.TabIndex = 2
        Me.MenuStrip1.Text = "MenuStrip1"
        '
        'FileToolStripMenuItem
        '
        Me.FileToolStripMenuItem.DropDownItems.AddRange(New System.Windows.Forms.ToolStripItem() {Me.NewProjectToolStripMenuItem, Me.OpenProjectToolStripMenuItem, Me.SaveProjectToolStripMenuItem, Me.SaveProjectAsToolStripMenuItem})
        Me.FileToolStripMenuItem.Name = "FileToolStripMenuItem"
        Me.FileToolStripMenuItem.Size = New System.Drawing.Size(35, 20)
        Me.FileToolStripMenuItem.Text = "File"
        '
        'NewProjectToolStripMenuItem
        '
        Me.NewProjectToolStripMenuItem.Name = "NewProjectToolStripMenuItem"
        Me.NewProjectToolStripMenuItem.Size = New System.Drawing.Size(161, 22)
        Me.NewProjectToolStripMenuItem.Text = "New Project"
        '
        'OpenProjectToolStripMenuItem
        '
        Me.OpenProjectToolStripMenuItem.Name = "OpenProjectToolStripMenuItem"
        Me.OpenProjectToolStripMenuItem.Size = New System.Drawing.Size(161, 22)
        Me.OpenProjectToolStripMenuItem.Text = "Open Project"
        '
        'SaveProjectToolStripMenuItem
        '
        Me.SaveProjectToolStripMenuItem.Name = "SaveProjectToolStripMenuItem"
        Me.SaveProjectToolStripMenuItem.Size = New System.Drawing.Size(161, 22)
        Me.SaveProjectToolStripMenuItem.Text = "Save Project"
        '
        'SaveProjectAsToolStripMenuItem
        '
        Me.SaveProjectAsToolStripMenuItem.Name = "SaveProjectAsToolStripMenuItem"
        Me.SaveProjectAsToolStripMenuItem.Size = New System.Drawing.Size(161, 22)
        Me.SaveProjectAsToolStripMenuItem.Text = "Save Project As"
        '
        'ConnectionToolStripMenuItem
        '
        Me.ConnectionToolStripMenuItem.DropDownItems.AddRange(New System.Windows.Forms.ToolStripItem() {Me.MainConnectionToolStripMenuItem})
        Me.ConnectionToolStripMenuItem.Name = "ConnectionToolStripMenuItem"
        Me.ConnectionToolStripMenuItem.Size = New System.Drawing.Size(73, 20)
        Me.ConnectionToolStripMenuItem.Text = "Connection"
        '
        'MainConnectionToolStripMenuItem
        '
        Me.MainConnectionToolStripMenuItem.Name = "MainConnectionToolStripMenuItem"
        Me.MainConnectionToolStripMenuItem.Size = New System.Drawing.Size(164, 22)
        Me.MainConnectionToolStripMenuItem.Text = "Main Connection"
        '
        'HelpToolStripMenuItem
        '
        Me.HelpToolStripMenuItem.DropDownItems.AddRange(New System.Windows.Forms.ToolStripItem() {Me.AboutToolStripMenuItem})
        Me.HelpToolStripMenuItem.Name = "HelpToolStripMenuItem"
        Me.HelpToolStripMenuItem.Size = New System.Drawing.Size(40, 20)
        Me.HelpToolStripMenuItem.Text = "Help"
        '
        'AboutToolStripMenuItem
        '
        Me.AboutToolStripMenuItem.Name = "AboutToolStripMenuItem"
        Me.AboutToolStripMenuItem.Size = New System.Drawing.Size(114, 22)
        Me.AboutToolStripMenuItem.Text = "About"
        '
        'StatusStrip1
        '
        Me.StatusStrip1.Items.AddRange(New System.Windows.Forms.ToolStripItem() {Me.ToolStripStatusLabel1, Me.lblStatus})
        Me.StatusStrip1.Location = New System.Drawing.Point(0, 533)
        Me.StatusStrip1.Name = "StatusStrip1"
        Me.StatusStrip1.Size = New System.Drawing.Size(890, 22)
        Me.StatusStrip1.TabIndex = 5
        Me.StatusStrip1.Text = "Avante Solutions, Inc. 2006"
        '
        'ToolStripStatusLabel1
        '
        Me.ToolStripStatusLabel1.Image = CType(resources.GetObject("ToolStripStatusLabel1.Image"), System.Drawing.Image)
        Me.ToolStripStatusLabel1.Name = "ToolStripStatusLabel1"
        Me.ToolStripStatusLabel1.Size = New System.Drawing.Size(166, 17)
        Me.ToolStripStatusLabel1.Text = "Avante Solutions, Inc. 2006   "
        '
        'lblStatus
        '
        Me.lblStatus.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblStatus.Name = "lblStatus"
        Me.lblStatus.Size = New System.Drawing.Size(215, 17)
        Me.lblStatus.Text = "                                                    "
        '
        'ProgressBar1
        '
        Me.ProgressBar1.Location = New System.Drawing.Point(591, 404)
        Me.ProgressBar1.Name = "ProgressBar1"
        Me.ProgressBar1.Size = New System.Drawing.Size(284, 16)
        Me.ProgressBar1.TabIndex = 6
        '
        'ContextMenuStrip1
        '
        Me.ContextMenuStrip1.Items.AddRange(New System.Windows.Forms.ToolStripItem() {Me.AddMapToolStripMenuItem, Me.EditToolStripMenuItem, Me.DeleteToolStripMenuItem})
        Me.ContextMenuStrip1.Name = "ContextMenuStrip1"
        Me.ContextMenuStrip1.Size = New System.Drawing.Size(157, 70)
        '
        'AddMapToolStripMenuItem
        '
        Me.AddMapToolStripMenuItem.Name = "AddMapToolStripMenuItem"
        Me.AddMapToolStripMenuItem.Size = New System.Drawing.Size(156, 22)
        Me.AddMapToolStripMenuItem.Text = "Add Map"
        '
        'EditToolStripMenuItem
        '
        Me.EditToolStripMenuItem.Name = "EditToolStripMenuItem"
        Me.EditToolStripMenuItem.Size = New System.Drawing.Size(156, 22)
        Me.EditToolStripMenuItem.Text = "Edit Map Name"
        '
        'DeleteToolStripMenuItem
        '
        Me.DeleteToolStripMenuItem.Name = "DeleteToolStripMenuItem"
        Me.DeleteToolStripMenuItem.Size = New System.Drawing.Size(156, 22)
        Me.DeleteToolStripMenuItem.Text = "Delete Map"
        '
        'ImageList1
        '
        Me.ImageList1.ImageStream = CType(resources.GetObject("ImageList1.ImageStream"), System.Windows.Forms.ImageListStreamer)
        Me.ImageList1.TransparentColor = System.Drawing.Color.Transparent
        Me.ImageList1.Images.SetKeyName(0, "45-1.png")
        '
        'SplitContainer1
        '
        Me.SplitContainer1.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.SplitContainer1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle
        Me.SplitContainer1.Location = New System.Drawing.Point(0, 161)
        Me.SplitContainer1.Name = "SplitContainer1"
        '
        'SplitContainer1.Panel1
        '
        Me.SplitContainer1.Panel1.Controls.Add(Me.GroupBox1)
        '
        'SplitContainer1.Panel2
        '
        Me.SplitContainer1.Panel2.Controls.Add(Me.tbMain)
        Me.SplitContainer1.Size = New System.Drawing.Size(890, 372)
        Me.SplitContainer1.SplitterDistance = 135
        Me.SplitContainer1.TabIndex = 7
        '
        'GroupBox1
        '
        Me.GroupBox1.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.GroupBox1.AutoSize = True
        Me.GroupBox1.Controls.Add(Me.lstMaps)
        Me.GroupBox1.Font = New System.Drawing.Font("Verdana", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.GroupBox1.Location = New System.Drawing.Point(0, 0)
        Me.GroupBox1.Name = "GroupBox1"
        Me.GroupBox1.Size = New System.Drawing.Size(135, 388)
        Me.GroupBox1.TabIndex = 3
        Me.GroupBox1.TabStop = False
        Me.GroupBox1.Text = "Maps"
        '
        'lstMaps
        '
        Me.lstMaps.Alignment = System.Windows.Forms.ListViewAlignment.Left
        Me.lstMaps.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.lstMaps.BackColor = System.Drawing.SystemColors.ButtonFace
        Me.lstMaps.ContextMenuStrip = Me.ContextMenuStrip1
        Me.lstMaps.Location = New System.Drawing.Point(3, 19)
        Me.lstMaps.MultiSelect = False
        Me.lstMaps.Name = "lstMaps"
        Me.lstMaps.Size = New System.Drawing.Size(126, 347)
        Me.lstMaps.SmallImageList = Me.ImageList1
        Me.lstMaps.TabIndex = 62
        Me.lstMaps.UseCompatibleStateImageBehavior = False
        Me.lstMaps.View = System.Windows.Forms.View.SmallIcon
        '
        'tbMain
        '
        Me.tbMain.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.tbMain.Controls.Add(Me.tbConnection)
        Me.tbMain.Controls.Add(Me.tbMapping)
        Me.tbMain.Controls.Add(Me.tbCreateTempTable)
        Me.tbMain.Controls.Add(Me.tbView)
        Me.tbMain.Controls.Add(Me.tbDTS)
        Me.tbMain.Controls.Add(Me.tbFixes)
        Me.tbMain.Location = New System.Drawing.Point(0, 0)
        Me.tbMain.Name = "tbMain"
        Me.tbMain.SelectedIndex = 0
        Me.tbMain.Size = New System.Drawing.Size(749, 370)
        Me.tbMain.TabIndex = 4
        '
        'tbConnection
        '
        Me.tbConnection.BackColor = System.Drawing.SystemColors.ButtonFace
        Me.tbConnection.Controls.Add(Me.Panel7)
        Me.tbConnection.Controls.Add(Me.cmdSearchSLXProviderConnection)
        Me.tbConnection.Controls.Add(Me.cmdSearchSLXNativeConnection)
        Me.tbConnection.Controls.Add(Me.cmdSearchSourceNativeConnection)
        Me.tbConnection.Controls.Add(Me.cmdSaveMapConnections)
        Me.tbConnection.Controls.Add(Me.PictureBox5)
        Me.tbConnection.Controls.Add(Me.Panel3)
        Me.tbConnection.Controls.Add(Me.PictureBox3)
        Me.tbConnection.Controls.Add(Me.PictureBox2)
        Me.tbConnection.Controls.Add(Me.PictureBox1)
        Me.tbConnection.Controls.Add(Me.Label8)
        Me.tbConnection.Controls.Add(Me.txtSLXProvider)
        Me.tbConnection.Controls.Add(Me.Label7)
        Me.tbConnection.Controls.Add(Me.txtSLXNative)
        Me.tbConnection.Controls.Add(Me.Label6)
        Me.tbConnection.Controls.Add(Me.txtSourceNative)
        Me.tbConnection.Location = New System.Drawing.Point(4, 22)
        Me.tbConnection.Name = "tbConnection"
        Me.tbConnection.Size = New System.Drawing.Size(741, 344)
        Me.tbConnection.TabIndex = 5
        Me.tbConnection.Text = "Connection"
        '
        'Panel7
        '
        Me.Panel7.BackColor = System.Drawing.Color.White
        Me.Panel7.Controls.Add(Me.TextBox4)
        Me.Panel7.Controls.Add(Me.Label12)
        Me.Panel7.Controls.Add(Me.PictureBox10)
        Me.Panel7.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel7.Location = New System.Drawing.Point(0, 0)
        Me.Panel7.Name = "Panel7"
        Me.Panel7.Size = New System.Drawing.Size(741, 82)
        Me.Panel7.TabIndex = 61
        '
        'TextBox4
        '
        Me.TextBox4.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox4.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox4.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox4.Location = New System.Drawing.Point(95, 53)
        Me.TextBox4.Multiline = True
        Me.TextBox4.Name = "TextBox4"
        Me.TextBox4.Size = New System.Drawing.Size(634, 28)
        Me.TextBox4.TabIndex = 59
        Me.TextBox4.Text = "Define Source and SalesLogix Connections... Default is the main Connection"
        '
        'Label12
        '
        Me.Label12.AutoSize = True
        Me.Label12.BackColor = System.Drawing.Color.Transparent
        Me.Label12.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label12.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label12.Location = New System.Drawing.Point(89, 13)
        Me.Label12.Name = "Label12"
        Me.Label12.Size = New System.Drawing.Size(226, 33)
        Me.Label12.TabIndex = 58
        Me.Label12.Text = "Map Connection"
        '
        'PictureBox10
        '
        Me.PictureBox10.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox10.Image = CType(resources.GetObject("PictureBox10.Image"), System.Drawing.Image)
        Me.PictureBox10.Location = New System.Drawing.Point(8, 7)
        Me.PictureBox10.Name = "PictureBox10"
        Me.PictureBox10.Size = New System.Drawing.Size(72, 72)
        Me.PictureBox10.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox10.TabIndex = 57
        Me.PictureBox10.TabStop = False
        '
        'cmdSearchSLXProviderConnection
        '
        Me.cmdSearchSLXProviderConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSearchSLXProviderConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSearchSLXProviderConnection.Location = New System.Drawing.Point(654, 243)
        Me.cmdSearchSLXProviderConnection.Name = "cmdSearchSLXProviderConnection"
        Me.cmdSearchSLXProviderConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSearchSLXProviderConnection.TabIndex = 54
        Me.cmdSearchSLXProviderConnection.Text = "Search  "
        Me.cmdSearchSLXProviderConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSearchSLXProviderConnection.UseVisualStyleBackColor = True
        '
        'cmdSearchSLXNativeConnection
        '
        Me.cmdSearchSLXNativeConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSearchSLXNativeConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSearchSLXNativeConnection.Location = New System.Drawing.Point(654, 193)
        Me.cmdSearchSLXNativeConnection.Name = "cmdSearchSLXNativeConnection"
        Me.cmdSearchSLXNativeConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSearchSLXNativeConnection.TabIndex = 53
        Me.cmdSearchSLXNativeConnection.Text = "Search  "
        Me.cmdSearchSLXNativeConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSearchSLXNativeConnection.UseVisualStyleBackColor = True
        '
        'cmdSearchSourceNativeConnection
        '
        Me.cmdSearchSourceNativeConnection.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Search16x16
        Me.cmdSearchSourceNativeConnection.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSearchSourceNativeConnection.Location = New System.Drawing.Point(654, 99)
        Me.cmdSearchSourceNativeConnection.Name = "cmdSearchSourceNativeConnection"
        Me.cmdSearchSourceNativeConnection.Size = New System.Drawing.Size(75, 25)
        Me.cmdSearchSourceNativeConnection.TabIndex = 52
        Me.cmdSearchSourceNativeConnection.Text = "Search  "
        Me.cmdSearchSourceNativeConnection.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSearchSourceNativeConnection.UseVisualStyleBackColor = True
        '
        'cmdSaveMapConnections
        '
        Me.cmdSaveMapConnections.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdSaveMapConnections.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSaveMapConnections.Location = New System.Drawing.Point(576, 307)
        Me.cmdSaveMapConnections.Name = "cmdSaveMapConnections"
        Me.cmdSaveMapConnections.Size = New System.Drawing.Size(75, 30)
        Me.cmdSaveMapConnections.TabIndex = 51
        Me.cmdSaveMapConnections.Text = "Save  "
        Me.cmdSaveMapConnections.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSaveMapConnections.UseVisualStyleBackColor = True
        '
        'PictureBox5
        '
        Me.PictureBox5.Image = CType(resources.GetObject("PictureBox5.Image"), System.Drawing.Image)
        Me.PictureBox5.Location = New System.Drawing.Point(8, 138)
        Me.PictureBox5.Name = "PictureBox5"
        Me.PictureBox5.Size = New System.Drawing.Size(32, 32)
        Me.PictureBox5.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox5.TabIndex = 49
        Me.PictureBox5.TabStop = False
        '
        'Panel3
        '
        Me.Panel3.BackColor = System.Drawing.SystemColors.ControlDarkDark
        Me.Panel3.Location = New System.Drawing.Point(48, 157)
        Me.Panel3.Name = "Panel3"
        Me.Panel3.Size = New System.Drawing.Size(640, 1)
        Me.Panel3.TabIndex = 48
        '
        'PictureBox3
        '
        Me.PictureBox3.Image = CType(resources.GetObject("PictureBox3.Image"), System.Drawing.Image)
        Me.PictureBox3.Location = New System.Drawing.Point(40, 245)
        Me.PictureBox3.Name = "PictureBox3"
        Me.PictureBox3.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox3.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox3.TabIndex = 46
        Me.PictureBox3.TabStop = False
        '
        'PictureBox2
        '
        Me.PictureBox2.Image = CType(resources.GetObject("PictureBox2.Image"), System.Drawing.Image)
        Me.PictureBox2.Location = New System.Drawing.Point(40, 198)
        Me.PictureBox2.Name = "PictureBox2"
        Me.PictureBox2.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox2.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox2.TabIndex = 45
        Me.PictureBox2.TabStop = False
        '
        'PictureBox1
        '
        Me.PictureBox1.Image = CType(resources.GetObject("PictureBox1.Image"), System.Drawing.Image)
        Me.PictureBox1.Location = New System.Drawing.Point(40, 108)
        Me.PictureBox1.Name = "PictureBox1"
        Me.PictureBox1.Size = New System.Drawing.Size(16, 16)
        Me.PictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox1.TabIndex = 44
        Me.PictureBox1.TabStop = False
        '
        'Label8
        '
        Me.Label8.AutoSize = True
        Me.Label8.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label8.Location = New System.Drawing.Point(62, 245)
        Me.Label8.Name = "Label8"
        Me.Label8.Size = New System.Drawing.Size(159, 16)
        Me.Label8.TabIndex = 43
        Me.Label8.Text = "SLX Provider Connection:"
        Me.Label8.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSLXProvider
        '
        Me.txtSLXProvider.Location = New System.Drawing.Point(234, 243)
        Me.txtSLXProvider.Name = "txtSLXProvider"
        Me.txtSLXProvider.Size = New System.Drawing.Size(379, 20)
        Me.txtSLXProvider.TabIndex = 41
        '
        'Label7
        '
        Me.Label7.AutoSize = True
        Me.Label7.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label7.Location = New System.Drawing.Point(62, 198)
        Me.Label7.Name = "Label7"
        Me.Label7.Size = New System.Drawing.Size(147, 16)
        Me.Label7.TabIndex = 40
        Me.Label7.Text = "SLX Native Connection:"
        Me.Label7.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSLXNative
        '
        Me.txtSLXNative.Location = New System.Drawing.Point(234, 198)
        Me.txtSLXNative.Name = "txtSLXNative"
        Me.txtSLXNative.Size = New System.Drawing.Size(379, 20)
        Me.txtSLXNative.TabIndex = 38
        '
        'Label6
        '
        Me.Label6.AutoSize = True
        Me.Label6.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label6.Location = New System.Drawing.Point(62, 108)
        Me.Label6.Name = "Label6"
        Me.Label6.Size = New System.Drawing.Size(166, 16)
        Me.Label6.TabIndex = 37
        Me.Label6.Text = "Source Native Connection:"
        Me.Label6.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'txtSourceNative
        '
        Me.txtSourceNative.Location = New System.Drawing.Point(234, 104)
        Me.txtSourceNative.Name = "txtSourceNative"
        Me.txtSourceNative.Size = New System.Drawing.Size(379, 20)
        Me.txtSourceNative.TabIndex = 35
        '
        'tbMapping
        '
        Me.tbMapping.BackColor = System.Drawing.Color.Transparent
        Me.tbMapping.Controls.Add(Me.cmdRemove)
        Me.tbMapping.Controls.Add(Me.dgSourceTargetMapping)
        Me.tbMapping.Controls.Add(Me.cmdMap)
        Me.tbMapping.Controls.Add(Me.Label14)
        Me.tbMapping.Controls.Add(Me.cboSourcePK)
        Me.tbMapping.Controls.Add(Me.Label13)
        Me.tbMapping.Controls.Add(Me.Button1)
        Me.tbMapping.Controls.Add(Me.grpDestination)
        Me.tbMapping.Controls.Add(Me.grpSource)
        Me.tbMapping.Location = New System.Drawing.Point(4, 22)
        Me.tbMapping.Name = "tbMapping"
        Me.tbMapping.Padding = New System.Windows.Forms.Padding(3)
        Me.tbMapping.Size = New System.Drawing.Size(741, 344)
        Me.tbMapping.TabIndex = 0
        Me.tbMapping.Text = "Mapping"
        '
        'cmdRemove
        '
        Me.cmdRemove.Image = CType(resources.GetObject("cmdRemove.Image"), System.Drawing.Image)
        Me.cmdRemove.Location = New System.Drawing.Point(310, 21)
        Me.cmdRemove.Name = "cmdRemove"
        Me.cmdRemove.Size = New System.Drawing.Size(36, 35)
        Me.cmdRemove.TabIndex = 62
        Me.cmdRemove.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdRemove.UseVisualStyleBackColor = True
        '
        'dgSourceTargetMapping
        '
        DataGridViewCellStyle4.BackColor = System.Drawing.Color.FromArgb(CType(CType(255, Byte), Integer), CType(CType(224, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.dgSourceTargetMapping.AlternatingRowsDefaultCellStyle = DataGridViewCellStyle4
        Me.dgSourceTargetMapping.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.dgSourceTargetMapping.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize
        Me.dgSourceTargetMapping.Location = New System.Drawing.Point(307, 60)
        Me.dgSourceTargetMapping.Name = "dgSourceTargetMapping"
        Me.dgSourceTargetMapping.ReadOnly = True
        Me.dgSourceTargetMapping.RowTemplate.DefaultCellStyle.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.dgSourceTargetMapping.Size = New System.Drawing.Size(115, 242)
        Me.dgSourceTargetMapping.TabIndex = 61
        '
        'cmdMap
        '
        Me.cmdMap.Anchor = CType((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.cmdMap.Image = CType(resources.GetObject("cmdMap.Image"), System.Drawing.Image)
        Me.cmdMap.Location = New System.Drawing.Point(386, 21)
        Me.cmdMap.Name = "cmdMap"
        Me.cmdMap.Size = New System.Drawing.Size(36, 35)
        Me.cmdMap.TabIndex = 60
        Me.cmdMap.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdMap.UseVisualStyleBackColor = True
        '
        'Label14
        '
        Me.Label14.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.Label14.AutoSize = True
        Me.Label14.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label14.Location = New System.Drawing.Point(3, 316)
        Me.Label14.Name = "Label14"
        Me.Label14.Size = New System.Drawing.Size(77, 13)
        Me.Label14.TabIndex = 57
        Me.Label14.Text = "Primary Key:"
        '
        'cboSourcePK
        '
        Me.cboSourcePK.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.cboSourcePK.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.cboSourcePK.FormattingEnabled = True
        Me.cboSourcePK.Location = New System.Drawing.Point(86, 311)
        Me.cboSourcePK.Name = "cboSourcePK"
        Me.cboSourcePK.Size = New System.Drawing.Size(212, 21)
        Me.cboSourcePK.TabIndex = 56
        '
        'Label13
        '
        Me.Label13.Anchor = CType(((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.Label13.AutoSize = True
        Me.Label13.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label13.ForeColor = System.Drawing.SystemColors.ActiveCaption
        Me.Label13.Location = New System.Drawing.Point(323, 3)
        Me.Label13.Name = "Label13"
        Me.Label13.Size = New System.Drawing.Size(86, 13)
        Me.Label13.TabIndex = 55
        Me.Label13.Text = "Mapped Links"
        '
        'Button1
        '
        Me.Button1.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.Button1.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.Button1.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.Button1.Location = New System.Drawing.Point(576, 307)
        Me.Button1.Name = "Button1"
        Me.Button1.Size = New System.Drawing.Size(75, 30)
        Me.Button1.TabIndex = 53
        Me.Button1.Text = "Save  "
        Me.Button1.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button1.UseVisualStyleBackColor = True
        '
        'grpDestination
        '
        Me.grpDestination.Controls.Add(Me.dgTarget)
        Me.grpDestination.Controls.Add(Me.Button17)
        Me.grpDestination.Controls.Add(Me.cboSLXTable)
        Me.grpDestination.Dock = System.Windows.Forms.DockStyle.Right
        Me.grpDestination.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpDestination.Location = New System.Drawing.Point(428, 3)
        Me.grpDestination.Name = "grpDestination"
        Me.grpDestination.Size = New System.Drawing.Size(310, 338)
        Me.grpDestination.TabIndex = 7
        Me.grpDestination.TabStop = False
        Me.grpDestination.Text = "Target (SLX)"
        '
        'dgTarget
        '
        Me.dgTarget.AllowUserToOrderColumns = True
        DataGridViewCellStyle5.BackColor = System.Drawing.Color.FromArgb(CType(CType(255, Byte), Integer), CType(CType(224, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.dgTarget.AlternatingRowsDefaultCellStyle = DataGridViewCellStyle5
        Me.dgTarget.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.dgTarget.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize
        Me.dgTarget.Location = New System.Drawing.Point(0, 57)
        Me.dgTarget.Name = "dgTarget"
        Me.dgTarget.RowTemplate.DefaultCellStyle.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.dgTarget.Size = New System.Drawing.Size(311, 244)
        Me.dgTarget.TabIndex = 8
        '
        'Button17
        '
        Me.Button17.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Refresh
        Me.Button17.Location = New System.Drawing.Point(199, 24)
        Me.Button17.Name = "Button17"
        Me.Button17.Size = New System.Drawing.Size(23, 23)
        Me.Button17.TabIndex = 7
        Me.Button17.UseVisualStyleBackColor = True
        '
        'cboSLXTable
        '
        Me.cboSLXTable.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.cboSLXTable.FormattingEnabled = True
        Me.cboSLXTable.Location = New System.Drawing.Point(3, 24)
        Me.cboSLXTable.Name = "cboSLXTable"
        Me.cboSLXTable.Size = New System.Drawing.Size(190, 21)
        Me.cboSLXTable.TabIndex = 3
        '
        'grpSource
        '
        Me.grpSource.Controls.Add(Me.dgSource)
        Me.grpSource.Controls.Add(Me.cmdSourceRefresh)
        Me.grpSource.Controls.Add(Me.chkUseQuery)
        Me.grpSource.Controls.Add(Me.cmdQuery)
        Me.grpSource.Controls.Add(Me.cboSourceTable)
        Me.grpSource.Dock = System.Windows.Forms.DockStyle.Left
        Me.grpSource.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpSource.Location = New System.Drawing.Point(3, 3)
        Me.grpSource.Name = "grpSource"
        Me.grpSource.Size = New System.Drawing.Size(301, 338)
        Me.grpSource.TabIndex = 5
        Me.grpSource.TabStop = False
        Me.grpSource.Text = "Source Table / Query"
        '
        'dgSource
        '
        DataGridViewCellStyle6.BackColor = System.Drawing.Color.FromArgb(CType(CType(255, Byte), Integer), CType(CType(224, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.dgSource.AlternatingRowsDefaultCellStyle = DataGridViewCellStyle6
        Me.dgSource.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
                    Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.dgSource.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize
        Me.dgSource.Location = New System.Drawing.Point(6, 57)
        Me.dgSource.Name = "dgSource"
        Me.dgSource.RowTemplate.DefaultCellStyle.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.dgSource.Size = New System.Drawing.Size(292, 242)
        Me.dgSource.TabIndex = 7
        '
        'cmdSourceRefresh
        '
        Me.cmdSourceRefresh.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Refresh
        Me.cmdSourceRefresh.Location = New System.Drawing.Point(271, 24)
        Me.cmdSourceRefresh.Name = "cmdSourceRefresh"
        Me.cmdSourceRefresh.Size = New System.Drawing.Size(23, 23)
        Me.cmdSourceRefresh.TabIndex = 6
        Me.cmdSourceRefresh.UseVisualStyleBackColor = True
        '
        'chkUseQuery
        '
        Me.chkUseQuery.AutoSize = True
        Me.chkUseQuery.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.chkUseQuery.Location = New System.Drawing.Point(202, 6)
        Me.chkUseQuery.Name = "chkUseQuery"
        Me.chkUseQuery.Size = New System.Drawing.Size(76, 17)
        Me.chkUseQuery.TabIndex = 5
        Me.chkUseQuery.Text = "Use Query"
        Me.chkUseQuery.UseVisualStyleBackColor = True
        '
        'cmdQuery
        '
        Me.cmdQuery.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.cmdQuery.Location = New System.Drawing.Point(206, 24)
        Me.cmdQuery.Name = "cmdQuery"
        Me.cmdQuery.Size = New System.Drawing.Size(55, 23)
        Me.cmdQuery.TabIndex = 2
        Me.cmdQuery.Text = "Query"
        Me.cmdQuery.UseVisualStyleBackColor = True
        '
        'cboSourceTable
        '
        Me.cboSourceTable.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.cboSourceTable.FormattingEnabled = True
        Me.cboSourceTable.Location = New System.Drawing.Point(6, 24)
        Me.cboSourceTable.Name = "cboSourceTable"
        Me.cboSourceTable.Size = New System.Drawing.Size(190, 21)
        Me.cboSourceTable.TabIndex = 3
        '
        'tbCreateTempTable
        '
        Me.tbCreateTempTable.BackColor = System.Drawing.Color.Transparent
        Me.tbCreateTempTable.Controls.Add(Me.pgbarTempTable)
        Me.tbCreateTempTable.Controls.Add(Me.Panel2)
        Me.tbCreateTempTable.Controls.Add(Me.grpTempTable)
        Me.tbCreateTempTable.Controls.Add(Me.cmdGenerateTempTable)
        Me.tbCreateTempTable.Controls.Add(Me.cmdSaveTempTable)
        Me.tbCreateTempTable.Location = New System.Drawing.Point(4, 22)
        Me.tbCreateTempTable.Name = "tbCreateTempTable"
        Me.tbCreateTempTable.Padding = New System.Windows.Forms.Padding(3)
        Me.tbCreateTempTable.Size = New System.Drawing.Size(741, 344)
        Me.tbCreateTempTable.TabIndex = 1
        Me.tbCreateTempTable.Text = "TempTable"
        '
        'pgbarTempTable
        '
        Me.pgbarTempTable.Location = New System.Drawing.Point(101, 307)
        Me.pgbarTempTable.Name = "pgbarTempTable"
        Me.pgbarTempTable.Size = New System.Drawing.Size(469, 23)
        Me.pgbarTempTable.TabIndex = 61
        '
        'Panel2
        '
        Me.Panel2.BackColor = System.Drawing.Color.White
        Me.Panel2.Controls.Add(Me.TextBox2)
        Me.Panel2.Controls.Add(Me.Label3)
        Me.Panel2.Controls.Add(Me.PictureBox4)
        Me.Panel2.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel2.Location = New System.Drawing.Point(3, 3)
        Me.Panel2.Name = "Panel2"
        Me.Panel2.Size = New System.Drawing.Size(735, 82)
        Me.Panel2.TabIndex = 60
        '
        'TextBox2
        '
        Me.TextBox2.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox2.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox2.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox2.Location = New System.Drawing.Point(95, 53)
        Me.TextBox2.Multiline = True
        Me.TextBox2.Name = "TextBox2"
        Me.TextBox2.Size = New System.Drawing.Size(634, 28)
        Me.TextBox2.TabIndex = 59
        Me.TextBox2.Text = "This Table contains generated SLXId's and other Transformations... Use this Table" & _
            " in the View Creation Process"
        '
        'Label3
        '
        Me.Label3.AutoSize = True
        Me.Label3.BackColor = System.Drawing.Color.Transparent
        Me.Label3.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label3.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label3.Location = New System.Drawing.Point(89, 13)
        Me.Label3.Name = "Label3"
        Me.Label3.Size = New System.Drawing.Size(281, 33)
        Me.Label3.TabIndex = 58
        Me.Label3.Text = "TempTable Creation"
        '
        'PictureBox4
        '
        Me.PictureBox4.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox4.Image = CType(resources.GetObject("PictureBox4.Image"), System.Drawing.Image)
        Me.PictureBox4.Location = New System.Drawing.Point(20, 13)
        Me.PictureBox4.Name = "PictureBox4"
        Me.PictureBox4.Size = New System.Drawing.Size(48, 48)
        Me.PictureBox4.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox4.TabIndex = 57
        Me.PictureBox4.TabStop = False
        '
        'grpTempTable
        '
        Me.grpTempTable.Controls.Add(Me.Label4)
        Me.grpTempTable.Controls.Add(Me.txtTempTableName)
        Me.grpTempTable.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpTempTable.Location = New System.Drawing.Point(6, 100)
        Me.grpTempTable.Name = "grpTempTable"
        Me.grpTempTable.Size = New System.Drawing.Size(726, 187)
        Me.grpTempTable.TabIndex = 56
        Me.grpTempTable.TabStop = False
        Me.grpTempTable.Text = "SLX TempTable"
        '
        'Label4
        '
        Me.Label4.AutoSize = True
        Me.Label4.Location = New System.Drawing.Point(6, 23)
        Me.Label4.Name = "Label4"
        Me.Label4.Size = New System.Drawing.Size(79, 13)
        Me.Label4.TabIndex = 9
        Me.Label4.Text = "Table Name:"
        '
        'txtTempTableName
        '
        Me.txtTempTableName.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtTempTableName.Location = New System.Drawing.Point(85, 20)
        Me.txtTempTableName.Name = "txtTempTableName"
        Me.txtTempTableName.Size = New System.Drawing.Size(166, 20)
        Me.txtTempTableName.TabIndex = 7
        Me.txtTempTableName.Text = "zz_"
        '
        'cmdGenerateTempTable
        '
        Me.cmdGenerateTempTable.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Success16x16
        Me.cmdGenerateTempTable.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdGenerateTempTable.Location = New System.Drawing.Point(9, 307)
        Me.cmdGenerateTempTable.Name = "cmdGenerateTempTable"
        Me.cmdGenerateTempTable.Size = New System.Drawing.Size(86, 30)
        Me.cmdGenerateTempTable.TabIndex = 59
        Me.cmdGenerateTempTable.Text = "Generate  "
        Me.cmdGenerateTempTable.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdGenerateTempTable.UseVisualStyleBackColor = True
        '
        'cmdSaveTempTable
        '
        Me.cmdSaveTempTable.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdSaveTempTable.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSaveTempTable.Location = New System.Drawing.Point(576, 307)
        Me.cmdSaveTempTable.Name = "cmdSaveTempTable"
        Me.cmdSaveTempTable.Size = New System.Drawing.Size(75, 30)
        Me.cmdSaveTempTable.TabIndex = 53
        Me.cmdSaveTempTable.Text = "Save  "
        Me.cmdSaveTempTable.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSaveTempTable.UseVisualStyleBackColor = True
        '
        'tbView
        '
        Me.tbView.BackColor = System.Drawing.Color.Transparent
        Me.tbView.Controls.Add(Me.cmdCreateIntialViewSQL)
        Me.tbView.Controls.Add(Me.rdoUsedEditedViewSQL)
        Me.tbView.Controls.Add(Me.rdoUseIntialView)
        Me.tbView.Controls.Add(Me.grpEditedViewSQL)
        Me.tbView.Controls.Add(Me.cmdGenerateView)
        Me.tbView.Controls.Add(Me.Panel5)
        Me.tbView.Controls.Add(Me.grpIntialViw)
        Me.tbView.Controls.Add(Me.cmdSaveView)
        Me.tbView.Location = New System.Drawing.Point(4, 22)
        Me.tbView.Name = "tbView"
        Me.tbView.Size = New System.Drawing.Size(741, 344)
        Me.tbView.TabIndex = 2
        Me.tbView.Text = "View"
        '
        'cmdCreateIntialViewSQL
        '
        Me.cmdCreateIntialViewSQL.Image = CType(resources.GetObject("cmdCreateIntialViewSQL.Image"), System.Drawing.Image)
        Me.cmdCreateIntialViewSQL.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdCreateIntialViewSQL.Location = New System.Drawing.Point(188, 297)
        Me.cmdCreateIntialViewSQL.Name = "cmdCreateIntialViewSQL"
        Me.cmdCreateIntialViewSQL.Size = New System.Drawing.Size(75, 23)
        Me.cmdCreateIntialViewSQL.TabIndex = 66
        Me.cmdCreateIntialViewSQL.Text = "Create"
        Me.cmdCreateIntialViewSQL.UseVisualStyleBackColor = True
        '
        'rdoUsedEditedViewSQL
        '
        Me.rdoUsedEditedViewSQL.AutoSize = True
        Me.rdoUsedEditedViewSQL.Location = New System.Drawing.Point(399, 297)
        Me.rdoUsedEditedViewSQL.Name = "rdoUsedEditedViewSQL"
        Me.rdoUsedEditedViewSQL.Size = New System.Drawing.Size(77, 17)
        Me.rdoUsedEditedViewSQL.TabIndex = 65
        Me.rdoUsedEditedViewSQL.Text = "Use Edited"
        Me.rdoUsedEditedViewSQL.UseVisualStyleBackColor = True
        '
        'rdoUseIntialView
        '
        Me.rdoUseIntialView.AutoSize = True
        Me.rdoUseIntialView.Checked = True
        Me.rdoUseIntialView.Location = New System.Drawing.Point(269, 300)
        Me.rdoUseIntialView.Name = "rdoUseIntialView"
        Me.rdoUseIntialView.Size = New System.Drawing.Size(69, 17)
        Me.rdoUseIntialView.TabIndex = 64
        Me.rdoUseIntialView.TabStop = True
        Me.rdoUseIntialView.Text = "Use Intial"
        Me.rdoUseIntialView.UseVisualStyleBackColor = True
        '
        'grpEditedViewSQL
        '
        Me.grpEditedViewSQL.Controls.Add(Me.txtEditedViewSQL)
        Me.grpEditedViewSQL.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpEditedViewSQL.Location = New System.Drawing.Point(396, 97)
        Me.grpEditedViewSQL.Name = "grpEditedViewSQL"
        Me.grpEditedViewSQL.Size = New System.Drawing.Size(345, 197)
        Me.grpEditedViewSQL.TabIndex = 63
        Me.grpEditedViewSQL.TabStop = False
        Me.grpEditedViewSQL.Text = "Edited View SQL"
        '
        'txtEditedViewSQL
        '
        Me.txtEditedViewSQL.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.txtEditedViewSQL.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtEditedViewSQL.Location = New System.Drawing.Point(3, 39)
        Me.txtEditedViewSQL.Multiline = True
        Me.txtEditedViewSQL.Name = "txtEditedViewSQL"
        Me.txtEditedViewSQL.Size = New System.Drawing.Size(339, 155)
        Me.txtEditedViewSQL.TabIndex = 0
        '
        'cmdGenerateView
        '
        Me.cmdGenerateView.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Success16x16
        Me.cmdGenerateView.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdGenerateView.Location = New System.Drawing.Point(23, 307)
        Me.cmdGenerateView.Name = "cmdGenerateView"
        Me.cmdGenerateView.Size = New System.Drawing.Size(86, 30)
        Me.cmdGenerateView.TabIndex = 62
        Me.cmdGenerateView.Text = "Generate  "
        Me.cmdGenerateView.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdGenerateView.UseVisualStyleBackColor = True
        '
        'Panel5
        '
        Me.Panel5.BackColor = System.Drawing.Color.White
        Me.Panel5.Controls.Add(Me.TextBox3)
        Me.Panel5.Controls.Add(Me.Label9)
        Me.Panel5.Controls.Add(Me.PictureBox8)
        Me.Panel5.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel5.Location = New System.Drawing.Point(0, 0)
        Me.Panel5.Name = "Panel5"
        Me.Panel5.Size = New System.Drawing.Size(741, 82)
        Me.Panel5.TabIndex = 61
        '
        'TextBox3
        '
        Me.TextBox3.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox3.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox3.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox3.Location = New System.Drawing.Point(95, 53)
        Me.TextBox3.Multiline = True
        Me.TextBox3.Name = "TextBox3"
        Me.TextBox3.Size = New System.Drawing.Size(634, 28)
        Me.TextBox3.TabIndex = 59
        Me.TextBox3.Text = "The Key to Fast Imports is do all tranformations before hand in Views and pump th" & _
            "e data In directly using DTS or SQL Server SSIS"
        '
        'Label9
        '
        Me.Label9.AutoSize = True
        Me.Label9.BackColor = System.Drawing.Color.Transparent
        Me.Label9.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label9.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label9.Location = New System.Drawing.Point(89, 13)
        Me.Label9.Name = "Label9"
        Me.Label9.Size = New System.Drawing.Size(196, 33)
        Me.Label9.TabIndex = 58
        Me.Label9.Text = "View Creation"
        '
        'PictureBox8
        '
        Me.PictureBox8.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox8.Image = CType(resources.GetObject("PictureBox8.Image"), System.Drawing.Image)
        Me.PictureBox8.Location = New System.Drawing.Point(20, 13)
        Me.PictureBox8.Name = "PictureBox8"
        Me.PictureBox8.Size = New System.Drawing.Size(48, 48)
        Me.PictureBox8.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox8.TabIndex = 57
        Me.PictureBox8.TabStop = False
        '
        'grpIntialViw
        '
        Me.grpIntialViw.Controls.Add(Me.txtViewName)
        Me.grpIntialViw.Controls.Add(Me.Label10)
        Me.grpIntialViw.Controls.Add(Me.txtIntialViewScript)
        Me.grpIntialViw.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpIntialViw.Location = New System.Drawing.Point(20, 97)
        Me.grpIntialViw.Name = "grpIntialViw"
        Me.grpIntialViw.Size = New System.Drawing.Size(345, 197)
        Me.grpIntialViw.TabIndex = 56
        Me.grpIntialViw.TabStop = False
        Me.grpIntialViw.Text = "IntialView Script"
        '
        'txtViewName
        '
        Me.txtViewName.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtViewName.Location = New System.Drawing.Point(114, 13)
        Me.txtViewName.Name = "txtViewName"
        Me.txtViewName.Size = New System.Drawing.Size(225, 20)
        Me.txtViewName.TabIndex = 2
        Me.txtViewName.Text = "V_"
        '
        'Label10
        '
        Me.Label10.AutoSize = True
        Me.Label10.Location = New System.Drawing.Point(7, 20)
        Me.Label10.Name = "Label10"
        Me.Label10.Size = New System.Drawing.Size(101, 13)
        Me.Label10.TabIndex = 1
        Me.Label10.Text = "SLX View Name:"
        '
        'txtIntialViewScript
        '
        Me.txtIntialViewScript.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.txtIntialViewScript.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtIntialViewScript.Location = New System.Drawing.Point(3, 39)
        Me.txtIntialViewScript.Multiline = True
        Me.txtIntialViewScript.Name = "txtIntialViewScript"
        Me.txtIntialViewScript.Size = New System.Drawing.Size(339, 155)
        Me.txtIntialViewScript.TabIndex = 0
        '
        'cmdSaveView
        '
        Me.cmdSaveView.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdSaveView.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSaveView.Location = New System.Drawing.Point(576, 307)
        Me.cmdSaveView.Name = "cmdSaveView"
        Me.cmdSaveView.Size = New System.Drawing.Size(75, 30)
        Me.cmdSaveView.TabIndex = 53
        Me.cmdSaveView.Text = "Save  "
        Me.cmdSaveView.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSaveView.UseVisualStyleBackColor = True
        '
        'tbDTS
        '
        Me.tbDTS.BackColor = System.Drawing.Color.Transparent
        Me.tbDTS.Controls.Add(Me.cmdCreateDTSScript)
        Me.tbDTS.Controls.Add(Me.Button15)
        Me.tbDTS.Controls.Add(Me.GroupBox2)
        Me.tbDTS.Controls.Add(Me.Panel4)
        Me.tbDTS.Controls.Add(Me.cmdSaveDTSScript)
        Me.tbDTS.Location = New System.Drawing.Point(4, 22)
        Me.tbDTS.Name = "tbDTS"
        Me.tbDTS.Size = New System.Drawing.Size(741, 344)
        Me.tbDTS.TabIndex = 3
        Me.tbDTS.Text = "DTS"
        '
        'cmdCreateDTSScript
        '
        Me.cmdCreateDTSScript.Image = CType(resources.GetObject("cmdCreateDTSScript.Image"), System.Drawing.Image)
        Me.cmdCreateDTSScript.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdCreateDTSScript.Location = New System.Drawing.Point(463, 297)
        Me.cmdCreateDTSScript.Name = "cmdCreateDTSScript"
        Me.cmdCreateDTSScript.Size = New System.Drawing.Size(75, 23)
        Me.cmdCreateDTSScript.TabIndex = 67
        Me.cmdCreateDTSScript.Text = "Create"
        Me.cmdCreateDTSScript.UseVisualStyleBackColor = True
        '
        'Button15
        '
        Me.Button15.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Success16x16
        Me.Button15.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.Button15.Location = New System.Drawing.Point(23, 307)
        Me.Button15.Name = "Button15"
        Me.Button15.Size = New System.Drawing.Size(153, 30)
        Me.Button15.TabIndex = 65
        Me.Button15.Text = "Generate  DTS Package"
        Me.Button15.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button15.UseVisualStyleBackColor = True
        '
        'GroupBox2
        '
        Me.GroupBox2.Controls.Add(Me.txtDTSscript)
        Me.GroupBox2.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.GroupBox2.Location = New System.Drawing.Point(20, 97)
        Me.GroupBox2.Name = "GroupBox2"
        Me.GroupBox2.Size = New System.Drawing.Size(724, 197)
        Me.GroupBox2.TabIndex = 64
        Me.GroupBox2.TabStop = False
        Me.GroupBox2.Text = "DTS Script"
        '
        'txtDTSscript
        '
        Me.txtDTSscript.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.txtDTSscript.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtDTSscript.Location = New System.Drawing.Point(3, 19)
        Me.txtDTSscript.Multiline = True
        Me.txtDTSscript.Name = "txtDTSscript"
        Me.txtDTSscript.Size = New System.Drawing.Size(718, 175)
        Me.txtDTSscript.TabIndex = 0
        '
        'Panel4
        '
        Me.Panel4.BackColor = System.Drawing.Color.White
        Me.Panel4.Controls.Add(Me.TextBox1)
        Me.Panel4.Controls.Add(Me.Label5)
        Me.Panel4.Controls.Add(Me.PictureBox7)
        Me.Panel4.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel4.Location = New System.Drawing.Point(0, 0)
        Me.Panel4.Name = "Panel4"
        Me.Panel4.Size = New System.Drawing.Size(741, 91)
        Me.Panel4.TabIndex = 59
        '
        'TextBox1
        '
        Me.TextBox1.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox1.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox1.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox1.Location = New System.Drawing.Point(95, 53)
        Me.TextBox1.Multiline = True
        Me.TextBox1.Name = "TextBox1"
        Me.TextBox1.Size = New System.Drawing.Size(634, 35)
        Me.TextBox1.TabIndex = 59
        Me.TextBox1.Text = "Use this Script to quickly create your DTS Scripts needed for SLX Bulk Imports"
        '
        'Label5
        '
        Me.Label5.AutoSize = True
        Me.Label5.BackColor = System.Drawing.Color.Transparent
        Me.Label5.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label5.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label5.Location = New System.Drawing.Point(89, 13)
        Me.Label5.Name = "Label5"
        Me.Label5.Size = New System.Drawing.Size(308, 33)
        Me.Label5.TabIndex = 58
        Me.Label5.Text = "DTS Script Generation"
        '
        'PictureBox7
        '
        Me.PictureBox7.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox7.Image = CType(resources.GetObject("PictureBox7.Image"), System.Drawing.Image)
        Me.PictureBox7.Location = New System.Drawing.Point(20, 13)
        Me.PictureBox7.Name = "PictureBox7"
        Me.PictureBox7.Size = New System.Drawing.Size(48, 48)
        Me.PictureBox7.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox7.TabIndex = 57
        Me.PictureBox7.TabStop = False
        '
        'cmdSaveDTSScript
        '
        Me.cmdSaveDTSScript.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdSaveDTSScript.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSaveDTSScript.Location = New System.Drawing.Point(576, 307)
        Me.cmdSaveDTSScript.Name = "cmdSaveDTSScript"
        Me.cmdSaveDTSScript.Size = New System.Drawing.Size(75, 30)
        Me.cmdSaveDTSScript.TabIndex = 53
        Me.cmdSaveDTSScript.Text = "Save  "
        Me.cmdSaveDTSScript.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSaveDTSScript.UseVisualStyleBackColor = True
        '
        'tbFixes
        '
        Me.tbFixes.BackColor = System.Drawing.Color.Transparent
        Me.tbFixes.Controls.Add(Me.cmdExecuteSQLScript)
        Me.tbFixes.Controls.Add(Me.GroupBox3)
        Me.tbFixes.Controls.Add(Me.Panel6)
        Me.tbFixes.Controls.Add(Me.cmdSaveFixes)
        Me.tbFixes.Location = New System.Drawing.Point(4, 22)
        Me.tbFixes.Name = "tbFixes"
        Me.tbFixes.Size = New System.Drawing.Size(741, 344)
        Me.tbFixes.TabIndex = 4
        Me.tbFixes.Text = "Fixes"
        '
        'cmdExecuteSQLScript
        '
        Me.cmdExecuteSQLScript.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Success16x16
        Me.cmdExecuteSQLScript.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdExecuteSQLScript.Location = New System.Drawing.Point(23, 307)
        Me.cmdExecuteSQLScript.Name = "cmdExecuteSQLScript"
        Me.cmdExecuteSQLScript.Size = New System.Drawing.Size(110, 30)
        Me.cmdExecuteSQLScript.TabIndex = 67
        Me.cmdExecuteSQLScript.Text = "Execute Script  "
        Me.cmdExecuteSQLScript.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdExecuteSQLScript.UseVisualStyleBackColor = True
        '
        'GroupBox3
        '
        Me.GroupBox3.Controls.Add(Me.txtSQLScript)
        Me.GroupBox3.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.GroupBox3.Location = New System.Drawing.Point(20, 97)
        Me.GroupBox3.Name = "GroupBox3"
        Me.GroupBox3.Size = New System.Drawing.Size(724, 197)
        Me.GroupBox3.TabIndex = 66
        Me.GroupBox3.TabStop = False
        Me.GroupBox3.Text = "SQL Script"
        '
        'txtSQLScript
        '
        Me.txtSQLScript.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.txtSQLScript.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtSQLScript.Location = New System.Drawing.Point(3, 19)
        Me.txtSQLScript.Multiline = True
        Me.txtSQLScript.Name = "txtSQLScript"
        Me.txtSQLScript.Size = New System.Drawing.Size(718, 175)
        Me.txtSQLScript.TabIndex = 0
        '
        'Panel6
        '
        Me.Panel6.BackColor = System.Drawing.Color.White
        Me.Panel6.Controls.Add(Me.TextBox5)
        Me.Panel6.Controls.Add(Me.Label11)
        Me.Panel6.Controls.Add(Me.PictureBox9)
        Me.Panel6.Dock = System.Windows.Forms.DockStyle.Top
        Me.Panel6.Location = New System.Drawing.Point(0, 0)
        Me.Panel6.Name = "Panel6"
        Me.Panel6.Size = New System.Drawing.Size(741, 91)
        Me.Panel6.TabIndex = 65
        '
        'TextBox5
        '
        Me.TextBox5.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.TextBox5.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TextBox5.ForeColor = System.Drawing.SystemColors.ControlDarkDark
        Me.TextBox5.Location = New System.Drawing.Point(95, 53)
        Me.TextBox5.Multiline = True
        Me.TextBox5.Name = "TextBox5"
        Me.TextBox5.Size = New System.Drawing.Size(634, 35)
        Me.TextBox5.TabIndex = 59
        Me.TextBox5.Text = "Sometimes Updates are needed this gives the ablility to store and execute these S" & _
            "cripts as needed."
        '
        'Label11
        '
        Me.Label11.AutoSize = True
        Me.Label11.BackColor = System.Drawing.Color.Transparent
        Me.Label11.Font = New System.Drawing.Font("Microsoft Sans Serif", 21.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label11.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Label11.Location = New System.Drawing.Point(89, 13)
        Me.Label11.Name = "Label11"
        Me.Label11.Size = New System.Drawing.Size(309, 33)
        Me.Label11.TabIndex = 58
        Me.Label11.Text = "Post Import SQL Fixes"
        '
        'PictureBox9
        '
        Me.PictureBox9.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None
        Me.PictureBox9.Image = CType(resources.GetObject("PictureBox9.Image"), System.Drawing.Image)
        Me.PictureBox9.Location = New System.Drawing.Point(20, 13)
        Me.PictureBox9.Name = "PictureBox9"
        Me.PictureBox9.Size = New System.Drawing.Size(48, 48)
        Me.PictureBox9.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize
        Me.PictureBox9.TabIndex = 57
        Me.PictureBox9.TabStop = False
        '
        'cmdSaveFixes
        '
        Me.cmdSaveFixes.Image = Global.ASI_SLXBulkLoadImporter.My.Resources.Resources.Save24x24
        Me.cmdSaveFixes.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft
        Me.cmdSaveFixes.Location = New System.Drawing.Point(657, 307)
        Me.cmdSaveFixes.Name = "cmdSaveFixes"
        Me.cmdSaveFixes.Size = New System.Drawing.Size(75, 30)
        Me.cmdSaveFixes.TabIndex = 53
        Me.cmdSaveFixes.Text = "Save  "
        Me.cmdSaveFixes.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.cmdSaveFixes.UseVisualStyleBackColor = True
        '
        'OpenFileDialog1
        '
        Me.OpenFileDialog1.DefaultExt = "ASIP"
        Me.OpenFileDialog1.FileName = "OpenFileDialog1"
        Me.OpenFileDialog1.Filter = "Project files (*.ASIP)|*.ASIP"
        '
        'SaveFileDialog1
        '
        Me.SaveFileDialog1.DefaultExt = "ASIP"
        Me.SaveFileDialog1.Filter = "Project files (*.ASIP)|*.ASIP"
        '
        'BackgroundWorker1
        '
        Me.BackgroundWorker1.WorkerReportsProgress = True
        Me.BackgroundWorker1.WorkerSupportsCancellation = True
        '
        'frmMain
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(890, 555)
        Me.Controls.Add(Me.SplitContainer1)
        Me.Controls.Add(Me.ProgressBar1)
        Me.Controls.Add(Me.StatusStrip1)
        Me.Controls.Add(Me.Panel1)
        Me.Controls.Add(Me.MenuStrip1)
        Me.Icon = CType(resources.GetObject("$this.Icon"), System.Drawing.Icon)
        Me.MainMenuStrip = Me.MenuStrip1
        Me.Name = "frmMain"
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen
        Me.Text = "ASI SLX BulkLoad Importer"
        Me.WindowState = System.Windows.Forms.FormWindowState.Maximized
        Me.Panel1.ResumeLayout(False)
        Me.Panel1.PerformLayout()
        Me.ToolStrip1.ResumeLayout(False)
        Me.ToolStrip1.PerformLayout()
        CType(Me.PictureBox6, System.ComponentModel.ISupportInitialize).EndInit()
        Me.MenuStrip1.ResumeLayout(False)
        Me.MenuStrip1.PerformLayout()
        Me.StatusStrip1.ResumeLayout(False)
        Me.StatusStrip1.PerformLayout()
        Me.ContextMenuStrip1.ResumeLayout(False)
        Me.SplitContainer1.Panel1.ResumeLayout(False)
        Me.SplitContainer1.Panel1.PerformLayout()
        Me.SplitContainer1.Panel2.ResumeLayout(False)
        Me.SplitContainer1.ResumeLayout(False)
        Me.GroupBox1.ResumeLayout(False)
        Me.tbMain.ResumeLayout(False)
        Me.tbConnection.ResumeLayout(False)
        Me.tbConnection.PerformLayout()
        Me.Panel7.ResumeLayout(False)
        Me.Panel7.PerformLayout()
        CType(Me.PictureBox10, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox5, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox3, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox2, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).EndInit()
        Me.tbMapping.ResumeLayout(False)
        Me.tbMapping.PerformLayout()
        CType(Me.dgSourceTargetMapping, System.ComponentModel.ISupportInitialize).EndInit()
        Me.grpDestination.ResumeLayout(False)
        CType(Me.dgTarget, System.ComponentModel.ISupportInitialize).EndInit()
        Me.grpSource.ResumeLayout(False)
        Me.grpSource.PerformLayout()
        CType(Me.dgSource, System.ComponentModel.ISupportInitialize).EndInit()
        Me.tbCreateTempTable.ResumeLayout(False)
        Me.Panel2.ResumeLayout(False)
        Me.Panel2.PerformLayout()
        CType(Me.PictureBox4, System.ComponentModel.ISupportInitialize).EndInit()
        Me.grpTempTable.ResumeLayout(False)
        Me.grpTempTable.PerformLayout()
        Me.tbView.ResumeLayout(False)
        Me.tbView.PerformLayout()
        Me.grpEditedViewSQL.ResumeLayout(False)
        Me.grpEditedViewSQL.PerformLayout()
        Me.Panel5.ResumeLayout(False)
        Me.Panel5.PerformLayout()
        CType(Me.PictureBox8, System.ComponentModel.ISupportInitialize).EndInit()
        Me.grpIntialViw.ResumeLayout(False)
        Me.grpIntialViw.PerformLayout()
        Me.tbDTS.ResumeLayout(False)
        Me.GroupBox2.ResumeLayout(False)
        Me.GroupBox2.PerformLayout()
        Me.Panel4.ResumeLayout(False)
        Me.Panel4.PerformLayout()
        CType(Me.PictureBox7, System.ComponentModel.ISupportInitialize).EndInit()
        Me.tbFixes.ResumeLayout(False)
        Me.GroupBox3.ResumeLayout(False)
        Me.GroupBox3.PerformLayout()
        Me.Panel6.ResumeLayout(False)
        Me.Panel6.PerformLayout()
        CType(Me.PictureBox9, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents PictureBox6 As System.Windows.Forms.PictureBox
    Friend WithEvents Label2 As System.Windows.Forms.Label
    Friend WithEvents Label1 As System.Windows.Forms.Label
    Friend WithEvents MenuStrip1 As System.Windows.Forms.MenuStrip
    Friend WithEvents FileToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents OpenProjectToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents NewProjectToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents SaveProjectToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents SaveProjectAsToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents ConnectionToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents MainConnectionToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents HelpToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents AboutToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents StatusStrip1 As System.Windows.Forms.StatusStrip
    Friend WithEvents ToolStripStatusLabel1 As System.Windows.Forms.ToolStripStatusLabel
    Friend WithEvents lblStatus As System.Windows.Forms.ToolStripStatusLabel
    Friend WithEvents ProgressBar1 As System.Windows.Forms.ProgressBar
    Friend WithEvents SplitContainer1 As System.Windows.Forms.SplitContainer
    Friend WithEvents OpenFileDialog1 As System.Windows.Forms.OpenFileDialog
    Friend WithEvents SaveFileDialog1 As System.Windows.Forms.SaveFileDialog
    Friend WithEvents ImageList1 As System.Windows.Forms.ImageList
    Friend WithEvents ContextMenuStrip1 As System.Windows.Forms.ContextMenuStrip
    Friend WithEvents AddMapToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents EditToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents DeleteToolStripMenuItem As System.Windows.Forms.ToolStripMenuItem
    Friend WithEvents ToolStrip1 As System.Windows.Forms.ToolStrip
    Friend WithEvents cmdToolSave As System.Windows.Forms.ToolStripButton
    Friend WithEvents Panel1 As System.Windows.Forms.Panel
    Friend WithEvents GroupBox1 As System.Windows.Forms.GroupBox
    Friend WithEvents lstMaps As System.Windows.Forms.ListView
    Friend WithEvents tbMain As System.Windows.Forms.TabControl
    Friend WithEvents tbConnection As System.Windows.Forms.TabPage
    Friend WithEvents Panel7 As System.Windows.Forms.Panel
    Friend WithEvents TextBox4 As System.Windows.Forms.TextBox
    Friend WithEvents Label12 As System.Windows.Forms.Label
    Friend WithEvents PictureBox10 As System.Windows.Forms.PictureBox
    Friend WithEvents cmdSearchSLXProviderConnection As System.Windows.Forms.Button
    Friend WithEvents cmdSearchSLXNativeConnection As System.Windows.Forms.Button
    Friend WithEvents cmdSearchSourceNativeConnection As System.Windows.Forms.Button
    Friend WithEvents cmdSaveMapConnections As System.Windows.Forms.Button
    Friend WithEvents PictureBox5 As System.Windows.Forms.PictureBox
    Friend WithEvents Panel3 As System.Windows.Forms.Panel
    Friend WithEvents PictureBox3 As System.Windows.Forms.PictureBox
    Friend WithEvents PictureBox2 As System.Windows.Forms.PictureBox
    Friend WithEvents PictureBox1 As System.Windows.Forms.PictureBox
    Friend WithEvents Label8 As System.Windows.Forms.Label
    Friend WithEvents txtSLXProvider As System.Windows.Forms.TextBox
    Friend WithEvents Label7 As System.Windows.Forms.Label
    Friend WithEvents txtSLXNative As System.Windows.Forms.TextBox
    Friend WithEvents Label6 As System.Windows.Forms.Label
    Friend WithEvents txtSourceNative As System.Windows.Forms.TextBox
    Friend WithEvents tbMapping As System.Windows.Forms.TabPage
    Friend WithEvents dgSourceTargetMapping As System.Windows.Forms.DataGridView
    Friend WithEvents cmdMap As System.Windows.Forms.Button
    Friend WithEvents Label13 As System.Windows.Forms.Label
    Friend WithEvents Button1 As System.Windows.Forms.Button
    Friend WithEvents grpDestination As System.Windows.Forms.GroupBox
    Friend WithEvents dgTarget As System.Windows.Forms.DataGridView
    Friend WithEvents Button17 As System.Windows.Forms.Button
    Friend WithEvents cboSLXTable As System.Windows.Forms.ComboBox
    Friend WithEvents grpSource As System.Windows.Forms.GroupBox
    Friend WithEvents dgSource As System.Windows.Forms.DataGridView
    Friend WithEvents cmdSourceRefresh As System.Windows.Forms.Button
    Friend WithEvents chkUseQuery As System.Windows.Forms.CheckBox
    Friend WithEvents cmdQuery As System.Windows.Forms.Button
    Friend WithEvents cboSourceTable As System.Windows.Forms.ComboBox
    Friend WithEvents tbCreateTempTable As System.Windows.Forms.TabPage
    Friend WithEvents Panel2 As System.Windows.Forms.Panel
    Friend WithEvents TextBox2 As System.Windows.Forms.TextBox
    Friend WithEvents Label3 As System.Windows.Forms.Label
    Friend WithEvents PictureBox4 As System.Windows.Forms.PictureBox
    Friend WithEvents grpTempTable As System.Windows.Forms.GroupBox
    Friend WithEvents Label4 As System.Windows.Forms.Label
    Friend WithEvents txtTempTableName As System.Windows.Forms.TextBox
    Friend WithEvents cmdGenerateTempTable As System.Windows.Forms.Button
    Friend WithEvents cmdSaveTempTable As System.Windows.Forms.Button
    Friend WithEvents tbView As System.Windows.Forms.TabPage
    Friend WithEvents grpEditedViewSQL As System.Windows.Forms.GroupBox
    Friend WithEvents txtEditedViewSQL As System.Windows.Forms.TextBox
    Friend WithEvents cmdGenerateView As System.Windows.Forms.Button
    Friend WithEvents Panel5 As System.Windows.Forms.Panel
    Friend WithEvents TextBox3 As System.Windows.Forms.TextBox
    Friend WithEvents Label9 As System.Windows.Forms.Label
    Friend WithEvents PictureBox8 As System.Windows.Forms.PictureBox
    Friend WithEvents grpIntialViw As System.Windows.Forms.GroupBox
    Friend WithEvents txtViewName As System.Windows.Forms.TextBox
    Friend WithEvents Label10 As System.Windows.Forms.Label
    Friend WithEvents txtIntialViewScript As System.Windows.Forms.TextBox
    Friend WithEvents cmdSaveView As System.Windows.Forms.Button
    Friend WithEvents tbDTS As System.Windows.Forms.TabPage
    Friend WithEvents Button15 As System.Windows.Forms.Button
    Friend WithEvents GroupBox2 As System.Windows.Forms.GroupBox
    Friend WithEvents txtDTSscript As System.Windows.Forms.TextBox
    Friend WithEvents Panel4 As System.Windows.Forms.Panel
    Friend WithEvents TextBox1 As System.Windows.Forms.TextBox
    Friend WithEvents Label5 As System.Windows.Forms.Label
    Friend WithEvents PictureBox7 As System.Windows.Forms.PictureBox
    Friend WithEvents cmdSaveDTSScript As System.Windows.Forms.Button
    Friend WithEvents tbFixes As System.Windows.Forms.TabPage
    Friend WithEvents cmdExecuteSQLScript As System.Windows.Forms.Button
    Friend WithEvents GroupBox3 As System.Windows.Forms.GroupBox
    Friend WithEvents txtSQLScript As System.Windows.Forms.TextBox
    Friend WithEvents Panel6 As System.Windows.Forms.Panel
    Friend WithEvents TextBox5 As System.Windows.Forms.TextBox
    Friend WithEvents Label11 As System.Windows.Forms.Label
    Friend WithEvents PictureBox9 As System.Windows.Forms.PictureBox
    Friend WithEvents cmdSaveFixes As System.Windows.Forms.Button
    Friend WithEvents Label14 As System.Windows.Forms.Label
    Friend WithEvents cboSourcePK As System.Windows.Forms.ComboBox
    Friend WithEvents cmdRemove As System.Windows.Forms.Button
    Friend WithEvents BackgroundWorker1 As System.ComponentModel.BackgroundWorker
    Friend WithEvents pgbarTempTable As System.Windows.Forms.ProgressBar
    Friend WithEvents rdoUsedEditedViewSQL As System.Windows.Forms.RadioButton
    Friend WithEvents rdoUseIntialView As System.Windows.Forms.RadioButton
    Friend WithEvents cmdCreateIntialViewSQL As System.Windows.Forms.Button
    Friend WithEvents cmdCreateDTSScript As System.Windows.Forms.Button

End Class
