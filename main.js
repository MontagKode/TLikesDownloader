(function (ls) {
  'use strict';
  
	var imagesLoadingDelay = 4000;
	var nextPageLoadingDelay = 4000;
  
	var urlBase = "";
  
	var page;
	var currentPageUrl;
	var downloadingItems;
	
	var errorLog = "Downloading is finished.\n";
  
	chrome.browserAction.onClicked.addListener(function(tab) { 
		openFirstPage();
	});
	
	function openFirstPage() {
		
		chrome.windows.getCurrent(function (currentWindow) {
			chrome.tabs.query({ active: true, windowId: currentWindow.id, lastFocusedWindow: true }, function (activeTabs) {
				urlBase = activeTabs[0].url;
				page = parseInt(0);
				
				// setting correct base Url and page
				if (urlBase.indexOf("/page/") > 0) {
					page = parseInt(urlBase.substring(urlBase.indexOf("/page/") + 6)) - 1;
					urlBase = urlBase.substring(0, urlBase.indexOf("/page/"));
				}
				
				currentPageUrl = "";
				downloadingItems = [];
				openNextPage();
			});
		});
		
		
	}
	
	function openNextPage() {
		page = page + 1;
		chrome.windows.getCurrent(function (currentWindow) {
			  chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
					chrome.tabs.update({
						url: urlBase + "/page/" + page
					});
			  });
		});
	}
	
	chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
		var name = item.filename;
		var i;
		for (i = 0; i < downloadingItems.length; ++i) {
			if (item.url === downloadingItems[i][0]) {
				name = downloadingItems[i][1];
			}
		}
		suggest({ conflictAction: "overwrite", filename: "tumblr_likes/" + name});
    });
	
	
	chrome.tabs.onUpdated.addListener(function(tab) { 
		chrome.windows.getCurrent(function (currentWindow) {
			chrome.tabs.query({ active: true, windowId: currentWindow.id, lastFocusedWindow: true }, function (activeTabs) {
				setTimeout(function(imagesLoading) {
					getAndDownloadImagesAndVideosOnPage(activeTabs[0].url);
				}, (imagesLoadingDelay));
			});
		});
    });
	
	function getAndDownloadImagesAndVideosOnPage(pageUrl) {
		if (pageUrl === currentPageUrl) {
			return;
		}
		currentPageUrl = pageUrl;
		
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {text: 'download_images_and_videos'}, function(response) {
				chrome.downloads.erase({state: "complete"});
				
				chrome.downloads.search({state: "interrupted"}, function(items) {
					var j;
					for (j = 0; j < items.length; ++j) {
						errorLog += "Not loaded: " + items[j].url + " (now on page " + page + ")\n";
					}
					chrome.downloads.erase({state: "interrupted"});
				});
				
				if (response && response.imagesAndVideos && response.imagesAndVideos.length > 0) {
					var i;
					for (i = 0; i < response.imagesAndVideos.length; ++i) {
						downloadingItems.push([response.imagesAndVideos[i][0], response.imagesAndVideos[i][1]]); 
						// for remembering names
						chrome.downloads.download({ url: response.imagesAndVideos[i][0] });
					}
				
					setTimeout(function(nextPageLoading) {
						openNextPage();
					}, (nextPageLoadingDelay));
				} else {
					console.log(errorLog);
					alert(errorLog);
				}
			});
		});
	}
	
}(localStorage));
