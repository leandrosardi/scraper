'use strict';

const url = 'https://127.0.0.1';

let email = document.getElementById('email');
let password = document.getElementById('password');

function do_login(url, email, password) {
    // remove any existing div#status
    let status = document.getElementById('status');
    if (status) status.remove();
    // inject the status top div
    let div = document.createElement('div');
    div.id = 'status';
    div.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 50px; background-color: rgba(255, 255, 255, 0.5); color: black; z-index: 9999;';
    document.body.appendChild(div);
    // show loading status
    div.innerHTML = 'Loading...';
    // define the api URL
    let apiCall = url+'/api1.0/isn/login.json?email='+email+'&password='+password;
    //let ret = '';
    //let p = new Promise(function() {
        fetch(apiCall).then(function(res) {
            // wait for resonse
            if (res.status !== 200) {
                div.innerHTML = 'Protocol Error';
            }
            res.json().then(function(data) {
                // show the response
                if (data.status === 'success') {
                    div.innerHTML = 'Res:'+data.id_login;
                } else {
                    div.innerHTML = 'Res:'+data.status;
                }
            });
        }).catch(function(err) {
            // error
            //
            // If you are working on DEV, probably you are getting this error because your SSL cerificate is not tusted.
            // In this case, go to https://127.0.0.1/ on other tab of the same browser, and choose to trust the certificate.
            // After that, you can go back to this tab and try again.
            // 
            div.innerHTML = 'Error:'+err;
        });
    //});
    //p.then(function() {return ret});
    //return ret;
}

login.onclick = function() {
    // go to the page
    chrome.tabs.update({url: 'https://www.amazon.com'});
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
                    args: [ url, email.value, password.value ],
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