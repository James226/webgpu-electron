const {app, BrowserWindow} = require('electron')

app.commandLine.appendSwitch('enable-unsafe-webgpu')

function createWindow () {
  const mainWindow = new BrowserWindow()

  mainWindow.loadURL('https://austineng.github.io/webgpu-samples/?wgsl=0#rotatingCube')
}

app.whenReady().then(createWindow)