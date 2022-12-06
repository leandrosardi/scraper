'use strict';

const csdomain = 'https://127.0.0.1';

let email = document.getElementById('email');
let password = document.getElementById('password');

function do_login(csdomain, email, password) {
    function get_page(csdomain) {
        alert('get_page');
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
                    text.innerHTML = 'Res:'+data.status;
                    id_page.value = data.id_page;
                    url.value = data.url;
                } else {
                    text.innerHTML = 'Res:'+data.status;
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
    // show loading status
    text.innerHTML = 'Loading...';
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
                text.innerHTML = 'Res:'+data.status;
                id_login.value = data.id_login;
                get_page(csdomain);
            } else {
                text.innerHTML = 'Res:'+data.status;
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