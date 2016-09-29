var bounds,storageData;

chrome.storage.sync.get(function(items) {
    if (items)
        storageData = items;
});

function createWindow(param) {
    param.id = (typeof param.id !== 'undefined' ? param.id : 'window');
    chrome.app.window.create(param.url, {
        frame: 'none',
        id: param.id,
        innerBounds: { width: 20, height: 20 },
        resizable: true,
        alwaysOnTop: true
    }, function (appwindow) {

        appwindow.contentWindow.onload = function () {

            var bodyObj = appwindow.contentWindow.document.querySelector('body'),
                buttonsObj = appwindow.contentWindow.document.getElementById('buttons'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                minimizeObj = appwindow.contentWindow.document.getElementById('minimize-window-button'),
                backgroundObj = appwindow.contentWindow.document.getElementById('background'),
                timeout = null,
                helpOpened = false;

            // Check for boundary setting and adjust window
            var checkBoundsTries = 0;
            var checkBounds = setInterval(function(){
                if (checkBoundsTries < 500 && chrome.app.window.getAll().length) {
                    checkBoundsTries++;
                    bounds = appwindow.contentWindow.bounds;
                    if (typeof bounds !== 'undefined' && bounds !== null) {
                        if (bounds.w && bounds.h) {
                            chrome.runtime.sendMessage({'sender':param.id, 'bounds': bounds});
                            clearInterval(checkBounds);
                        }
                    }
                } else {
                    clearInterval(checkBounds);
                }
            }, 250);

            closeObj.onclick = function () {
                appwindow.contentWindow.close();
            };
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

            backgroundObj.style.display = 'none';
            buttonsObj.classList.add('fadeout');

            bodyObj.onmousemove = function () {
                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (false === helpOpened) {
                        buttonsObj.classList.remove('fadein');
                        buttonsObj.classList.add('fadeout');
                    }
                }, 2000);
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

        };

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
            createWindow({ 'url': 'options.html', 'id': 'options' });
        },250);
    }
    if (request.close === 'options') {
        chrome.app.window.get('options').close();
    }
});

var minimized = false;
