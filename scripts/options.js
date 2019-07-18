let service, tracker, alertEl;

const bounds = {w: 450, h: 610}
const formUrl = document.getElementById('request-url-form');
const inputUrl = document.getElementById('input-request-url');
const buttonUrlSave = document.getElementById('request-url-form').getElementsByTagName('button')[0];
const txtUrlHelpText = document.getElementById('url-help-text');
const window_title = document.getElementById('appTxtSettings');
const locale_appAlertSomethingWrong = chrome.i18n.getMessage('appAlertSomethingWrong');
const validUrlCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&\'()*+,;=';

document.title = chrome.i18n.getMessage('appLabelSettings');
window_title.innerText = chrome.i18n.getMessage('appLabelSettings');

// Set locale texts
document.querySelectorAll('.locale').forEach(function(locale){ locale.innerText = chrome.i18n.getMessage(locale.id); });
// Exception for element who can't use .locale
document.getElementById('minimize-window-button').title = chrome.i18n.getMessage('appLabelMinimize');
document.getElementById('browser-window-button').title = chrome.i18n.getMessage('appLabelBrowser');
document.getElementById('close-window-button').title = chrome.i18n.getMessage('appLabelClose');
inputUrl.placeholder = chrome.i18n.getMessage('appPlaceholderUrl');

// add version number
document.getElementById('version-number').innerText = chrome.runtime.getManifest().version;

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
            inputUrl.value = items.url;
    });
});

// redirect focus
inputUrl.addEventListener('focus', function(e) {
    this.select();
});

// Validate URL
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}
function validateEnteredUrl(elm, event) {
    const eventCheck = (event == 'keyup' && !Boolean(txtUrlHelpText.innerText))
    if (!validURL(elm.value)) {
        if (!eventCheck) {
            txtUrlHelpText.innerText = chrome.i18n.getMessage('appAlertWrongUrl');
            txtUrlHelpText.style.backgroundColor = "#fff3c6";
            buttonUrlSave.disabled = true;
            Boolean(elm.value) && elm.focus();
        }
    } else {
        txtUrlHelpText.innerText = '';
        txtUrlHelpText.style.backgroundColor = null;
        buttonUrlSave.disabled = false;
    }
    return buttonUrlSave.disabled;
}
inputUrl.addEventListener('blur', function(e) {
    this.value = autofixUrl(this.value);
    return validateEnteredUrl(this);
});
inputUrl.addEventListener('keyup', function(e) {
    return validateEnteredUrl(this, 'keyup');
});
// Try to auto fix url
function autofixUrl(str) {
    const splitted = str.split('//');
    if (splitted.length != 2) {
        str = 'https://' + str;
    }
    return str;
}
inputUrl.addEventListener('keypress', function(e) {
    // Block invalid characters
    if (validUrlCharacters.indexOf(String.fromCharCode(e.which)) < 0)
        e.preventDefault();
});

formUrl.addEventListener("submit", function(e){
    e.preventDefault();
    var newUrl = inputUrl.value;
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
            chrome.runtime.sendMessage({'open': 'window'},function(){
                chrome.runtime.sendMessage({'close': 'options'});
            });
        }
    });
});

// Allow opt-out
function initSettings(config) {
    // Release loading text
    document.getElementById('improve-by-tracking-opt-in').hidden = false;

    var checkboxImproveByTracking = document.getElementById('improve-by-tracking');
    var txtTrackingHelpText = document.getElementById('tracking-help-text');
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
                txtTrackingHelpText.innerText = chrome.i18n.getMessage('appMiscYouAreAmazing');
                txtTrackingHelpText.style.backgroundColor = "#d6ff97";
                break;
            default:
                SetTracking = analytics.EventBuilder.builder()
                    .category('App')
                    .action('Switch Tracking')
                    .dimension(2, 'off');
                console.warn('%c' + chrome.i18n.getMessage('appMiscConsiderTracking'), 'font-size:20px;background-color:#fff3c6');
                txtTrackingHelpText.innerText = chrome.i18n.getMessage('appMiscConsiderTracking');
                txtTrackingHelpText.style.backgroundColor = "#fff3c6";
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
