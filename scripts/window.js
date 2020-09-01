/*global chrome, analytics */
const webview = document.getElementById('panel-container'),
    window_title = document.getElementById('document-title'),
    favicon_image = document.getElementById('document-favicon'),
    appID = chrome.i18n.getMessage('@@extension_id'), // this app
    NODE_TLS_REJECT_UNAUTHORIZED = '0';// allow self-signed certificates
var webview_zoom_level = null;

// Set locale texts
document.querySelectorAll('.locale').forEach(function(locale){ locale.innerText = chrome.i18n.getMessage(locale.id); });
// Exception for element who can't use .locale

// Get URL
window.addEventListener('load', function(e) {
    chrome.storage.sync.get(function(items) {
        if (items.url !== undefined && items.url !== ''){
            window.tracker.sendEvent('Browser', 'Load URL', items.url);
            webview.setAttribute('src', items.url);
            webview.getZoom(function(zoomFactor){webview_zoom_level = zoomFactor;});
        } else{
            var SwitchBecauseNoUrl = analytics.EventBuilder.builder()
                .category('App')
                .action('Switch')
                .dimension(2, 'Missing URL');
            window.tracker.send(SwitchBecauseNoUrl).addCallback(function() {
                chrome.runtime.sendMessage({'open': 'options'});
            }.bind(this));
        }
    });
});

// inset styles and scripts
favicon_image.addEventListener('loadcommit', function(e) {
    if (e.isTopLevel) {
        favicon_image.insertCSS({
            file: './styles/favicon_webview.css',
            runAt: 'document_start'
        });
    }
});
webview.addEventListener('loadcommit', function(e) {
    if (e.isTopLevel) {
        webview.insertCSS({
            file: './styles/inner_webview.css',
            runAt: 'document_start'
        });
        // Set app title to document title
        var titleFirstTime = true;
        webview.executeScript(
            {
                code: 'document.title',
                runAt: 'document_end'
            },
            function(results){
                if (results && results[0]) {
                    document.title = results[0];
                    window_title.innerText = results[0];
                } else {
                    if (!titleFirstTime) {
                        var AlertNoTitle = analytics.EventBuilder.builder()
                            .category('Errors')
                            .action('Alert')
                            .dimension(3, 'No document title');
                        window.tracker.send(AlertNoTitle);
                    } else
                        titleFirstTime = false;
                }
            }
        );
        webview.executeScript(
            {
                code: 'document.location.hostname',
                runAt: 'document_end'
            },
            function(results){
                if (results && results[0]) {
                    fetch("https://favicongrabber.com/api/grab/" + results[0])
                        .then(response => response.json())
                        .then(({ icons }) => {
                            if (icons[0]?.src)
                                favicon_image.src = icons[0]?.src
                        })
                }
            }
        );
    }
});

// send new-window-links to browser
webview.addEventListener('newwindow', function(e) {
    e.stopImmediatePropagation();
    window.tracker.sendEvent('Browser', 'New window', e.targetUrl).addCallback(function() {
        window.open(e.targetUrl);
    }.bind(this));
});

// fix webview lose focus
window.addEventListener('focus', function(e) {
    webview.focus();
});

// allow download and fullscreen
webview.addEventListener('permissionrequest', function(e) {
    if (e.permission === 'download' || e.permission === 'fullscreen') {
        e.request.allow();
    }
});

// open cached links
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (sender.id == appID) {
        webview.src = request;
    }

    if (typeof request.dontresize !== 'undefined') {
        if (request.dontresize) webview.classList.remove('resize');
        else webview.classList.add('resize');
    }
});

// Learn and improve from app usage
window.addEventListener('load', function() {
    // Initialize the Analytics service object with the name of your app.
    const service = analytics.getService('cornips_fbw');

    // Get a Tracker using your Google Analytics app Tracking ID.
    window.tracker = service.getTracker('UA-84858849-3');

    // Record an "appView" each time the user launches the app
    window.tracker.sendAppView('WindowView');

    // Track locale
    var locale = chrome.i18n.getUILanguage();
    var InitLanguage;
    switch(locale) {
        case 'pl':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(4, 'Polish');
            break;
        case 'de':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(3, 'German');
            break;
        case 'nl':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(2, 'Dutch');
            break;
        default:
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(1, 'English');
    }
    window.tracker.send(InitLanguage);
});