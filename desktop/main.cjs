const {app,BrowserWindow,Menu,Notification,ipcMain,shell,dialog}=require('electron');
const {autoUpdater}=require('electron-updater');
const path=require('node:path');
const {startLocalServer}=require('./server.cjs');
let window,local,checkTimer,lastCheck=0,checking=false,checkingManual=false,status={state:'idle'};const notified=new Set();
const smoke=process.argv.includes('--smoke-test')||process.argv.includes('--smoke-test-updates');
app.setAppUserModelId('com.erickomari.cognitivegeo');
if(!app.requestSingleInstanceLock()){app.quit();}else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
 app.whenReady().then(async()=>{
  local=await startLocalServer(path.join(app.getAppPath(),'dist'),{port:35471});
  window=new BrowserWindow({width:1450,height:1000,minWidth:760,minHeight:620,title:'CognitiveGeo · Created by Erick Omari',backgroundColor:'#080d13',show:false,icon:path.join(__dirname,'resources','icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
  window.once('ready-to-show',()=>{if(!smoke)window.show();});
  const trusted=event=>event.sender===window?.webContents&&event.senderFrame?.url?.startsWith(local.origin+'/');
  const external=url=>{try{const parsed=new URL(url);if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password)shell.openExternal(parsed.href);}catch{}};
  window.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{try{if(new URL(url).origin!==local.origin){event.preventDefault();external(url);}}catch{event.preventDefault();}});
  window.webContents.session.setPermissionRequestHandler((_contents,permission,callback)=>callback(permission==='fullscreen'));
  ipcMain.handle('desktop:info',event=>{if(!trusted(event))throw new Error('Untrusted window.');return {version:app.getVersion(),platform:process.platform,packaged:app.isPackaged,update:status};});
  ipcMain.handle('updates:check',event=>{if(!trusted(event))throw new Error('Untrusted window.');return checkUpdates(true);});
  ipcMain.handle('updates:download',async event=>{if(!trusted(event))throw new Error('Untrusted window.');if(status.state!=='available')return;try{await autoUpdater.downloadUpdate();}catch{publish({state:'error',message:'The update could not download. Check your connection and try again.'});}});
  ipcMain.handle('updates:install',event=>{if(!trusted(event))throw new Error('Untrusted window.');if(status.state==='ready')setImmediate(()=>autoUpdater.quitAndInstall(false,true));});
  autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;autoUpdater.setFeedURL({provider:'github',owner:'pitchiluxe',repo:'CognitiveGeo'});
  autoUpdater.on('checking-for-update',()=>publish({state:'checking'}));autoUpdater.on('update-not-available',info=>publish({state:checkingManual?'current':'idle',version:info.version}));
  autoUpdater.on('update-available',info=>{publish({state:'available',version:info.version});if(!smoke&&!notified.has(info.version)&&Notification.isSupported()){notified.add(info.version);const notice=new Notification({title:'CognitiveGeo update available',body:`Version ${info.version} is ready to download. Open the app to update.`,icon:path.join(__dirname,'resources','icon.png')});notice.on('click',()=>{window.show();window.focus();publish(status);});notice.show();}});
  autoUpdater.on('download-progress',progress=>publish({state:'downloading',percent:Math.round(progress.percent)}));autoUpdater.on('update-downloaded',info=>{publish({state:'ready',version:info.version});if(Notification.isSupported())new Notification({title:'CognitiveGeo update downloaded',body:'Restart from the app when you are ready to install.'}).show();});autoUpdater.on('error',()=>publish({state:'error',message:'Updates could not be checked. You can try again from the Help menu.'}));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'CognitiveGeo',submenu:[{label:'Open atlas',click:()=>window.loadURL(local.origin+'/app.html')},{label:'Visit website',click:()=>external('https://pitchiluxe.github.io/CognitiveGeo/')},{type:'separator'},{role:'quit'}]},{label:'View',submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]},{label:'Help',submenu:[{label:'Check for updates',click:()=>checkUpdates(true)},{label:'GitHub releases',click:()=>external('https://github.com/pitchiluxe/CognitiveGeo/releases')},{label:'About CognitiveGeo',click:()=>dialog.showMessageBox(window,{type:'info',title:'CognitiveGeo',message:`CognitiveGeo ${app.getVersion()}`,detail:'Created by Erick Omari. A global perspective on AI models, infrastructure, history, and invention ideas.'})}]}]));
  await window.loadURL(local.origin+'/app.html');
  if(smoke){await new Promise(resolve=>setTimeout(resolve,5000));const result=await window.webContents.executeJavaScript(`({title:document.title,canvas:!!document.querySelector('#globe canvas'),tabs:document.querySelectorAll('[data-explore]').length,desktop:!!window.cognitiveDesktop})`);if(process.argv.includes('--smoke-test-updates'))await checkUpdates(true);console.log(JSON.stringify({smoke:result,update:status,version:app.getVersion()}));app.exit(result.canvas&&result.tabs===8&&result.desktop?0:1);return;}
  window.on('focus',()=>{if(Date.now()-lastCheck>15*60*1000)checkUpdates();});setTimeout(()=>checkUpdates(),15000).unref();checkTimer=setInterval(()=>checkUpdates(),6*60*60*1000);checkTimer.unref();
 }).catch(error=>{if(smoke){console.error(error.message);app.exit(1);}else{dialog.showErrorBox('CognitiveGeo could not start',error.message);app.quit();}});
 app.on('window-all-closed',()=>app.quit());app.on('before-quit',()=>{clearInterval(checkTimer);local?.close();});
}
function publish(next){status=next;if(window&&!window.isDestroyed())window.webContents.send('updates:status',next);}
async function checkUpdates(manual=false){if(!app.isPackaged){publish({state:'development',message:'Update checks run in the installed Windows app.'});return;}if(checking||['downloading','ready'].includes(status.state))return;checking=true;checkingManual=manual;lastCheck=Date.now();try{await autoUpdater.checkForUpdates();}catch{publish({state:manual?'error':'unavailable',message:manual?'Could not reach GitHub releases. Check your connection and try again.':'Updates are temporarily unavailable.'});}finally{checking=false;checkingManual=false;}}
