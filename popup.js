'use strict';

const csdomain = 'https://127.0.0.1';

let email = document.getElementById('email');
let password = document.getElementById('password');

// Login to connection sphere and start asking for pages to scrape.
function do_login(csdomain, email, password) {

    // Add extension DOM to the current page.
    function inject_dom() {
alert('a');
        if (document.readyState === "complete" || document.readyState === "interactive") {
alert('b');
            // remove any existing div#status
            let status = document.getElementById('status');
            if (status) status.remove();
            // inject the status top div
            let div = document.createElement('div');
            div.id = 'status';
            div.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 50px; background-color: rgba(255, 255, 255, 0.5); color: black; z-index: 9999;';
            // add paragraph
            let text = document.createElement('p');
            text.id = 'text';
            text.innerText = '';
            div.appendChild(text);
            // add input#id_login
            let id_login = document.createElement('input');
            id_login.id = 'id_login';
            //id_login.type = 'text';
            id_login.value = '';
            div.appendChild(id_login);
            // add input#id_page
            let id_page = document.createElement('input');
            id_page.id = 'id_page';
            //id_page.type = 'text';
            id_page.value = '';
            div.appendChild(id_page);
            // add input#url
            let url = document.createElement('input');
            url.id = 'url';
            //url.type = 'text';
            url.value = '';
            div.appendChild(url);
            // add status top div into the page
            document.body.appendChild(div);
        } else {
alert('c');
            document.addEventListener("DOMContentLoaded", inject_dom);
        }
    }

    // Upload the page to CS.
    function scrape_page(csdomain) {
        id_login = document.getElementById('id_login');
        id_page = document.getElementById('id_page');
        url = document.getElementById('url');
        text = document.getElementById('text');
        // remember the values of each element
        let id_login_value = id_login.value;
        let id_page_value = id_page.value;
        let url_value = url.value;
        // Go to the page
        window.location.href = url.value;
        // wait for page to load
        window.onload = function() { 
            alert('done!');
        }
        // Add extensions DOM to the page
        inject_dom();

        // Get extension elements
        id_login = document.getElementById('id_login');
        id_page = document.getElementById('id_page');
        url = document.getElementById('url');
        text = document.getElementById('text');
        // Initialize extension elements
        id_login.value = id_login_value;
        id_page.value = id_page_value;
        url.value = url_value;
    }

    // Ask CS for a page to scrape.
    function get_page(csdomain) {
        id_login = document.getElementById('id_login');
        id_page = document.getElementById('id_page');
        url = document.getElementById('url');
        text = document.getElementById('text');
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
                    url.value = data.url;
                    scrape_page(csdomain);
                } else {
                    text.innerHTML = data.status;
                    // otherwise, wait for 5 seconds and ask again
                    setTimeout(function() {
                        get_page(csdomain);
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
    
    // add extension DOM to the current page
    inject_dom();
    
    // get extension DOM elements
    id_login = document.getElementById('id_login');
    id_page = document.getElementById('id_page');
    url = document.getElementById('url');
    text = document.getElementById('text');

    // show loading status
    text.innerHTML = 'Logging in...';

    // define the api URL
    let apiCall = csdomain+'/api1.0/isn/login.json?email='+email+'&password='+password;
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
                get_page(csdomain);
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
    // go to the page
    chrome.tabs.update({url: 'https://www.linkedin.com'});
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
                    args: [ csdomain, email.value, password.value ],
                    func: do_login
                }, 
                // Get the value returned by do_login.
                // Reference: https://developer.chrome.com/docs/extensions/reference/scripting/#handling-results
                (injectionResults) => {
                    for (const frameResult of injectionResults)
                        id_login.value = frameResult.result;
                }
            );
        }
    });
};