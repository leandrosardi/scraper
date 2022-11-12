'use strict';

function changeBodyForTesting() {
    alert('changeBodyForTesting');
    document.body.innerHTML = 'Hello!';
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