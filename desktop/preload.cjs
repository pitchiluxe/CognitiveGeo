const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('cognitiveDesktop',Object.freeze({
 rendererReady:()=>ipcRenderer.send('desktop:ready'),
 reportStartupFailure:message=>ipcRenderer.send('desktop:startup-failed',String(message).slice(0,300)),
 getInfo:()=>ipcRenderer.invoke('desktop:info'),
 checkForUpdates:()=>ipcRenderer.invoke('updates:check'),
 downloadUpdate:()=>ipcRenderer.invoke('updates:download'),
 installUpdate:()=>ipcRenderer.invoke('updates:install'),
 onUpdate:callback=>{if(typeof callback!=='function')return()=>{};const listener=(_event,payload)=>callback(payload);ipcRenderer.on('updates:status',listener);return()=>ipcRenderer.removeListener('updates:status',listener);},
}));
