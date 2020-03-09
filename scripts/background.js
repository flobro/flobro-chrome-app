var storageData;

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
        alwaysOnTop: true,
        outerBounds: param.outerBounds,
    }, function (appwindow) {

        appwindow.contentWindow.onload = function () {

            const bodyObj = appwindow.contentWindow.document.querySelector('body'),
                buttonsObj = appwindow.contentWindow.document.getElementById('buttons'),
                aspectObj = appwindow.contentWindow.document.getElementById('aspect-window-button'),
                pinObj = appwindow.contentWindow.document.getElementById('pin-window-button'),
                minimizeObj = appwindow.contentWindow.document.getElementById('minimize-window-button'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                settingsObj = appwindow.contentWindow.document.getElementById('settings-window-button'),
                webview = appwindow.contentWindow.document.getElementById('panel-container');

                function disappearBar() {
                    clearTimeout(appwindow.contentWindow.removeButtonsTimer);
                    if (!window.removeButtonsForbidden && !appwindow.contentWindow.pinnedTitleBar) {
                        appwindow.contentWindow.removeButtonsTimer = setTimeout(() => {
                            buttonsObj.classList.remove('fadein');
                            buttonsObj.classList.add('fadeout');
                            if (webview)
                                webview.classList.remove('movedown');
                        }, (storageData && storageData.titlebartimeout !== 'undefined' && storageData.titlebartimeout > .5 ? storageData.titlebartimeout : 1.5)*1000);
                    }
                }

            closeObj.onclick = function () {
                appwindow.contentWindow.close();
            };
            if (aspectObj){
                aspectObj.onclick = function () {
            		var width = appwindow.innerBounds.width;
                    appwindow.innerBounds.height = Math.round(width * (9/16));
                };
            }
            if (pinObj){
                pinObj.onclick = function () {
                    if (pinObj.classList.toggle('pinned'))
                        appwindow.contentWindow.pinnedTitleBar = true;
                    else {
                        appwindow.contentWindow.pinnedTitleBar = false;
                        disappearBar();
                    }
                };
            }
            if (settingsObj){
                settingsObj.onclick = function () {
                    appwindow.contentWindow.chrome.runtime.sendMessage({'open': 'options'});
                };
            }
            minimizeObj.onclick = function () {
                appwindow.minimize();
            };
            toggleFullscreen = function () {
                if (appwindow.isFullscreen()) {
                    appwindow.restore();
                } else {
                    appwindow.fullscreen();
                }
            };

            // Move title bar in and out
            buttonsObj.classList.add('fadeout');
            if (!storageData.dontresize && webview) webview.classList.add('resize');
            buttonsObj.onmousemove = function () {
                disappearBar();
            }
            bodyObj.onmousemove = function () {
                clearTimeout(appwindow.contentWindow.removeButtonsTimer);

                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                if (webview)
                    webview.classList.add('movedown');

                if (!appwindow.contentWindow.pinnedTitleBar) {
                    disappearBar();
                }
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
    if (storageData && storageData.url !== 'undefined' && storageData.url !== '')
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
