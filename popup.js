//'use strict';

let email = document.getElementById('email');
let password = document.getElementById('password');

function do_login(email,password) {
    let apiCall = 'https://127.0.0.1/api1.0/emails/verify.json?email=leandro.sardi@expandedventure.com';
    fetch(apiCall).then(function(res) {
        // wait for resonse
        if (res.status !== 200) {
            document.body.innerHTML = 'Protocol Error';
            return;
        }
        res.json().then(function(data) {
            // show the response
            document.body.innerHTML = 'Res:'+data.status;
        });
    }).catch(function(err) {
        // error
        //
        // If you are working on DEV, probably you are getting this error because your SSL cerificate is not tusted.
        // In this case, go to https://127.0.0.1/ on other tab of the same browser, and choose to trust the certificate.
        // After that, you can go back to this tab and try again.
        // 
        document.body.innerHTML = 'Error:'+err;
    });
}

login.onclick = function() {
document.body.innerHTML = email.value;
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
                    args: [ email.value, password.value ],
                    func: do_login
                }, function() {
                    alert('Script executed!');
			    }
            );
        }
    });
};