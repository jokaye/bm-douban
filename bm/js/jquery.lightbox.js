/**
 * jQuery Lightbox
 * Version 0.5 - 11/29/2007
 * @author Warren Krewenki
 *
 * This package is distributed under the BSD license.
 * For full license information, see LICENSE.TXT
 *
 * Based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * Originally written to make use of the Prototype framework, and Script.acalo.us, now altered to use jQuery.
 *
 * This file was lightly modified by Ulf Benjaminsson (http://www.ulfben.com) for use in the WP jQuery Lightbox-
 * plugin. Modifications include:
 *	0. using no-conflict mode (for good measure)
 *	1. improved the resizing code
 *	2. using rel attribute instead of class
 *	3. auto-lightboxing all links after page load
 *	4. using WordPress API to localize script (with safe fallbacks)
 *	5. replaced explicit IMG-urls with divs, styled through the CSS.
 *
 **/
(function(jQuery){
	jQuery.fn.lightbox = function(options){
		// build main options
		var opts = jQuery.extend({}, jQuery.fn.lightbox.defaults, options);
        
		return this.each(function(){
			jQuery(this).click(function(){
    		    // initalize the lightbox
    		    initialize();
				start(this);
				return false;
			});
		});
		
	    /**
	     * initalize()
	     *
	     * @return void
	     * @author Warren Krewenki
	     */
	     
	    function initialize() {
		    jQuery('#overlay').remove();
		    jQuery('#lightbox').remove();
		    opts.inprogress = false;
		    
		    // if jsonData, build the imageArray from data provided in JSON format
            if(opts.jsonData && opts.jsonData.length > 0) {
                var parser = opts.jsonDataParser ? opts.jsonDataParser : jQuery.fn.lightbox.parseJsonData;                
                opts.imageArray = [];
                opts.imageArray = parser(opts.jsonData);
	        }
		    
		    var outerImage = '<div id="outerImageContainer"><div id="imageContainer"><iframe id="lightboxIframe" /><img id="lightboxImage"><div id="hoverNav"><a href="javascript://" title="' + opts.strings.prevLinkTitle + '" id="prevLink"></a><a href="javascript://" id="nextLink" title="' + opts.strings.nextLinkTitle + '"></a></div><div id="loading"><a href="javascript://" id="loadingLink"><div id="jqlb_loading"></div></a></div></div></div>';
		    var imageData = '<div id="imageDataContainer" class="clearfix"><div id="imageData"><div id="imageDetails"><span id="caption"></span></div></div></div>';

		    if (opts.displayHelp)
			    var helpDisplay = '<div id="helpDisplay">' + opts.strings.help + '</div>';

		    var toolbar = '<div id="toolbar"><div id="numberDisplay"></div><a href="javascript://" id="bottomNavClose" title="' + opts.strings.closeTitle + '"><div id="jqlb_closelabel">' + opts.strings.closeTitle + '</div></a><a href="javascript://" id="showBig" title="' + opts.strings.bigTitle + '"><div id="jqlb_showbig">' + opts.strings.bigTitle + '</div></a></div>';

		    var string;

		    if (opts.navbarOnTop) {
		      string = '<div id="overlay"></div><div id="lightbox">' + imageData + outerImage + '</div>';
		      jQuery("body").append(string);
		      jQuery("#imageDataContainer").addClass('ontop');
		    } else {
		      string = '<div id="overlay"></div><div id="lightbox">' + outerImage + imageData + helpDisplay + toolbar + '</div>';
		      jQuery("body").append(string);
		    }

		    jQuery("#overlay").click(function(){ end(); }).hide();
		    jQuery("#lightbox").click(function(){ end();}).hide();
		    jQuery("#loadingLink").click(function(){ end(); return false;});
		    jQuery("#showBig").click(function(){   doChangeImage(temp=true); return false; });
		    jQuery("#bottomNavClose").click(function(){ end(); return false; });
		    jQuery('#outerImageContainer').width(opts.widthCurrent).height(opts.heightCurrent);
		    jQuery('#imageDataContainer').width(opts.widthCurrent);
		
		    if (!opts.imageClickClose) {
        		jQuery("#lightboxImage").click(function(){ return false; });
        		jQuery("#hoverNav").click(function(){ return false; });
		    }
	    };
	    
	    function getPageSize() {
		    var jqueryPageSize = new Array(jQuery(document).width(),jQuery(document).height(), jQuery(window).width(), jQuery(window).height());
		    return jqueryPageSize;
	    };
	    
	    function getPageScroll() {
		    var xScroll, yScroll;

		    if (self.pageYOffset) {
			    yScroll = self.pageYOffset;
			    xScroll = self.pageXOffset;
		    } else if (document.documentElement && document.documentElement.scrollTop){  // Explorer 6 Strict
			    yScroll = document.documentElement.scrollTop;
			    xScroll = document.documentElement.scrollLeft;
		    } else if (document.body) {// all other Explorers
			    yScroll = document.body.scrollTop;
			    xScroll = document.body.scrollLeft;
		    }

		    var arrayPageScroll = new Array(xScroll,yScroll);
		    return arrayPageScroll;
	    };
	    
	    function pause(ms) {
		    var date = new Date();
		    var curDate = null;
		    do{curDate = new Date();}
		    while(curDate - date < ms);
	    };
	    
	    function start(imageLink) {
		    jQuery("select, embed, object").hide();
		    var arrayPageSize = getPageSize();
		    jQuery("#overlay").hide().css({width: '100%', height: arrayPageSize[1]+'px', opacity : opts.overlayOpacity}).fadeIn(400);
		    imageNum = 0;

		    // if data is not provided by jsonData parameter
            if(!opts.jsonData) {
                opts.imageArray = [];
		        // if image is NOT part of a set..
		        if(!imageLink.rel || (imageLink.rel == '')){
			        // add single image to Lightbox.imageArray
			        opts.imageArray.push(new Array(imageLink.href, opts.displayTitle ? imageLink.title : ''));
		        } else {
		        // if image is part of a set..
			        jQuery("a").each(function(){
				        if(this.href && (this.rel == imageLink.rel)){
					        opts.imageArray.push(new Array(this.href, opts.displayTitle ? this.title : ''));
				        }
			        });
		        }
		    }

		    if(opts.imageArray.length > 1) {
		        for(i = 0; i < opts.imageArray.length; i++){
				    for(j = opts.imageArray.length-1; j>i; j--){
					    if(opts.imageArray[i][0] == opts.imageArray[j][0]){
						    opts.imageArray.splice(j,1);
					    }
				    }
			    }
			    while(opts.imageArray[imageNum][0] != imageLink.href) { imageNum++;}
		    }

		    // calculate top and left offset for the lightbox
		    var arrayPageScroll = getPageScroll();
		    var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);
		    var lightboxLeft = arrayPageScroll[0];
		    jQuery('#lightbox').css({top: lightboxTop+'px', left: lightboxLeft+'px'}).show();


		    if (!opts.slideNavBar)
			    jQuery('#imageData').hide();

		    changeImage(imageNum);
	    };
	    
	    function changeImage(imageNum) {
		    if(opts.inprogress == false){
			    opts.inprogress = true;
			    opts.activeImage = imageNum;	// update global var

			    // hide elements during transition
			    jQuery('#jqlb_loading').show();
			    jQuery('#lightboxImage').hide();
			    jQuery('#hoverNav').hide();
			    jQuery('#prevLink').hide();
			    jQuery('#nextLink').hide();

			    if (opts.slideNavBar) { // delay preloading image until navbar will slide up
				    // jQuery('#imageDataContainer').slideUp(opts.navBarSlideSpeed, jQuery.fn.doChangeImage);
				    jQuery('#imageDataContainer').hide();
				    jQuery('#imageData').hide();
				    doChangeImage();
			    } else {
			        doChangeImage();
			    }
		    }
	    };
	    
	    function doChangeImage(temp) {
		    if(temp == ''){
			    temp = false;
			}
		    imgPreloader = new Image();
		    // once image is preloaded, resize image container
		    imgPreloader.onload=function(){
		        var newWidth = imgPreloader.width;
		        var newHeight = imgPreloader.height;
			    if (opts.fitToScreen&&!temp) {
		            var arrayPageSize = getPageSize();				   
				    var maxWidth = arrayPageSize[2] - 2*opts.borderSize;//1 extra, to get some margins to the browser border.
				    var maxHeight = arrayPageSize[3] - 120;
					var ratio = 1;					
					if(newHeight > maxHeight){					
						ratio = maxHeight/newHeight; //ex. 600/1024 = 0.58					
					}				
					newWidth = newWidth*ratio;		
					newHeight = newHeight*ratio;
					ratio = 1;
					if(newWidth > maxWidth){					
						ratio = maxWidth/newWidth; //ex. 800/1280 == 0.62					
					}
					newWidth = newWidth*ratio;		
					newHeight = newHeight*ratio;									
			    }
			    jQuery('#lightboxImage').attr('src', opts.imageArray[opts.activeImage][0])
							       .width(newWidth).height(newHeight);
			    resizeImageContainer(newWidth, newHeight);
		    };

		    imgPreloader.src = opts.imageArray[opts.activeImage][0];
	    };
	    
	    function end() {
		    disableKeyboardNav();
		    jQuery('#lightbox').hide();
		    jQuery('#overlay').fadeOut(250);
		    jQuery('select, object, embed').show();
	    };
	    
	    function preloadNeighborImages(){
		    if(opts.loopImages && opts.imageArray.length > 1) {
	            preloadNextImage = new Image();
	            preloadNextImage.src = opts.imageArray[(opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1][0]
	            
	            preloadPrevImage = new Image();
	            preloadPrevImage.src = opts.imageArray[(opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1][0]
	        } else {
		        if((opts.imageArray.length - 1) > opts.activeImage){
			        preloadNextImage = new Image();
			        preloadNextImage.src = opts.imageArray[opts.activeImage + 1][0];
		        }
		        if(opts.activeImage > 0){
			        preloadPrevImage = new Image();
			        preloadPrevImage.src = opts.imageArray[opts.activeImage - 1][0];
		        }
	        }
	    };
	    
	    function resizeImageContainer(imgWidth, imgHeight) {
		    // get current width and height
		    opts.widthCurrent = jQuery("#outerImageContainer").outerWidth();
		    opts.heightCurrent = jQuery("#outerImageContainer").outerHeight();
            
		    // get new width and height
		    var widthNew = Math.max(350, imgWidth  + (opts.borderSize * 2));
		    var heightNew = (imgHeight  + (opts.borderSize * 2));

		    // scalars based on change from old to new
		    opts.xScale = ( widthNew / opts.widthCurrent) * 100;
		    opts.yScale = ( heightNew / opts.heightCurrent) * 100;

		    // calculate size difference between new and old image, and resize if necessary
		    wDiff = opts.widthCurrent - widthNew;
		    hDiff = opts.heightCurrent - heightNew;

		    jQuery('#imageDataContainer').animate({width: widthNew},opts.resizeSpeed,'linear');
		    jQuery('#outerImageContainer').animate({width: widthNew},opts.resizeSpeed,'linear',function(){
			    jQuery('#outerImageContainer').animate({height: heightNew},opts.resizeSpeed,'linear',function(){
				    showImage();
			    });
		    });

		    // if new and old image are same size and no scaling transition is necessary,
		    // do a quick pause to prevent image flicker.
		    if((hDiff == 0) && (wDiff == 0)){
			    if (jQuery.browser.msie){ pause(250); } else { pause(100);}
		    }

		    jQuery('#prevLink').height(imgHeight);
		    jQuery('#nextLink').height(imgHeight);
	    };
	    
	    function showImage() {			
		    jQuery('#jqlb_loading').hide();
		    jQuery('#lightboxImage').fadeIn(400);
		    updateDetails();
		    preloadNeighborImages();

		    opts.inprogress = false;
	    };
	    
	    function updateDetails() {
		    jQuery('#numberDisplay').html('');
		    if(opts.imageArray[opts.activeImage][1]){
			    jQuery('#caption').html(opts.imageArray[opts.activeImage][1]).show();
		    }
		    // if image is part of set display 'Image x of x'
		    if(opts.imageArray.length > 1){
			    var nav_html;

			    nav_html = (opts.activeImage + 1) + opts.strings.of + opts.imageArray.length;

			    if (!opts.disableNavbarLinks) {
                    // display previous / next text links
                    if ((opts.activeImage) > 0 || opts.loopImages) {
                      nav_html = '<a title="' + opts.strings.prevLinkTitle + '" href="#" id="prevLinkText">' + opts.strings.prevLinkText + "</a>" + nav_html;
                    }

                    if (((opts.activeImage + 1) < opts.imageArray.length) || opts.loopImages) {
                      nav_html += '<a title="' + opts.strings.nextLinkTitle + '" href="#" id="nextLinkText">' + opts.strings.nextLinkText + "</a>";
                    }
                }

			    jQuery('#numberDisplay').html(nav_html).show();
		    }

		    if (opts.slideNavBar) {
		        jQuery("#imageData").slideDown(opts.navBarSlideSpeed);
		    } else {
			    jQuery("#imageData").show();
		    }

		    var arrayPageSize = getPageSize();
		    jQuery('#overlay').height(arrayPageSize[1]);
		    updateNav();
	    };
	    
	    function updateNav() {
		    if(opts.imageArray.length > 1){
			    jQuery('#hoverNav').show();
                
                // if loopImages is true, always show next and prev image buttons 
                if(opts.loopImages) {
		            jQuery('#prevLink,#prevLinkText').show().click(function(){
			            changeImage((opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1); return false;
		            });
		            
		            jQuery('#nextLink,#nextLinkText').show().click(function(){
			            changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); return false;
		            });
		        
		        } else {
			        // if not first image in set, display prev image button
			        if(opts.activeImage != 0){
				        jQuery('#prevLink,#prevLinkText').show().click(function(){
					        changeImage(opts.activeImage - 1); return false;
				        });
			        }

			        // if not last image in set, display next image button
			        if(opts.activeImage != (opts.imageArray.length - 1)){
				        jQuery('#nextLink,#nextLinkText').show().click(function(){

					        changeImage(opts.activeImage +1); return false;
				        });
			        }
                }
                
			    enableKeyboardNav();
		    }
	    };
	    
	    function keyboardAction(e) {
            var o = e.data.opts
		    var keycode = e.keyCode;
		    var escapeKey = 27;
            
		    var key = String.fromCharCode(keycode).toLowerCase();
            
		    if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){ // close lightbox
			    end();
		    } else if((key == 'p') || (keycode == 37)){ // display previous image
		        if(o.loopImages) {
		            disableKeyboardNav();
		            changeImage((o.activeImage == 0) ? (o.imageArray.length - 1) : o.activeImage - 1);
		        } 
		        else if(o.activeImage != 0){
				    disableKeyboardNav();
				    changeImage(o.activeImage - 1);
			    }
		    } else if((key == 'n') || (keycode == 39)){ // display next image
		        if (opts.loopImages) {
		            disableKeyboardNav();
		            changeImage((o.activeImage == (o.imageArray.length - 1)) ? 0 : o.activeImage + 1);
		        }
			    else if(o.activeImage != (o.imageArray.length - 1)){
				    disableKeyboardNav();
				    changeImage(o.activeImage + 1);
			    }
		    }
	    };
	    
	    function enableKeyboardNav() {
		    jQuery(document).bind('keydown', {opts: opts}, keyboardAction);
	    };

	    function disableKeyboardNav() {
		    jQuery(document).unbind('keydown');
	    };
	    
	};
    
    jQuery.fn.lightbox.parseJsonData = function(data) {
        var imageArray = [];
        
        jQuery.each(data, function(){
            imageArray.push(new Array(this.url, this.title));
        });
        
        return imageArray;
    };
	jQuery.fn.lightbox.defaults = {				
		overlayOpacity : 0.8,
		borderSize : 10,
		imageArray : new Array,
		activeImage : null,
		inprogress : false, //this is an internal state variable. don't touch.
		resizeSpeed : 250,
		widthCurrent: 250,
		heightCurrent: 250,
		xScale : 1,
		yScale : 1,
		displayTitle: true,
		navbarOnTop: false,
		slideNavBar: false, // slide nav bar up/down between image resizing transitions
		navBarSlideSpeed: 250,
		displayHelp: true,
		strings : {
			help: '快捷键： \u2190 上一张图片 \u2192 下一张图片',
			prevLinkTitle: '上一张图片',
			nextLinkTitle: '下一张图片',
			prevLinkText:  '&laquo; 上一张',
			nextLinkText:  '下一张 &raquo;',
			closeTitle: '关闭',
			bigTitle: '查看原图',
			image: 'lmage',
			of: '/'
		},
		fitToScreen: true,		// resize images if they are bigger than window
        disableNavbarLinks: false,
        loopImages: false,
        imageClickClose: false,
        jsonData: null,
        jsonDataParser: null
	};
	
})(jQuery);

jQuery(document).ready(function(){
	jQuery('a[rel^="lightbox"]').lightbox({
		fitToScreen: (typeof JQLBSettings == 'object' && JQLBSettings.fitToScreen == '1') ? false : true,
		resizeSpeed: (typeof JQLBSettings == 'object' && JQLBSettings.resizeSpeed > 0) ? JQLBSettings.resizeSpeed : 250,
		imageClickClose: true
	});
});