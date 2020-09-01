/* global chrome, analytics */
const window_title = document.getElementById('appTxtSettings'),
    alertEl = document.getElementById('alert'),
    formUrl = document.getElementById('request-url-form'),
    inputUrl = document.getElementById('input-request-url'),
    buttonUrlSave = document.getElementById('request-url-form').getElementsByTagName('button')[0],
    txtUrlHelpText = document.getElementById('url-help-text'),
    checkboxImproveByTracking = document.getElementById('improve-by-tracking'),
    txtTrackingHelpText = document.getElementById('tracking-help-text'),
    resizeOption = document.getElementById('resize-option'),
    stayOnTopOption = document.getElementById('stay-on-top-option'),
    disappearTimeoutOption = document.getElementById('titlebartimeout-option'),
    disappearTimeoutValue = document.getElementById('titlebartimeout-option-value'),
    localeObjects = document.querySelectorAll('.locale'),
    versionNumber = document.getElementById('version-number'),
    locale_appAlertSomethingWrong = chrome.i18n.getMessage('appAlertSomethingWrong'),
    validUrlCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&\'()*+,;=';

// Set locale texts
localeObjects.forEach(function(locale){ locale.innerText = chrome.i18n.getMessage(locale.id); });
// Exception for element who can't use .locale
document.title = chrome.i18n.getMessage('appLabelSettings');
window_title.innerText = chrome.i18n.getMessage('appLabelSettings');
if (inputUrl) inputUrl.placeholder = chrome.i18n.getMessage('appPlaceholderUrl');

// add version number
versionNumber.innerText = chrome.runtime.getManifest().version;

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
    return;
}

// Fill default data
chrome.storage.sync.get(function(items) {
    if (items.url !== undefined && items.url !== '')
        inputUrl.value = items.url;

    if (items.dontresize !== undefined)
        resizeOption.checked = !items.dontresize;
    else
        resizeOption.checked = true;

    if (items.stayontop !== undefined)
        stayOnTopOption.checked = items.stayontop;
    else
        stayOnTopOption.checked = true;

    if (items.titlebartimeout !== undefined){
        disappearTimeoutOption.value = items.titlebartimeout;
        disappearTimeoutValue.innerText = disappearTimeoutOption.value;
    } else {
        disappearTimeoutOption.value = 1500;
        disappearTimeoutValue.innerText = disappearTimeoutOption.value;
    }
});

// redirect focus
inputUrl.addEventListener('focus', function(e) {
    this.select();
});

// Validate URL
function validURL(str) {
    // Validating scheme:[//[user:password@]host[:port]]path[?query][#fragment]
    const pattern = new RegExp(
        '^'+ // start
            '(https?:\\/\\/)?'+ // scheme
            '(\\w+:\\w+@)?'+ // user:password
            '('+
                '(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                '([\\d\\w-_~][^.]+)|'+ // OR custom hosts domain
                '((\\d{1,3}\\.){3}\\d{1,3})'+ // OR ip (v4) address
            ')'+
            '(\\:\\d+)?'+ // port
            '(\\/[-a-z\\d%_.~+]*)*'+ // path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?'+ // fragment locator
        '$' // end
    ,'is');
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
    if (e.key != "Enter" && validUrlCharacters.indexOf(String.fromCharCode(e.which)) < 0)
        e.preventDefault();
});

formUrl.addEventListener("submit", function(e){
    e.preventDefault();
    var newUrl = inputUrl.value;
    window.tracker.sendEvent('Browser', 'Set URL', newUrl);
    chrome.storage.sync.set({ url: newUrl });
    chrome.storage.sync.get(function(items) {
        if (items.url === undefined || items.url === '') {
            var AlertSomethingWrong = analytics.EventBuilder.builder()
                .category('Errors')
                .action('Alert')
                .dimension(1, 'Something went wrong');
            window.tracker.send(AlertSomethingWrong);
            alert(locale_appAlertSomethingWrong);
        }
        else {
            chrome.runtime.sendMessage({'open': 'window'});
            chrome.runtime.sendMessage({'close': 'options'});
        }
    });
});

