//debugging purpose

// nodes=sigInst._core.graph.nodes;
// edges=sigInst._core.graph.edges;

//globle variables
var AppState={
	EdgeShowing: false,
	MapShowing: false,
	FixScale: false,
	UseMapCoordinate: false
};

var AppObj={
	map: -1,
	mapbnd: 0,
	mapSuggestZoom: 16,
	nodeTravelDelta : 0.04,
	mapLightUpDelta : -0.03,		//To increment #sigma-example background alpha from 1 to 0.4
	sigmaLayerAlpha : 0.4,
	showNodeInfo : null,
	hideNodeInfo : null,
	edgeGreyColor : '#404040', //default edge color setting by sigma.init not working. Manually set here
	nodeGreyColor : '#404040',
	latIdx : -1,
	lngIdx : -1,
	nodeMaxSize : -1,
	popupAttrShow: ["title", "subject", "type", "rating", "neighborhood"]
};

$(document).ready(function(){
	$('#clear-graph').click(function(){
		if(!(typeof(sigInst)==='undefined')){
			console.log("clearing house");
			sigInst._core.graph.nodes=[];
			sigInst._core.graph.edges=[];	
			sigInst.draw();	
		} 
	});

	$('#data-file-select').change(function() {
		if(!(typeof(sigInst)==='undefined')){
			console.log("clearing house");
			sigInst._core.graph.nodes=[];
			sigInst._core.graph.edges=[];		
			sigInst.draw();
		} 
		init($(this).attr('value'));
	});

	$('.navbar.navbar-fixed-top').hide();
	
	//pull list of gexf files from server populate into select UI.
	$.ajax({
		url: 'listgexf.php', 
		dataType: 'text', 
		success: function(t){
			window.gexflist=t;
			files=gexflist.split('</br>');
			files.forEach(function(f){
				if(f.length>4)
					$('#data-file-select').append('<option value="'+f+'">'+f+'</option>');
			});
		}
	});
	
    $('#show-edges').click(function(){
		if (!AppState.EdgeShowing){
			if (typeof(sigInst)!='undefined'){
				sigInst.dispatch('downgraph'); //first clear the graph
				sigInst._core.graph.edges.forEach(function(e){
					e.color=e.source.color;
					e.hidden=false;
				});
				sigInst.draw(2,2,2);
			}
			AppState.EdgeShowing=true;
			this.innerHTML='Hide Edges';
		}else{
			if (typeof(sigInst)!='undefined'){
				sigInst.dispatch('downgraph');
				sigInst._core.graph.edges.forEach(function(e){
					// e.color=e.source.color;
					e.hidden=true;
				});
				sigInst.draw(2,2,2);
			}
			AppState.EdgeShowing=false;
			this.innerHTML='Show Edges';
		}
	});
	
    $('#show-map').click(function(){
		if (!AppState.MapShowing){  //turning on map
		    $('#sigma-example').css({"background":"rgba(0,0,0,1.0)"});
			if (typeof(sigInst)!='undefined'){  //has graph
			    centerMap();
			    AppObj.map.setZoom(AppObj.mapSuggestZoom);
				$('#map_canvas').show();
				sigInst.iterNodes(function(n){
					n.attr.orgX=n.displayX;
					n.attr.orgY=n.displayY;
				});
				drawOnMap(AppObj.nodeTravelDelta);
			}
			var backgroundColor = 'rgba(0,0,0,'+AppObj.sigmaLayerAlpha+')';
			$('#sigma-example').animate({backgroundColor:backgroundColor}, 2000);
			AppState.MapShowing=true;
			this.innerHTML='Hide Map';
		}else{										//turning off map
			if (typeof(sigInst)!='undefined'){   //has graph
				drawNormal(AppObj.nodeTravelDelta);
			}
			var backgroundColor = 'rgba(0,0,0,1.0)';
			$('#sigma-example').animate({backgroundColor:backgroundColor}, 2000);
			// $('#map_canvas').hide();
			AppState.MapShowing=false;
			this.innerHTML='Show Map';
		}
	});

	
	var isiPad = navigator.userAgent.match(/iPad/i) != null;
	if (isiPad){
		$('#stop-layout').hide();
		$('#clear-graph').hide();
		$('#group_separation').hide();
		$('#group_separation_label').hide();
		$('#data-file-select').hide();
		$('body').css({"padding-top":"0px"})
		$('.sigma-parent').css({"top":"25px"});
		$('#info-panel').css({"top":"25px"});
		// init('wei_graph.gexf');
		init('graph_swipe.gexf');
		
		
		$('#Platform').bind('touchmove', function(e){
			var platform=$('#Platform');
			console.log(platform);
			if((platform.scrollTop()+platform.innerHeight())>platform[0].scrollHeight){
				e.preventDefault();
			}
		});
		// document.addEventListener('touchmove', function(e){
		// 	e.preventDefault();
		// 	var touch=e.touches[0];
		// 	alert("touchmove: " + touch.pageX + "-" + touch.pageY);
		// });
		document.addEventListener('touchstart', function(e){
			// e.preventDefault();
			var touch=e.touches[0];
			
		    sigInst._core.graph.checkHover(touch.pageX, touch.pageY-25);
			var targeted = sigInst._core.graph.nodes.filter(function(n) {
		      return !!n['hover'];
		    }).map(function(n) {
		      return n.id;
		    });
			
			
			// alert("touchstart: "+touch.pageX + "-" + touch.pageY+" : "+targeted);
			if(!!targeted){
				sigInst.dispatch('downnodes', targeted);
				e.preventDefault();
			}
		});
	}

	
	$('#sigma-example').click(function(e){
		window.e = e;
	});

	$('#map-zoom-in').click(function (){
		if(AppState.MapShowing){
			var zoom=AppObj.map.getZoom();
			AppObj.map.setZoom(zoom+1);
			drawOnMap(0.1);
		}
	});
	$('#map-zoom-out').click(function (){
		if(AppState.MapShowing){
			var zoom=AppObj.map.getZoom();
			AppObj.map.setZoom(zoom-1);
			drawOnMap(0.1);
		}
	});
	$('#map-move-left').click(function(){shiftMapByPercent(0, -0.1);});
	$('#map-move-right').click(function(){shiftMapByPercent(0, 0.1);});
	$('#map-move-up').click(function(){shiftMapByPercent(0.1, 0);});
	$('#map-move-down').click(function(){shiftMapByPercent(-0.1, 0);});
	
	function shiftMapByPercent(latPercent, lngPercent){
		if(AppState.MapShowing){
			mc=AppObj.map.getCenter();
			AppObj.mapbnd=AppObj.map.getBounds();
			NE = AppObj.mapbnd.getNorthEast();
			SW = AppObj.mapbnd.getSouthWest();
			rangeLat = NE.lat() - SW.lat();
			rangeLng = NE.lng()-SW.lng();
			lat=mc.lat()+rangeLat*latPercent;
			lng=mc.lng()+rangeLng*lngPercent;
			mc=new google.maps.LatLng(lat, lng);
			AppObj.map.setCenter(mc);
			drawOnMap(0.1);
		}
	}
	
	$('#map-brighter').click(function(){console.log('clicked'); mapBrightness(-0.05);});
	$('#map-darker').click(function(){mapBrightness(0.05);});
	
	var mapBrightness=function(delta){
		console.log('inside');
		backgroundCSS=$('#sigma-example').css('background');
		idx=backgroundCSS.indexOf(')');
		alpha = parseFloat(backgroundCSS.slice(13, idx));
		console.log("alpha is" + alpha);
		alpha+=delta;
		if (alpha> 0.99) alpha = 0.99;
		if (alpha < 0.01) alpha = 0.01;
		AppObj.sigmaLayerAlpha=alpha;
		
		background='rgba(0,0,0,'+alpha+')';
		console.log(background);
		$('#sigma-example').css({'background':background});
	};
	
    initializeMap();
	$('#sigma-example').css({"background":"rgba(0,0,0,1.0)"});
	
	
});


