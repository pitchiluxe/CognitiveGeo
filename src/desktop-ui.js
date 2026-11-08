const desktop=window.cognitiveDesktop;
if(desktop){
 const bar=document.createElement('aside');bar.className='desktop-update';bar.setAttribute('role','status');bar.hidden=true;document.body.append(bar);
 const render=status=>{bar.replaceChildren();const title=document.createElement('strong'),text=document.createElement('p'),action=document.createElement('button'),dismiss=document.createElement('button');dismiss.className='desktop-update-close';dismiss.textContent='×';dismiss.setAttribute('aria-label','Dismiss update notice');dismiss.onclick=()=>{bar.hidden=true;};bar.append(dismiss,title,text);action.className='button primary';
  if(status.state==='available'){title.textContent=`CognitiveGeo ${status.version} is available`;text.textContent='A new release from Erick Omari is ready. Download it when convenient.';action.textContent='Download update';action.onclick=()=>desktop.downloadUpdate();bar.append(action);bar.hidden=false;}
  else if(status.state==='downloading'){title.textContent='Downloading CognitiveGeo';text.textContent=`${status.percent||0}% downloaded. You can keep using the app.`;bar.hidden=false;}
  else if(status.state==='ready'){title.textContent='Your update is ready';text.textContent='Restart when you are ready to install the new version.';action.textContent='Restart & install';action.onclick=()=>desktop.installUpdate();bar.append(action);bar.hidden=false;}
  else if(status.state==='error'){title.textContent='Update check unavailable';text.textContent=status.message;action.textContent='Try again';action.onclick=()=>desktop.checkForUpdates();bar.append(action);bar.hidden=false;}
  else if(status.state==='current'){title.textContent='CognitiveGeo is up to date';text.textContent=`You are running the latest available version (${status.version}).`;bar.hidden=false;setTimeout(()=>{bar.hidden=true;},5000);}
 };
 desktop.onUpdate(render);desktop.getInfo().then(info=>{document.title=`CognitiveGeo ${info.version} · Erick Omari`;const version=document.querySelector('.version');if(version)version.textContent=`v${info.version}`;if(['available','ready','downloading'].includes(info.update.state))render(info.update);});
}
