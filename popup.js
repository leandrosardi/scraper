'use strict';

postsSearchStart.onclick = function() {
    alert('Hola');
    chrome.tabs.update({url: 'https://linkedin.com'});

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
        // tab has finished loading
        if(changeInfo.status === 'complete') {
            // remove listener
            chrome.tabs.onUpdated.removeListener(openPage);
            // get document title
            chrome.tabs.get(tabID, function(tab) {
                alert(tab.title);
                // get document h1 with class 'main-heading
                chrome.tabs.executeScript(tabID, {
                    code: 'document.querySelector("h1.main-heading").innerText'
                }, function(result) {
                    alert(result);
                });
            });
        }
    });
};