// sigInst._core.graph.nodes.map(function(n){return !!(n.attr.attributes[latIdx]);});


function centerMap(){
  var lats=sigInst._core.graph.nodes.map(function(n){return parseFloat(n.attr.attributes[AppObj.latIdx].val);});
  var lngs=sigInst._core.graph.nodes.map(function(n){return parseFloat(n.attr.attributes[AppObj.lngIdx].val);});
  window.lats=lats;
  window.lngs=lngs;
  
  latc=lats.reduce(function(a,b){return a+b;}, 0)/lats.length;
  lngc=lngs.reduce(function(a,b){return a+b;}, 0)/lngs.length;
  latmax=Math.max.apply(null, lats);
  latmin=Math.min.apply(null, lats);
  lngmax=Math.max.apply(null, lngs);
  lngmin=Math.min.apply(null, lngs);
  
rangelat = latmax-latmin;
factorlat=rangelat/0.0004;
raiselat=Math.ceil(Math.log(factorlat) / Math.log(2));
  
rangelng = lngmax-lngmin;
factorlng=rangelng/0.0004;
raiselng=Math.ceil(Math.log(factorlng) / Math.log(2));

AppObj.mapSuggestZoom = 22-Math.max(raiselat, raiselng);
  
  mapc=new google.maps.LatLng(latc, lngc);
  AppObj.map.setCenter(mapc);
  // $('#sigma-example').css({"background":"rgba(0,0,0,0.4)"});
  
}

