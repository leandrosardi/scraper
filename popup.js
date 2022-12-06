'use strict';

const csdomain = 'https://127.0.0.1';

let email = document.getElementById('email');
let password = document.getElementById('password');

let id_login = document.getElementById('id_login');
let id_page = document.getElementById('id_page');
let page_url = document.getElementById('page_url');

let text = document.getElementById('text');


function upload_page(csdomain, id_page) {
    // get the page content
    let page_content = document.documentElement.innerHTML;
    // define the api URL
    let apiCall = csdomain+'/api1.0/isn/upload.json?id_page='+id_page+'&page_content='+encodeURIComponent(page_content);
    fetch(apiCall).then(function(res) {
        // wait for resonse
        if (res.status !== 200) {
            text.innerHTML = 'Protocol Error';
        }
        res.json().then(function(data) {
            // show the response
alert(data.status);
            if (data.status === 'success') {
                text.innerHTML = data.status;
            } else {
                text.innerHTML = data.status;
            }
        });
    }).catch(function(err) {
        // error
        //
        // If you are working on DEV, probably you are getting this error because your SSL cerificate is not tusted.
        // In this case, go to https://
    });
}

// Upload the page to CS.
function scrape_page() {
    text.innerHTML = 'Scraping page...';

    // go to the page
    chrome.tabs.update({url: page_url.value});
    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
        // tab has finished loading
        if(changeInfo.status === 'complete') {
            // remove listener
            chrome.tabs.onUpdated.removeListener(openPage);
			// execute content script
            chrome.scripting.executeScript(
                {
                    target: {tabId: tabID, allFrames: true},
                    //code: 'e="123";',
                    args: [ csdomain, id_page.value ],
                    func: upload_page
                }, 
                // Get the value returned by do_login.
                // Reference: https://developer.chrome.com/docs/extensions/reference/scripting/#handling-results
                (injectionResults) => {
                    for (const frameResult of injectionResults)
                        text.innerHTML = 'Page scraped!';
                }
            );
        }
    });
}

// Ask CS for a page to scrape.
function get_page() {
    // show loading status
    text.innerHTML = 'Getting page to scrape...';
    // define the api URL
    let apiCall = csdomain+'/api1.0/isn/get.json?id_login='+id_login.value
    fetch(apiCall).then(function(res) {
        // wait for resonse
        if (res.status !== 200) {
            text.innerHTML = 'Protocol Error';
        }
        res.json().then(function(data) {
            // show the response
            if (data.status === 'success') {
                text.innerHTML = data.status;
                id_page.value = data.id_page;
                page_url.value = data.url;
                scrape_page();
            } else {
                text.innerHTML = data.status;
                // otherwise, wait for 5 seconds and ask again
                setTimeout(function() {
                    get_page();
                }, 5000);
            }
        });
    }).catch(function(err) {
        // error
        //
        // If you are working on DEV, probably you are getting this error because your SSL cerificate is not tusted.
        // In this case, go to https://127.0.0.1/ on other tab of the same browser, and choose to trust the certificate.
        // After that, you can go back to this tab and try again.
        // 
        text.innerHTML = 'Error:'+err;
    });
};

// Login to CS
function do_login() { 
    // show logging in caption
    text.innerHTML = 'Logging in...';
    // define the api URL
    let apiCall = csdomain+'/api1.0/isn/login.json?email='+email.value+'&password='+password.value;
    fetch(apiCall).then(function(res) {
        // wait for resonse
        if (res.status !== 200) {
            text.innerHTML = 'Protocol Error';
        }
        res.json().then(function(data) {
            // show the response
            if (data.status === 'success') {
                text.innerHTML = data.status;
                id_login.value = data.id_login;
                get_page();
            } else {
                text.innerHTML = data.status;
            }
        });
    }).catch(function(err) {
        // error
        //
        // If you are working on DEV, probably you are getting this error because your SSL cerificate is not tusted.
        // In this case, go to https://127.0.0.1/ on other tab of the same browser, and choose to trust the certificate.
        // After that, you can go back to this tab and try again.
        // 
        text.innerHTML = 'Error:'+err;
    });

}

login.onclick = function() {
    do_login();
};