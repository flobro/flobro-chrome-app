var service, tracker, alertEl, bounds={};
bounds.w=450;bounds.h=610;

var input = document.getElementById('input-request-url');
var form = document.getElementById('request-url');
var window_title = document.getElementById('document-title');
var locale_appAlertSomethingWrong = chrome.i18n.getMessage('appAlertSomethingWrong');

document.title = chrome.i18n.getMessage('appLabelSettings');
window_title.innerText = chrome.i18n.getMessage('appLabelSettings');

// Set locale texts
document.querySelectorAll('.locale').forEach(function(locale){ locale.innerText = chrome.i18n.getMessage(locale.id); });
// Exception for element who can't use .locale
document.getElementById('minimize-window-button').title = chrome.i18n.getMessage('appLabelMinimize');
document.getElementById('browser-window-button').title = chrome.i18n.getMessage('appLabelBrowser');
document.getElementById('close-window-button').title = chrome.i18n.getMessage('appLabelClose');
document.getElementById('input-request-url').placeholder = chrome.i18n.getMessage('appPlaceholderUrl');

// add version number
document.getElementById('version-number').innerText = chrome.runtime.getManifest().version;

// hotkeys
window.addEventListener('keydown', function(e) {
    // Esc
    if (e.keyCode == 27) {
        // Shift + Esc
        if (e.shiftKey) {
            // Close all
            var CloseWithShiftEsc = analytics.EventBuilder.builder()
                .category('App')
                .action('Close')
                .dimension(1, 'Shift Esc');
            tracker.send(CloseWithShiftEsc);
            // Prevent further execution
            return;
        }
        // Launch main window
        var SwitchWithEsc = analytics.EventBuilder.builder()
                .category('App')
                .action('Switch')
                .dimension(1, 'Esc');
        tracker.send(SwitchWithEsc).addCallback(function() {
            chrome.runtime.sendMessage({'open': 'window'});
        }.bind(this));
    }
});


alertEl = document.getElementById('alert');
window.alert = function(message, className) {
    if(typeof alertEl === 'undefined')
        var alertEl = document.getElementById('alert');
    if(typeof message === 'undefined' || message === ''){
        alertEl.hidden = true;
    } else {
        alertEl.innerHTML = message;
        alertEl.className = (typeof className!=='undefined' && className!=='' ? className : '');
        alertEl.hidden = false;
    }
    // Set bounds
    document.querySelectorAll("body > *").forEach(function(node){
        var cv = node.getBoundingClientRect();
        if(cv.width > bounds.w)
            bounds.w = cv.width+1;
        if(cv.height > bounds.h)
            bounds.h = cv.height;
    });
    chrome.runtime.sendMessage({'sender': 'options', 'bounds': bounds});
    return;
}

// Fill default data
window.addEventListener('load', function(e) {
    chrome.storage.sync.get(function(items) {
        if (items.url !== undefined && items.url !== '')
            input.value = items.url;
    });
});

// redirect focus
window.addEventListener('focus', function(e) {
    input.focus();
});

form.addEventListener("submit", function(e){
    e.preventDefault();
    var newUrl = input.value;
    tracker.sendEvent('Browser', 'Set URL', newUrl);
    chrome.storage.sync.set({ url: newUrl });
    chrome.storage.sync.get(function(items) {
        if (items.url === undefined || items.url === '') {
            var AlertSomethingWrong = analytics.EventBuilder.builder()
                .category('Errors')
                .action('Alert')
                .dimension(1, 'Something went wrong');
            tracker.send(AlertSomethingWrong);
            alert(locale_appAlertSomethingWrong);
        }
        else {
            alert( chrome.i18n.getMessage('appTipSetDifferentUrl'), 'tip');
            setTimeout(function(){
                chrome.runtime.sendMessage({'open': 'window'},function(){
                    chrome.runtime.sendMessage({'close': 'options'});
                });
            },1500);
        }
    });
});

// Allow opt-out
function initSettings(config) {
    // Release loading text
    document.getElementById('improve-by-tracking-opt-in').hidden = false;
    alert();

    var checkboxImproveByTracking = document.getElementById('improve-by-tracking');
    checkboxImproveByTracking.checked = config.isTrackingPermitted();
    checkboxImproveByTracking.onchange = function() {
        var SetTracking;
        switch(checkboxImproveByTracking.checked) {
            case true:
                SetTracking = analytics.EventBuilder.builder()
                    .category('App')
                    .action('Switch Tracking')
                    .dimension(1, 'on');
                console.info('%c' + chrome.i18n.getMessage('appMiscYouAreAmazing'), 'font-size:20px;background-color:#d6ff97');
                break;
            default:
                SetTracking = analytics.EventBuilder.builder()
                    .category('App')
                    .action('Switch Tracking')
                    .dimension(2, 'off');
                console.warn('%c' + chrome.i18n.getMessage('appMiscConsiderTracking'), 'font-size:20px;background-color:#fff3c6');
        }
        tracker.send(SetTracking);
        config.setTrackingPermitted(checkboxImproveByTracking.checked);
    };
}

// Learn and improve from app usage
window.addEventListener('load', function() {
    // Initialize the Analytics service object with the name of your app.
    service = analytics.getService('cornips_fbw');
    service.getConfig().addCallback(initSettings);

    // Get a Tracker using your Google Analytics app Tracking ID.
    tracker = service.getTracker('UA-84858849-3');

    // Record an "appView" each time the user launches the app
    tracker.sendAppView('OptionsView');

    // Track locale
    var locale = chrome.i18n.getUILanguage();
    var InitLanguage;
    switch(locale) {
        case 'nl':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('OptionsView')
                .dimension(2, 'Dutch');
            break;
        default:
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('OptionsView')
                .dimension(1, 'English');
    }
    tracker.send(InitLanguage);

});
