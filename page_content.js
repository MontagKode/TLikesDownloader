chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		if (msg.text === 'download_images_and_videos') {
			sendResponse({imagesAndVideos: getImagesAndVideosOnThisPage()});
		}
	});

function getImagesAndVideosOnThisPage() {
	var imagesAndVideosToReturn = [];
	var i;
	var j;
	
	var previousRawName = "";
	var previousEqualNameCount = parseInt(0);
	var images = document.getElementsByTagName('img');
	for (i = 0; i < images.length; ++i) {
		images[i].parentElement.innerHTML = images[i].parentElement.innerHTML.replace(/data-pin-url/g, 'name');
		var rawName = images[i].name;
		if (rawName) {
			if (rawName === previousRawName) {
				++previousEqualNameCount;
			} else {
				previousEqualNameCount = parseInt(0);
			}
			previousRawName = rawName;
		
			var numberToShow = "";
			if (previousEqualNameCount > 0) {
				numberToShow = "_(" + previousEqualNameCount + ")";
			}
			var extension = images[i].src.substring(images[i].src.lastIndexOf("."));
			imagesAndVideosToReturn.push([images[i].src.replace(/_...\./, "_1280."), 
					rawName.replace(/[^a-zA-Z0-9]/g,'_').replace(/http___/, "") + numberToShow + extension]);
				
			//alert("image " + (i + 1) + " of " + images.length + ": " + images[i].name);
		}
	}
	
	var videos = document.getElementsByClassName('crt-video crt-skin-default');
	for (i = 0; i < videos.length; ++i) {

		var postLink = videos[i].parentElement.parentElement.parentElement.parentElement.parentElement
		.getElementsByClassName('post_permalink')[0]
		.getAttribute("href");

		var extension = ".mp4";

		var videoLinks = videos[i].getElementsByTagName("source");
		for (j = 0; j < videoLinks.length; ++j) {
			var videoLink = videoLinks[j].getAttribute("src");
			
			imagesAndVideosToReturn.push([videoLink, 
			postLink.replace(/[^a-zA-Z0-9]/g,'_').replace(/http___/, "") + extension]);
			
			//alert("postLink = " + postLink + ", videoLink = " + videoLink);
		}		
	}
	
	//alert("images and videos on page: " + imagesToReturn.length);
	
	return imagesAndVideosToReturn;
}

