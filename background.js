chrome.storage.onChanged.addListener(function(changes, areaName){
    chrome.storage.local.get('iconStatus', function(status){
        let iconStatus = status.iconStatus;

        if(iconStatus) {
            document.getElementById('iconBtn').checked = true;
        } else {
            document.getElementById('iconBtn').checked = false;
        }
    });
});

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab)
    {
        if(changeInfo.url)
        {
            chrome.tabs.sendMessage(tabId, {
                message: 'reload',
            })
        }
    }
);