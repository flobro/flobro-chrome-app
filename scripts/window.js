let service, tracker, alertEl, bounds={};
bounds.w=650;bounds.h=490;

const webview = document.getElementById('panel-container');
const window_title = document.getElementById('document-title');
const favicon_image = document.getElementById('document-favicon');
const appID = chrome.i18n.getMessage('@@extension_id'); // this app
const NODE_TLS_REJECT_UNAUTHORIZED = '0';// allow self-signed certificates

document.title = chrome.i18n.getMessage('appName');
window_title.innerText = chrome.i18n.getMessage('appName');

// Set locale texts
document.querySelectorAll('.locale').forEach(function(locale){ locale.innerText = chrome.i18n.getMessage(locale.id); });
// Exception for element who can't use .locale
document.getElementById('minimize-window-button').title = chrome.i18n.getMessage('appLabelMinimize');
document.getElementById('settings-window-button').title = chrome.i18n.getMessage('appLabelSettings');
document.getElementById('close-window-button').title = chrome.i18n.getMessage('appLabelClose');

const bodyObj = document.querySelector('body'),
    buttonsObj = document.getElementById('buttons');

// Get URL
window.addEventListener('load', function(e) {
    chrome.storage.sync.get(function(items) {
        if (items.url !== undefined && items.url !== ''){
            tracker.sendEvent('Browser', 'Load URL', items.url);
            webview.setAttribute('src', items.url);
        } else{
            var SwitchBecauseNoUrl = analytics.EventBuilder.builder()
                .category('App')
                .action('Switch')
                .dimension(2, 'Missing URL');
            tracker.send(SwitchBecauseNoUrl).addCallback(function() {
                chrome.runtime.sendMessage({'open': 'options'});
            }.bind(this));
        }
    });
});

// inset styles and scripts
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
                if (results[0]) {
                    document.title = results[0];
                    window_title.innerText = results[0];
                } else {
                    if (!titleFirstTime) {
                        var AlertNoTitle = analytics.EventBuilder.builder()
                            .category('Errors')
                            .action('Alert')
                            .dimension(3, 'No document title');
                        tracker.send(AlertNoTitle);
                    } else
                        titleFirstTime = false;
                }
            }
        );
        webview.executeScript(
            {
                code: 'document.URL',
                runAt: 'document_end'
            },
            function(results){
                if (results[0]) {
                    favicon_image.src = favicon_image.dataset.src + results[0];
                }
            }
        );

    }
});

// send new-window-links to browser
webview.addEventListener('newwindow', function(e) {
    e.stopImmediatePropagation();
    tracker.sendEvent('Browser', 'New window', e.targetUrl).addCallback(function() {
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
});

// Learn and improve from app usage
window.addEventListener('load', function() {
    // Initialize the Analytics service object with the name of your app.
    service = analytics.getService('cornips_fbw');
    // service.getConfig().addCallback(initAnalyticsConfig);

    // Get a Tracker using your Google Analytics app Tracking ID.
    tracker = service.getTracker('UA-84858849-3');

    // Record an "appView" each time the user launches the app
    tracker.sendAppView('WindowView');

    // Track locale
    var locale = chrome.i18n.getUILanguage();
    var InitLanguage;
    switch(locale) {
        case 'nl':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(2, 'Dutch');
            break;
        case 'de':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(2, 'German');
            break;
        default:
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('WindowView')
                .dimension(1, 'English');
    }
    tracker.send(InitLanguage);


});