resizeOption.onchange = function() {
    let resizeOptionSet, option;
    if(resizeOption.checked) {
        resizeOptionSet = analytics.EventBuilder.builder()
            .category('App')
            .action('Switch resize webview')
            .dimension(1, 'on');
        option = false;
    } else {
        resizeOptionSet = analytics.EventBuilder.builder()
            .category('App')
            .action('Switch resize webview')
            .dimension(2, 'off');
        option = true;
    }
    window.tracker.send(resizeOptionSet);
    chrome.storage.sync.set({ dontresize: option });
    chrome.runtime.sendMessage({'dontresize': option});
};

stayOnTopOption.onchange = function() {
    let stayOnTopOptionSet, option;
    if(stayOnTopOption.checked) {
        stayOnTopOptionSet = analytics.EventBuilder.builder()
            .category('App')
            .action('Switch stay on top')
            .dimension(1, 'on');
        option = true;
    } else {
        stayOnTopOptionSet = analytics.EventBuilder.builder()
            .category('App')
            .action('Switch stay on top')
            .dimension(2, 'off');
        option = false;
    }
    window.tracker.send(stayOnTopOptionSet);
    chrome.storage.sync.set({ stayontop: option });
};

disappearTimeoutOption.oninput = function() {
    disappearTimeoutValue.innerText = this.value;
};
disappearTimeoutOption.onchange = function() {
    chrome.storage.sync.set({ titlebartimeout: this.value });
    chrome.runtime.sendMessage({'titlebartimeout': this.value});
    disappearTimeoutValue.innerText = this.value;
    const trackOptionSet = analytics.EventBuilder.builder()
        .category('App')
        .action('Set titlebar timeout')
        .dimension(1, disappearTimeoutValue.innerText);
    window.tracker.send(trackOptionSet);
};

// Allow opt-out
function initTrackingSettings(config) {
    // Release loading text
    document.getElementById('improve-by-tracking-opt-in').hidden = false;

    checkboxImproveByTracking.checked = config.isTrackingPermitted();
    checkboxImproveByTracking.onchange = function() {
        let trackOptionSet;
        if (checkboxImproveByTracking.checked) {
            trackOptionSet = analytics.EventBuilder.builder()
                .category('App')
                .action('Switch Tracking')
                .dimension(1, 'on');
            console.info('%c' + chrome.i18n.getMessage('appMiscYouAreAmazing'), 'font-size:20px;background-color:#d6ff97');
            txtTrackingHelpText.innerText = chrome.i18n.getMessage('appMiscYouAreAmazing');
            txtTrackingHelpText.style.backgroundColor = "#d6ff97";
        } else {
            trackOptionSet = analytics.EventBuilder.builder()
                .category('App')
                .action('Switch Tracking')
                .dimension(2, 'off');
            console.info('%c' + chrome.i18n.getMessage('appMiscConsiderTracking'), 'font-size:20px;background-color:#fff3c6');
            txtTrackingHelpText.innerText = chrome.i18n.getMessage('appMiscConsiderTracking');
            txtTrackingHelpText.style.backgroundColor = "#fff3c6";
        }
        window.tracker.send(trackOptionSet);
        config.setTrackingPermitted(checkboxImproveByTracking.checked);
    };
}

// Learn and improve from app usage
window.addEventListener('load', function() {
    // Initialize the Analytics service object with the name of your app.
    const service = analytics.getService('cornips_fbw');
    service.getConfig().addCallback(initTrackingSettings);

    // Get a Tracker using your Google Analytics app Tracking ID.
    window.tracker = service.getTracker('UA-84858849-3');

    // Record an "appView" each time the user launches the app
    window.tracker.sendAppView('OptionsView');

    // Track locale
    var locale = chrome.i18n.getUILanguage();
    var InitLanguage;
    switch(locale) {
        case 'pl':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('OptionsView')
                .dimension(4, 'Polish');
            break;
        case 'de':
            InitLanguage = analytics.EventBuilder.builder()
                .category('Language')
                .action('OptionsView')
                .dimension(3, 'German');
            break;
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
    window.tracker.send(InitLanguage);

});
