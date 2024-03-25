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