var storageData;

chrome.storage.sync.get(function(items) {
    if (items)
        storageData = items;
});

function createWindow(param) {
    param.id = (typeof param.id !== 'undefined' ? param.id : 'window');
    chrome.app.window.create(param.url, {
        frame: 'none',
        id: param.id,
        resizable: true,
        alwaysOnTop: true
    }, function (appwindow) {

        appwindow.contentWindow.onload = function () {

            var bodyObj = appwindow.contentWindow.document.querySelector('body'),
                buttonsObj = appwindow.contentWindow.document.getElementById('buttons'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                browserObj = appwindow.contentWindow.document.getElementById('browser-window-button'),
                settingsObj = appwindow.contentWindow.document.getElementById('settings-window-button'),
                minimizeObj = appwindow.contentWindow.document.getElementById('minimize-window-button'),
                webview = appwindow.contentWindow.document.getElementById('panel-container'),
                timeout = null,
                helpOpened = false;

            closeObj.onclick = function () {
                appwindow.contentWindow.close();
            };
            if (settingsObj){
                settingsObj.onclick = function () {
                    appwindow.contentWindow.close();
                    createWindow({ 'url': 'options.html', 'id': 'options', 'bounds': { width: 450, height: 515 } });
                };
            }
            if (browserObj){
                browserObj.onclick = function () {
                    appwindow.contentWindow.close();
                    createWindow({ 'url': 'window.html', 'id': 'window' });
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


            buttonsObj.classList.add('fadeout');
            webview.onmouseenter = function () {
                console.log('onmouseenter');
                if (window.removeButtonsTimer) clearTimeout(window.removeButtonsTimer);

                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                if (webview)
                    webview.classList.add('movedown');
            };
            webview.onmouseleave = function () {
                console.log('onmouseleave');
                if (false === helpOpened) {
                    window.removeButtonsTimer = setTimeout(() => {
                        buttonsObj.classList.remove('fadein');
                        buttonsObj.classList.add('fadeout');
                        if (webview)
                            webview.classList.remove('movedown');
                    }, 300)
                }
            };


            chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
                if (request === 'fullscreen') {
                    toggleFullscreen();
                }
                if (typeof request.bounds !== 'undefined' && request.bounds !== null) {
                    if (request.bounds.w && request.bounds.h) {
                        var appwindow = (typeof request.sender !== 'undefined' ? chrome.app.window.get(request.sender) : chrome.app.window.getAll()[0]);
                        appwindow.resizeTo(request.bounds.w,request.bounds.h);
                    }
                }
            });


        }

	});
}

// hotkeys
window.addEventListener('keydown', function(e) {
    // CTRL + N
    if (e.ctrlKey && e.keyCode == 78) {
        // Open options
        chrome.runtime.sendMessage({'open': 'options'});
    }
});

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
        var appwindow = chrome.app.window.getAll()[0];

        appwindow.close();

        setTimeout(function () {
            createWindow(request);
        }, 250);

    }
});

// Launch options
chrome.app.runtime.onLaunched.addListener(function () {
    var launchOpen = { 'url': 'options.html', 'id': 'options'};
    if (storageData && storageData.url !== 'undefined' && storageData.url !== '')
        launchOpen = { 'url': 'window.html', 'id': 'window'};
    createWindow(launchOpen);
});

// Launch app
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    var allWindows = chrome.app.window.getAll()[0];
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
        setTimeout(function(){
            createWindow({ 'url': 'window.html', 'id': 'window' });
        },250);
    }
    if (request.open === 'options') {
        setTimeout(function(){
            createWindow({ 'url': 'options.html', 'id': 'options', 'bounds': { width: 450, height: 515 }, innerBounds: { minWidth: 360 } });
        },250);
    }
    if (request.close === 'options') {
        chrome.app.window.get('options').close();
    }
});

var minimized = false;