var mapRanges={};

var mapRange=function(){
	AppObj.mapbnd=AppObj.map.getBounds();
	NE = AppObj.mapbnd.getNorthEast();
	SW = AppObj.mapbnd.getSouthWest();
	rangeLat = NE.lat() - SW.lat();
	rangeLng = NE.lng()-SW.lng();
	zoom=AppObj.map.getZoom();
	mapRanges[zoom]=[rangeLat, rangeLng];
	console.log('zoom:'+zoom+' rangeLat:'+rangeLat+' rangeLng'+rangeLng);
}

//google map

function initializeMap() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  AppObj.map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);
}

// initializeMap();
// google.maps.event.addDomListener(window, 'load', initialize);

function drawOnMap(levelDelta){
	console.log(levelDelta);
	levelDelta=parseFloat(levelDelta);
	if (levelDelta<0.01){ levelDelta=0.01;}
	if (levelDelta>1){ levelDelta=1.0;}
    AppObj.mapbnd=AppObj.map.getBounds();
    var disp_height=$('#sigma-example').height();
    var disp_width=$('#sigma-example').width();

    function latlng2disp(lat,lng, mapbnd, disp_height, disp_width){
  	  NE = AppObj.mapbnd.getNorthEast();
  	  SW = AppObj.mapbnd.getSouthWest();
	  
  	  dispx=disp_width * (lng-SW.lng()) / (NE.lng() - SW.lng());
  	  dispy=disp_height - disp_height * (lat-SW.lat()) / (NE.lat() - SW.lat());
  	  return [dispx, dispy];
    }

    function display2xy(disp){
      	  n1=sigInst._core.graph.nodes[1];
      	  n2=sigInst._core.graph.nodes[10];
    
      	  dispx=disp[0];
      	  dispy=disp[1];
    
      	  x=n1.x+ (n2.x-n1.x)*(dispx-n1.displayX) / (n2.displayX-n1.displayX);
      	  y=n1.y+ (n2.y-n1.y)*(dispy-n1.displayY) / (n2.displayY-n1.displayY);
      	  return [x,y];
    }

	AppState.FixScale=true;
	AppState.UseMapCoordinate=true;
	
    sigInst.iterNodes(function(n){
    	  lat=parseFloat(n.attr.attributes[AppObj.latIdx].val);
    	  lng=parseFloat(n.attr.attributes[AppObj.lngIdx].val);
    	  disp=latlng2disp(lat, lng, AppObj.mapbnd, disp_height, disp_width);
		  loc=disp;
    	  // loc = display2xy(disp);
    	  n.attr.targetX=loc[0];
		  n.attr.sourceX=n.displayX;
    	  n.attr.targetY=loc[1];
		  n.attr.sourceY=n.displayY;
    });
	
	var drawAnimate=function(){
		var level = 0.0;
		var step=function(){
		    sigInst.iterNodes(function(n){
		    	  n.attr.mapx = n.attr.sourceX * (1.0-level) + n.attr.targetX * level;
		    	  n.attr.mapy = n.attr.sourceY * (1.0-level) + n.attr.targetY * level;
		    }).draw(2,2,2);  
			if (level<1.0){
				level +=levelDelta;
				setTimeout(step, 100);
			}
		};
		setTimeout(step, 100);
	};
	drawAnimate();
}

