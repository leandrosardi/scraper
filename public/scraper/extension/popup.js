/*
References about Chrome Extensions:
- https://usefulangle.com/post/339/chrome-extension-create-page-scraper
- https://stackoverflow.com/questions/19758028/chrome-extension-get-dom-content
- https://developer.chrome.com/docs/extensions/reference/index.html
Refernces about Upload files with AJAX:
- https://pqina.nl/blog/set-value-to-file-input/
*/

'use strict';

const csdomain = 'http://connectionsphere.com:3000';
//const csdomain = 'http://127.0.0.1:3000';

let email = document.getElementById('email');
let password = document.getElementById('password');
let id_login = document.getElementById('id_login');
let id_page = document.getElementById('id_page');
let page_url = document.getElementById('page_url');
let text = document.getElementById('text');

// steps: how many times to scroll down
// steps_length: how many pixels each step
// delay_between_steps: how many milliseconds to wait between each step
async function upload_page(steps=10, step_length=1000, delay_between_steps=1000) {
    // scroll down to load AJAX content
    var i = 0;
    while (i < steps) {
        window.scrollTo(0, step_length*i);
        i++;
        await new Promise(r => setTimeout(r, delay_between_steps));
    };
    // return page content
    return document.body.innerHTML;
};

// Upload the page to CS.
function scrape_page() {
page_url.value = 'https://github.com';
    text.innerHTML = 'Going to page...';
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        // get the tab id
        var tab_id = tabs[0].id;
        // go to the page
        chrome.tabs.update({url: page_url.value});
        // fired when tab is updated
        chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
            // tab has finished loading
            if(tab_id == tabID && changeInfo.status === 'complete') {
                text.innerHTML = 'Scrolling...';
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
                        for (const frameResult of injectionResults) {
                            let page_content = frameResult.result;

                            // cap to 5MB max because the CORS policy
                            //let maxsize = 1*1024*1024;
                            //if (page_content.length > maxsize) {
                            //    page_content = page_content.substring(0, maxsize);
                            //}

                            /*
                            text.innerHTML = "Saving page...";
                            // save the HTML page in the download folder
                            let blob = new Blob([page_content], {type: "application/html;charset=utf-8"});
                            let objectURL = URL.createObjectURL(blob);
                            chrome.downloads.download({ url: objectURL, filename: ('linkedin-scraper/data.html'), conflictAction: 'overwrite' });
                            */
                           
                            text.innerHTML = "Uploading page...";
                            let fileInput = document.getElementById('file');
                            let fileForm = document.getElementById('upload_file');
                            let myFile = new File([page_content], 'hello.html', {
                                type: 'text/plain',
                                lastModified: new Date(),
                            });
                            let dataTransfer = new DataTransfer();
                            dataTransfer.items.add(myFile);
                            fileInput.files = dataTransfer.files;

                            let formData = new FormData(fileForm);
                            $.ajax({
                                method:"POST",
                                url: csdomain+"/api1.0/isn/upload.json",
                                data: formData,
                                cache: false,
                                contentType: false,
                                processData: false,
                                    beforeSend: function(){
                                        //$('button[type="submit"]').attr('disabled','disabled');
                                },
                                success: function(data){
                                    //$('button[type="submit"]').removeAttr('disabled');
                                    let response = JSON.parse(data);
                                    text.innerHTML = response.status;
                                },
                                error: function(data){
                                    //$('button[type="submit"]').removeAttr('disabled');
                                    let response = JSON.parse(data);
                                    text.innerHTML = response.status;
                                }
                            });
                                                    
                            // otherwise, wait for 5 seconds and ask again
//                            setTimeout(function() {
//                                get_page();
//                            }, 5000);
                        } // for (const frameResult of injectionResults)
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
    let apiCall = csdomain+'/api1.0/isn/get.json?version='+chrome.runtime.getManifest().version+'&id_login='+id_login.value
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