'use strict';

function changeBodyForTesting() {
    alert('changeBodyForTesting');
    document.body.innerHTML = '...';
    // do an ajax call to https://connectionsphere.com/api1.0/emails/verify.json?email=leandro.sardi@expandedventure.com, and get the response
    // if response is 200, then change the body to 'Verified'
    // if response is 400, then change the body to 'Not Verified'
    /*
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        document.body.innerHTML = 'Hello!';
    }
    xhttp.open("GET", "https://connectionsphere.com/api1.0/emails/verify.json", true);
    xhttp.send();
    */
    let apiCall = 'https://connectionsphere.com/api1.0/emails/verify.json?email=leandro.sardi@expandedventure.com';
    fetch(apiCall).then(function(res) {
        // wait for resonse
        if (res.status !== 200) {
            document.body.innerHTML = 'Error!';
            return;
        }
        res.json().then(function(data) {
            // show the response
            document.body.innerHTML = data;
        });
    }).catch(function(err) {
        // error
        document.body.innerHTML = err;
    });
}

postsSearchStart.onclick = function() {
    alert('Button Click');
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
                    func: changeBodyForTesting
                }, function() {
                    alert('Script executed!');
			    }
            );
        }
    });
};