function drawNormal(levelDelta){
    sigInst.iterNodes(function(n){
		  //     	  lat=parseFloat(n.attr.attributes[latIdx].val);
		  //     	  lng=parseFloat(n.attr.attributes[lngIdx].val);
		  //     	  disp=latlng2disp(lat, lng, AppObj.mapbnd, disp_height, disp_width);
		  // loc=disp;
    	  // loc = display2xy(disp);
    	  n.attr.targetX=n.attr.orgX;
		  n.attr.sourceX=n.displayX;
    	  n.attr.targetY=n.attr.orgY;
		  n.attr.sourceY=n.displayY;
    });
	var drawAnimate=function(){
		var level = 0.0;
		var step=function(){
		    sigInst.iterNodes(function(n){
		    	  n.attr.mapx = n.attr.sourceX * (1.0-level) + n.attr.targetX * level;
		    	  n.attr.mapy = n.attr.sourceY * (1.0-level) + n.attr.targetY * level;
		    }).draw(2,2,2);  
			if (level<1.0){
				level +=levelDelta;
				setTimeout(step, 100);
			}
		};
		setTimeout(step, 100);
	};
	drawAnimate();

	setTimeout(function(){	
		AppState.FixScale=false;
		AppState.UseMapCoordinate=false;
	    // sigInst.iterNodes(function(n){
	    // 		  n.x=n.attr.orgx;
	    // 		  n.y=n.attr.orgy;
	    // }).draw(2,2,2);  	
	}, 3000);
	// 
	// sigInst.draw(2,2,2);

}

function shiftLocLatLng(delta){
	deltaLat=delta[0];
	deltaLng=delta[1];
	sigInst.iterNodes(function(n){
  	  lat=parseFloat(n.attr.attributes[AppObj.latIdx].val)+deltaLat;
  	  lng=parseFloat(n.attr.attributes[AppObj.lngIdx].val)+deltaLng;
	  n.attr.attributes[AppObj.latIdx].val=''+lat;
	  n.attr.attributes[AppObj.lngIdx].val=''+lng;
	});
	drawOnMap(0.1);
}
function shiftMapLatLng(delta){
	mc=AppObj.map.getCenter();
	lat=mc.lat()+delta[0];
	lng=mc.lng()+delta[1];
	mc=new google.maps.LatLng(lat, lng);
	AppObj.map.setCenter(mc);
}

function adjustMap(deltaLat, deltaLng, zoom){
	shiftMapLatLng([deltaLat, deltaLng]);
	AppObj.map.setZoom(zoom);
	drawOnMap(0.1);
}

// if (document.addEventListener) {
//   document.addEventListener("DOMContentLoaded", init, false);
// } else {
//   window.onload = init;
// }

