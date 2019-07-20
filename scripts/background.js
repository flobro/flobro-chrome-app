let storageData;

const settingsBoundaries = { width: 450, height: 560, minWidth: 360, minHeight: 560 };
const browserBoundaries = { width: 500, height: 340, minWidth: 130, minHeight: 38 };

chrome.storage.sync.get(function(items) {
    if (items)
        storageData = items;
});
chrome.storage.sync.onChanged.addListener(function(items) {
    if (items)
        Object.entries(items).forEach(function(key, value) {
            storageData[key[0]] = key[1].newValue; });
});

function createWindow(param) {
    param.id = (typeof param.id !== 'undefined' ? param.id : 'window');
    param.frame = (typeof param.frame !== 'undefined' ? param.frame : 'none');
    param.outerBounds = (typeof param.outerBounds !== 'undefined' ? param.outerBounds : { width: 500, height: 340, minWidth: 130, minHeight: 38 });
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
                minimizeObj = appwindow.contentWindow.document.getElementById('minimize-window-button'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                settingsObj = appwindow.contentWindow.document.getElementById('settings-window-button'),
                webview = appwindow.contentWindow.document.getElementById('panel-container'),
                timeout = null,
                helpOpened = false;

            closeObj.onclick = function () {
                appwindow.contentWindow.close();
            };
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
                if (window.removeButtonsTimer) clearTimeout(window.removeButtonsTimer);
            }
            bodyObj.onmouseenter = function () {
                if (window.removeButtonsTimer) clearTimeout(window.removeButtonsTimer);

                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                if (webview)
                    webview.classList.add('movedown');
            }
            buttonsObj.onmouseleave = function () {
                if (false === helpOpened) {
                    window.removeButtonsTimer = setTimeout(() => {
                        buttonsObj.classList.remove('fadein');
                        buttonsObj.classList.add('fadeout');
                        if (webview)
                            webview.classList.remove('movedown');
                    }, 1000)
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
