/*
References: 
- https://usefulangle.com/post/339/chrome-extension-create-page-scraper
- https://stackoverflow.com/questions/19758028/chrome-extension-get-dom-content
- https://developer.chrome.com/docs/extensions/reference/index.html
*/

'use strict';

const csdomain = 'https://127.0.0.1';

let email = document.getElementById('email');
let password = document.getElementById('password');
let id_login = document.getElementById('id_login');
let id_page = document.getElementById('id_page');
let page_url = document.getElementById('page_url');

let text = document.getElementById('text');


// reference: https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
/*
const delay = ms => new Promise(res => setTimeout(res, ms));

// 
const upload_page = async () => {
    // scroll to the bottom
    window.scrollTo(0, 100);
    await delay(5000);
    window.scrollTo(0, 100);
    await delay(5000);
    window.scrollTo(0, 100);
    await delay(5000);
    window.scrollTo(0, 100);
    await delay(5000);
    return document.title;
};
*/

// steps: how many times to scroll down
// steps_length: how many pixels each step
// delay_between_steps: how many milliseconds to wait between each step
async function scroll(steps=100, step_length=100, delay_between_steps=1000) {
    var i = 0;
    while (i < steps) {
        window.scrollTo(0, step_length*i);
        i++;
        await new Promise(r => setTimeout(r, delay_between_steps));
    }
}

async function upload_page(steps=100, step_length=100, delay_between_steps=1000) {
    var i = 0;
    while (i < steps) {
        window.scrollTo(0, step_length*i);
        i++;
        await new Promise(r => setTimeout(r, delay_between_steps));
    };
    return document.title;
};

login.onclick = function() {
    var page_url_value = 'https://github.com';
    text.innerHTML = 'Scraping page...';                   
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        // get the tab id
        var tab_id = tabs[0].id;
        // go to the page
        chrome.tabs.update({url: page_url_value});
        // fired when tab is updated
        chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
            // tab has finished loading
            if(tab_id == tabID && changeInfo.status === 'complete') {
                // remove tab onUpdate event as it may get duplicated
                chrome.tabs.onUpdated.removeListener(openPage);
                  
                // execute content script
                chrome.scripting.executeScript(
                    {
                        target: {tabId: tab_id, allFrames: true},
                        //args: [ csdomain, id_page.value ],
                        func: upload_page
                    }, 
                    // Get the value returned by do_login.
                    // Reference: https://developer.chrome.com/docs/extensions/reference/scripting/#handling-results
                    (injectionResults) => {
                        for (const frameResult of injectionResults)
                            text.innerHTML = frameResult.result;
                            // otherwise, wait for 5 seconds and ask again
//                            setTimeout(function() {
//                                get_page();
//                            }, 5000);
                    }
                );
            }
        });    
    });
};


/*
// Upload the page to CS.
function scrape_page() {
page_url.value = 'https://github.com';
    text.innerHTML = 'Scraping page...';
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        // get the tab id
        var tab_id = tabs[0].id;
        // go to the page
        chrome.tabs.update({url: page_url.value});
        // fired when tab is updated
        chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
            // tab has finished loading
            if(tab_id == tabID && changeInfo.status === 'complete') {
                // remove tab onUpdate event as it may get duplicated
                chrome.tabs.onUpdated.removeListener(openPage);

                // listen for messages from content script
                chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
                    if (msg.action == 'open_dialog_box') {
                      alert("Message recieved!");
                    }
                });
                  
                // execute content script
                chrome.scripting.executeScript(
                    {
                        target: {tabId: tab_id, allFrames: true},
                        //args: [ csdomain, id_page.value ],
                        func: upload_page
                    }, 
                    // Get the value returned by do_login.
                    // Reference: https://developer.chrome.com/docs/extensions/reference/scripting/#handling-results
                    (injectionResults) => {
                        for (const frameResult of injectionResults)
                            text.innerHTML = frameResult.result;
                            // otherwise, wait for 5 seconds and ask again
//                            setTimeout(function() {
//                                get_page();
//                            }, 5000);
                    }
                );
            }
        });    
    });
}

// Ask CS for a page to scrape.
function get_page() {
    // show loading status
    text.innerHTML = 'Getting page to scrape...' //+ chrome.tabs.length.toString();
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
    text.innerHTML = 'Logging in.....';
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
*/