/* global chrome */
let storageData;
const settingsBoundaries = { width: 450, height: 630, minWidth: 360, minHeight: 630 };
const browserBoundaries = { width: 500, height: 340, minWidth: 170, minHeight: 38 };

chrome.storage.sync.get(function(items) {
    if (items)
        storageData = items;
});
chrome.storage.sync.onChanged.addListener(function(items) {
    if (items)
        Object.entries(items).forEach(function(key, value) {
            storageData[key[0]] = key[1].newValue;
        });
});

function createWindow(param) {
    param.id = (typeof param.id !== 'undefined' ? param.id : 'window');
    param.frame = (typeof param.frame !== 'undefined' ? param.frame : 'none');
    param.outerBounds = (typeof param.outerBounds !== 'undefined' ? param.outerBounds : { width: 500, height: 340, minWidth: 170, minHeight: 38 });
    chrome.app.window.create(param.url, {
        frame: param.frame,
        id: param.id,
        resizable: true,
        alwaysOnTop: storageData?.stayontop ?? true,
        outerBounds: param.outerBounds,
    }, function (appwindow) {

        const addStyle = function (styleString) {
          const style = appwindow.contentWindow.document.createElement('style');
          style.textContent = styleString;
          appwindow.contentWindow.document.head.append(style);
        }

        appwindow.contentWindow.onload = function () {

            const bodyObj = appwindow.contentWindow.document.querySelector('body'),
                buttonsObj = appwindow.contentWindow.document.getElementById('buttons'),
                window_title = appwindow.contentWindow.document.getElementById('document-title'),
                actionBar = appwindow.contentWindow.document.getElementsByClassName('actions')[0],
                zoomInObj = appwindow.contentWindow.document.getElementById('zoom-in-window-button'),
                zoomResetObj = appwindow.contentWindow.document.getElementById('zoom-reset-window-button'),
                zoomOutObj = appwindow.contentWindow.document.getElementById('zoom-out-window-button'),
                aspectObj = appwindow.contentWindow.document.getElementById('aspect-window-button'),
                pinObj = appwindow.contentWindow.document.getElementById('pin-window-button'),
                minimizeObj = appwindow.contentWindow.document.getElementById('minimize-window-button'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                settingsObj = appwindow.contentWindow.document.getElementById('settings-window-button'),
                webview = appwindow.contentWindow.document.getElementById('panel-container');

            // Set action bar items count
            addStyle(`
              :root {
                --action-bar-items: ${actionBar.children.length};
              }
            `);

            function disappearBar() {
                clearTimeout(appwindow.contentWindow.removeButtonsTimer);
                if (!window.removeButtonsForbidden) {
                    const storageTitleBarTimeOut = storageData?.titlebartimeout ?? 1.5;
                    appwindow.contentWindow.removeButtonsTimer = setTimeout(() => {
                        buttonsObj.classList.remove('fadein');
                        buttonsObj.classList.add('fadeout');
                        if (webview)
                            webview.classList.remove('movedown');
                    }, (storageTitleBarTimeOut > .5 ? storageTitleBarTimeOut : 1.5)*1000);
                }
            }

            appwindow.contentWindow.document.title = chrome.i18n.getMessage('appName');

            if (window_title) {
                window_title.innerText = chrome.i18n.getMessage('appName');
            }
            if (zoomInObj){
                zoomInObj.onclick = function () {
            		webview.setZoom( appwindow.contentWindow.webview_zoom_level += .1 );
                };
            }
            if (zoomResetObj){
                zoomResetObj.onclick = function () {
                    webview.setZoom( appwindow.contentWindow.webview_zoom_level = 1 );
                };
            }
            if (zoomOutObj){
                zoomOutObj.onclick = function () {
                    webview.setZoom( appwindow.contentWindow.webview_zoom_level -= .1 );
                };
            }
            if (aspectObj){
                aspectObj.onclick = function () {
                    var width = appwindow.innerBounds.width;
                    appwindow.innerBounds.height = Math.round(width * (9/16));
                };
            }
            if (pinObj){
                if (storageData?.stayontop)
                    pinObj.classList.add('pinned');
                else
                    pinObj.classList.remove('pinned');

                pinObj.onclick = function () {
                    appwindow.setAlwaysOnTop( pinObj.classList.toggle('pinned') );
                };
            }
            if (settingsObj){
                settingsObj.title = chrome.i18n.getMessage('appLabelSettings');
                settingsObj.onclick = function () {
                    appwindow.contentWindow.chrome.runtime.sendMessage({'open': 'options'});
                };
            }
            if (minimizeObj){
                minimizeObj.title = chrome.i18n.getMessage('appLabelMinimize');
                minimizeObj.onclick = function () {
                    appwindow.minimize();
                };
            }
            if (closeObj){
                closeObj.title = chrome.i18n.getMessage('appLabelClose');
                closeObj.onclick = function () {
                    appwindow.contentWindow.close();
                };
            }

            toggleFullscreen = function () {
                if (appwindow.isFullscreen()) {
                    appwindow.restore();
                } else {
                    appwindow.fullscreen();
                }
            };

            // Move title bar in and out
            buttonsObj.classList.add('fadeout');
            if (!storageData?.dontresize && webview) webview.classList.add('resize');
            buttonsObj.onmousemove = function () {
                disappearBar();
            }
            bodyObj.onmousemove = function () {
                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                if (webview)
                    webview.classList.add('movedown');

                disappearBar();
            }

            for (let i = 0; i < buttonsObj.children.length; i++) {
                buttonsObj.children[i].onmouseenter = function () {
                    window.removeButtonsForbidden = true;
                    clearTimeout(appwindow.contentWindow.removeButtonsTimer);
                }
                buttonsObj.children[i].onmouseleave = function () {
                    window.removeButtonsForbidden = false;
                    disappearBar();
                }
            }
        }
	});
}

chrome.runtime.onMessageExternal.addListener(function (request, sender) {
    if (typeof request.launch === 'undefined') {
        return;
    }

    if (sender.id === extId || sender.id === devId) {
        chrome.storage.local.set({ 'extension': true });
        hasExt = true;
    }

    if (0 === chrome.app.window.getAll().length) {
        createWindow(request);
    } else {
        const appwindow = chrome.app.window.getAll()[0];
        appwindow.close();
        createWindow(request);
    }
});

// Open appropriate window on app launch
chrome.app.runtime.onLaunched.addListener(function () {
    let launchOpen = { url: 'options.html', id: 'options', outerBounds: settingsBoundaries };
    if (storageData?.url ?? false)
        launchOpen = { url: 'window.html', id: 'window', outerBounds: browserBoundaries };
    createWindow(launchOpen);
});

// Message listener
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    // Reopen window if already opened
    if (typeof request.open !== 'undefined') {
        if (chrome.app.window.get(request.open)) {
            chrome.app.window.get(request.open).onClosed.addListener(function(){
                createWindow({ 'url': request.open+'.html', 'id': request.open });
            });
            chrome.app.window.get(request.open).close();
            return;
        }
    }
    if (request.open === 'window') {
        createWindow({ url: 'window.html', id: 'window', outerBounds: browserBoundaries });
    }
    if (request.open === 'options') {
        createWindow({ url: 'options.html', id: 'options', outerBounds: settingsBoundaries });
    }
    if (request.close === 'options') {
        chrome.app.window.get('options').close();
    }
});
