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
    }, function (appWindow) {
        const addStyle = function (styleString) {
          const style = appWindow.contentWindow.document.createElement('style');
          style.textContent = styleString;
          appWindow.contentWindow.document.head.append(style);
        }

        appWindow.contentWindow.onload = function () {
            const bodyObj = appWindow.contentWindow.document.querySelector('body'),
                window_title = appWindow.contentWindow.document.getElementById('document-title'),
                showToolbarObj = appWindow.contentWindow.document.getElementById('show-toolbar-button'),
                hideToolbarObj = appWindow.contentWindow.document.getElementById('hide-toolbar-button'),
                toolbarObj = appWindow.contentWindow.document.getElementById('toolbar'),
                actionBar = appWindow.contentWindow.document.getElementsByClassName('actions')[0],
                zoomInObj = appWindow.contentWindow.document.getElementById('zoom-in-window-button'),
                zoomResetObj = appWindow.contentWindow.document.getElementById('zoom-reset-window-button'),
                zoomOutObj = appWindow.contentWindow.document.getElementById('zoom-out-window-button'),
                aspectObj = appWindow.contentWindow.document.getElementById('aspect-window-button'),
                pinObj = appWindow.contentWindow.document.getElementById('pin-window-button'),
                minimizeObj = appWindow.contentWindow.document.getElementById('minimize-window-button'),
                closeObj = appWindow.contentWindow.document.getElementById('close-window-button'),
                settingsObj = appWindow.contentWindow.document.getElementById('settings-window-button'),
                webview = appWindow.contentWindow.document.getElementById('panel-container');

            // Set action bar items count
            addStyle(`
              :root {
                --action-bar-items: ${actionBar.children.length};
              }
            `);

            function disappearBar() {
                clearTimeout(appWindow.contentWindow.removeToolbarTimer);
                if (!window.removeToolbarForbidden) {
                    const storageTitleBarTimeOut = storageData?.titlebartimeout ?? 1.5;
                    appWindow.contentWindow.removeToolbarTimer = setTimeout(() => {
                        toolbarObj.classList.remove('fadein');
                        toolbarObj.classList.add('fadeout');
                        if (webview)
                            webview.classList.remove('movedown');
                    }, (storageTitleBarTimeOut > .5 ? storageTitleBarTimeOut : 1.5)*1000);
                }
            }

            appWindow.contentWindow.document.title = chrome.i18n.getMessage('appName');

            if (window_title) {
                window_title.innerText = chrome.i18n.getMessage('appName');
            }
            if (zoomInObj){
                zoomInObj.onclick = function () {
            		webview.setZoom( appWindow.contentWindow.webview_zoom_level += .1 );
                };
            }
            if (zoomResetObj){
                zoomResetObj.onclick = function () {
                    webview.setZoom( appWindow.contentWindow.webview_zoom_level = 1 );
                };
            }
            if (zoomOutObj){
                zoomOutObj.onclick = function () {
                    webview.setZoom( appWindow.contentWindow.webview_zoom_level -= .1 );
                };
            }
            if (aspectObj){
                aspectObj.onclick = function () {
                    var width = appWindow.innerBounds.width;
                    appWindow.innerBounds.height = Math.round(width * (9/16));
                };
            }
            if (pinObj){
                if (storageData?.stayontop)
                    pinObj.classList.add('pinned');
                else
                    pinObj.classList.remove('pinned');

                pinObj.onclick = function () {
                    appWindow.setAlwaysOnTop( pinObj.classList.toggle('pinned') );
                };
            }
            if (settingsObj){
                settingsObj.title = chrome.i18n.getMessage('appLabelSettings');
                settingsObj.onclick = function () {
                    appWindow.contentWindow.chrome.runtime.sendMessage({'open': 'options'});
                };
            }
            if (minimizeObj){
                minimizeObj.title = chrome.i18n.getMessage('appLabelMinimize');
                minimizeObj.onclick = function () {
                    appWindow.minimize();
                };
            }
            if (closeObj){
                closeObj.title = chrome.i18n.getMessage('appLabelClose');
                closeObj.onclick = function () {
                    appWindow.contentWindow.close();
                };
            }

            toggleFullscreen = function () {
                if (appWindow.isFullscreen()) {
                    appWindow.restore();
                } else {
                    appWindow.fullscreen();
                }
            };

            // Move title bar in and out
            toolbarObj.classList.add('fadeout');
            if (!storageData?.dontresize && webview) webview.classList.add('resize');
            showToolbarObj.onclick = function () {
                toolbarObj.classList.remove('fadeout');
                toolbarObj.classList.add('fadein');
                if (webview)
                    webview.classList.add('movedown');
            }
            hideToolbarObj.onclick = function () {
                toolbarObj.classList.add('fadeout');
                toolbarObj.classList.remove('fadein');
                if (webview)
                    webview.classList.remove('movedown');
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
        const appWindow = chrome.app.window.getAll()[0];
        appWindow.close();
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
