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
		if (!window.EdgeShowing){
			if (typeof(sigInst)!='undefined'){
				sigInst.dispatch('downgraph'); //first clear the graph
				sigInst._core.graph.edges.forEach(function(e){
					e.color=e.source.color;
					e.hidden=false;
				});
				sigInst.draw(2,2,2);
			}
			window.EdgeShowing=true;
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
			window.EdgeShowing=false;
			this.innerHTML='Show Edges';
		}
	});
	var EdgeShowing=false;
	window.EdgeShowing=EdgeShowing;
	
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

	//google map

    var map;
    function initialize() {
      var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById('map_canvas'),
          mapOptions);
	  	window.map=map;
    }

    initialize();
	// google.maps.event.addDomListener(window, 'load', initialize);
	
	$('#sigma-example').click(function(e){
		window.e = e;
	});

});

function init(gexffile) {
  // Instanciate sigma.js and customize rendering :
  var sigInst = sigma.init($('#sigma-example')[0]).drawingProperties({
    defaultLabelColor: '#fff',
    defaultLabelSize: 14,
    defaultLabelBGColor: '#000000',
    defaultLabelHoverColor: '#000000',
    labelThreshold: 11,
    defaultEdgeType: 'curve'
  }).graphProperties({
    minNodeSize: 1,
    maxNodeSize: 10,
    minEdgeSize: 1.5,
    maxEdgeSize: 1.5
  }).mouseProperties({
    maxRatio: 32
  });
  window.sigInst =sigInst;

  // Parse a GEXF encoded file to fill the graph
  // (requires "sigma.parseGexf.js" to be included)
  // sigInst.parseGexf('user4_30_fin_district_r45_t1_excel.gexf');
  // sigInst.parseGexf(gexfname);
  // sigInst.parseGexf('graph.gexf');
  sigInst.parseGexf('data/'+gexffile);
  
  //default edge color setting by sigma.init not working. Manually set here
  var edgeGreyColor = '#404040';
  var nodeGreyColor = '#404040';
  // sigInst._core.graph.edges.forEach(function(e){  e.color=edgeGreyColor; });
  // var EdgeShowing=false;
  // window.EdgeShowing=EdgeShowing;
  sigInst._core.graph.edges.forEach(function(e){  e.hidden=true; });
  
  //finding the index of TITLE in nodes attributes
  var n0=sigInst._core.graph.nodes[0];
  attr=n0.attr.attributes;
  var titleIdx=-1;
  var latIdx=-1;
  var lngIdx=-1;
  for(var i=0; i<attr.length; i+=1){
	  if(attr[i].attr.indexOf('TITLE') != -1) titleIdx=i;
	  if(attr[i].attr.indexOf('LAT') != -1) latIdx=i;
	  if(attr[i].attr.indexOf('LNG') != -1) lngIdx=i;
  }
  window.latIdx=latIdx;
  window.lngIdx=lngIdx;
  console.log('titleIdx:'+titleIdx+' latIdx:'+latIdx+' lngIdx:'+lngIdx);
  
  if(titleIdx>-1)  sigInst._core.graph.nodes.forEach(function(n){ n.label = n.attr.attributes[titleIdx].val; });
  var nodeMaxSize=-1;
  sigInst.iterNodes(function(n){nodeMaxSize = (n.size > nodeMaxSize ? n.size : nodeMaxSize);});
  
    
  // assign nodes groupID based in color
  var color_list=Array();
  var group_id=0;
  // for(i=0; i<sigInst._core.graph.nodes.length; i++){
  sigInst._core.graph.nodes.forEach(function(node){
	  // node=sigInst._core.graph.nodes[i];
	  color=node.color;
	  if (!(color_list.hasOwnProperty(color))){
		  color_list[color]=group_id;
		  group_id++;
	  }
	  node.group=color_list[color];
  });
  // for (var k in color_list) { console.log('key is: '+k+', value is: '+color_list[k]);}

	// sigInst._core.graph.edges.forEach(function(e){
	// 	if (e.source.group != e.target.group) e.weight=0.3;
	// })

	//assign edge weight according to whether two nodes belong to the same group
    // document.getElementById('group_separation').addEventListener('change',function(){
	$('#group_separation').change(function(){
	  var weight=1.0-parseFloat(document.getElementById('group_separation').value);
	  // console.log('intergroup weight changed to '+weight);
	  sigInst._core.graph.edges.forEach(function(e){
		  if (e.source.group==null) console.log(e.source);
		  if (e.target.group==null) console.log(e.target);
		  if (e.source.group!=e.target.group) e.weight = weight;
	  });
  });
  // }, false);

  
  
  
  // sigInst.startForceAtlas2();
  
  var isRunning = false;
  document.getElementById('stop-layout').addEventListener('click',function(){
    if(isRunning){
      isRunning = false;
      sigInst.stopForceAtlas2();
      document.getElementById('stop-layout').childNodes[0].nodeValue = 'Start Layout';
    }else{
      isRunning = true;
      sigInst.startForceAtlas2();
      document.getElementById('stop-layout').childNodes[0].nodeValue = 'Stop Layout';
    }
  },true);
  document.getElementById('rescale-graph').addEventListener('click',function(){
    sigInst.position(0,0,1).draw();
  },true);

  //overnode event for changing edge color
  // sigInst.bind('overnodes',function(event){
  sigInst.bind('downnodes',function(event){
      var nodes = event.content;
	  window.clicknodes=nodes;
      var neighbors = {};
	  var info_array=[];
      sigInst.iterEdges(function(e){
        if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){   //edge doesn't include highlighted node
			if(window.EdgeShowing){
				e.color = edgeGreyColor;
				e.hidden=false;
			}else{
				e.hidden=true;
			}
        }else{
			e.color = e.source.color;
			e.hidden=false;
			neighbors[e.source] = 1;
			neighbors[e.target] = 1;
	  	}
      }).iterNodes(function(n){
        if(!neighbors[n.id]){
          if(!n.attr['grey']){
            n.attr['true_color'] = n.color;
            n.color = nodeGreyColor;
            n.attr['grey'] = 1;
          }
        }else{
          n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
          n.attr['grey'] = 0;
		  info_array.push([n.id, n.label]);
        }
      }).draw(2,2,2);
	  var info_text=$('<ul>');
	  
	  var selectnode=sigInst.getNodes(nodes[0]);
	  info_text.append('<li>'+selectnode['displayX']+" : "+selectnode['displayY']);
	  info_array.sort(function(a,b){
		  if( a[1]>b[1]) return 1;
		  if (a[1]<b[1]) return -1;
		  return 0;
		  }).forEach(function(st){
		  info_text.append('<li id="'+st[0]+'">'+st[1]+'</li>');
		  // var btn='<button class="btn-custom" id="'+ st[0]+ '">'+st[1]+'</button>';
		  // info_text.append('<li>'+btn+'</li>');
	  });
	  $('#info-panel').html(info_text).css({"opacity":0.6});
	
	  //When mouse over a name, the corresponding node will highlight.
	  	$('li').hover(function(){
			window.li=$(this);
			id=$(this)[0].id;
			$(this).css({'font-size':20, 'color':'#000', 'background-color':'rgba(255,255,255,150)'});
			sigInst.iterNodes(function(n){
				if (n.id == id){
					n.attr['tcolor']=n.color;
					n.color='#FFF';
					n.attr['tsize']=n.size;
					n.size=n.size*3 < nodeMaxSize ? n.size*3 : nodeMaxSize;
				};
			}).draw(2,2,2);
	  		},function(){
				$(this).css({'font-size':14, 'color':'#fff', 'background-color':'rgba(0,0,0,0)'});
				id=$(this)[0].id;
				sigInst.iterNodes(function(n){
					if (n.id == id){
						n.color=n.attr['tcolor'];
						n.size=n.attr['tsize'];
					};
				}).draw(2,2,2);
		  	}
		);
    });

	//Click on anywhere on the graph other than nodes will remove the highlights
	//first recover all the node color
	//second recover edge color, show or display edges depends on window.EdgeShowing
	sigInst.bind('downgraph',function(){
	      sigInst.iterNodes(function(n){
	        n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
	        n.attr['grey'] = 0;
	      }).iterEdges(function(e){
			e.color=e.source.color;
			  if(window.EdgeShowing){
				e.hidden=false;  
			  }else{
				  e.hidden=true;
			  }
	        // e.color=edgeGreyColor;
	      }).draw(2,2,2);
		  $('#info-panel').html('').css({"opacity":0});
	  });
	  //clear info-panel
	  $('#info-panel').html('').css({"opacity":0});
	
// add a popup window for displaying attributes
  (function(){
    var popUp;
 
    // This function is used to generate the attributes list from the node attributes.
    // Since the graph comes from GEXF, the attibutes look like:
    // [
    //   { attr: 'Lorem', val: '42' },
    //   { attr: 'Ipsum', val: 'dolores' },
    //   ...
    //   { attr: 'Sit',   val: 'amet' }
    // ]
    function attributesToString(attr) {
		var toIgnore=["GEOHASH", "TITLE", "weighted degree", "modularity", "component", "eccent", "closness", "between"];
		
		function shouldInclude(st){
			res=true;
			toIgnore.forEach(function(s){if (st.indexOf(s)>-1) res=false;});
			// console.log(st+':'+res);
			return res;
		}
		
      return '<ul>' +
        attr.map(function(o){
			if(shouldInclude(o.attr)){
				return ('<li>' + o.attr + ' : ' + o.val + '</li>');};
        }).join('') +
        '</ul>';
    }
 
    function showNodeInfo(event) {
      popUp && popUp.remove();
 
      var node;
      sigInst.iterNodes(function(n){
        node = n;
      },[event.content[0]]);
 	 
	  popUp = $(
        '<div class="node-info-popup"></div>'
      ).append(
        // The GEXF parser stores all the attributes in an array named
        // 'attributes'. And since sigma.js does not recognize the key
        // 'attributes' (unlike the keys 'label', 'color', 'size' etc),
        // it stores it in the node 'attr' object :
		// 'attribuites:here'
        attributesToString( node['attr']['attributes'] )
      ).attr(
        'id',
        'node-info'+sigInst.getID()
      ).css({
        'display': 'inline-block',
        'border-radius': 3,
        'padding': 5,
        'background': '#fff',
        'color': '#111',
        'box-shadow': '0 0 4px #666',
        'position': 'absolute',
        'left': node.displayX,
        'top': node.displayY+15
      });
	  window.popUp0 = popUp;
 	 
      $('ul',popUp).css('margin','0 0 0 20px');
	  
 
      $('#sigma-example').append(popUp);
    }
 
    function hideNodeInfo(event) {
      popUp && popUp.remove();
      popUp = false;
    }
 
    sigInst.bind('overnodes',showNodeInfo).bind('outnodes',hideNodeInfo).draw();
  })();
  
  // Draw the graph :
  // sigInst.draw();
  sigInst.dispatch('downgraph');
  
  
  
  //adjust map
  centerMap();
  map.setZoom(15);
}

function centerMap(){
  var lats=sigInst._core.graph.nodes.map(function(n){return parseFloat(n.attr.attributes[latIdx].val);});
  var lngs=sigInst._core.graph.nodes.map(function(n){return parseFloat(n.attr.attributes[lngIdx].val);});
  window.lats=lats;
  window.lngs=lngs;
  
  latc=lats.reduce(function(a,b){return a+b;}, 0)/lats.length;
  lngc=lngs.reduce(function(a,b){return a+b;}, 0)/lngs.length;
  latmax=Math.max.apply(null, lats);
  latmin=Math.min.apply(null, lats);
  lngmax=Math.max.apply(null, lngs);
  lngmin=Math.min.apply(null, lngs);
  
  mapc=new google.maps.LatLng(latc, lngc);
  map.setCenter(mapc);
  $('#sigma-example').css({"background":"rgba(0,0,0,0.4)"});
  
}

function drawOnMap(){
    var mapbnd=map.getBounds();
    var disp_height=$('#sigma-example').height();
    var disp_width=$('#sigma-example').width();

    function latlng2disp(lat,lng, mapbnd, disp_height, disp_width){
  	  NE = mapbnd.getNorthEast();
  	  SW = mapbnd.getSouthWest();
	  
  	  dispx=disp_width * (lng-SW.lng()) / (NE.lng() - SW.lng());
  	  dispy=disp_height - disp_height * (lat-SW.lat()) / (NE.lat() - SW.lat());
  	  return [dispx, dispy];
    }

    // disp=latlng2disp(lats[0], lngs[0], mapbnd, disp_height, disp_width);

    function display2xy(disp){
  	  n1=sigInst._core.graph.nodes[1];
  	  n2=sigInst._core.graph.nodes[10];

  	  dispx=disp[0];
  	  dispy=disp[1];

  	  x=n1.x+ (n2.x-n1.x)*(dispx-n1.displayX) / (n2.displayX-n1.displayX);
  	  y=n1.y+ (n2.y-n1.y)*(dispy-n1.displayY) / (n2.displayY-n1.displayY);
  	  return [x,y];
    }

	// var idx=0;
	// sigInst._core.graph.nodes.forEach(function(n){
	//   	  lat=parseFloat(n.attr.attributes[latIdx].val);
	//   	  lng=parseFloat(n.attr.attributes[lngIdx].val);
	//   	  disp=latlng2disp(lat, lng, mapbnd, disp_height, disp_width);
	//   	  loc = display2xy(disp);
	//   	  n.x=loc[0];
	//   	  n.y=loc[1];
	//   idx+=1;
	//   if (idx%10==0){
	// 	  sigInst.draw(2,2,2);
	// 	  var date=new Date();
	// 	  var curDate=null;
	// 	  do{curDate=new Date();}
	// 	  while(curDate-date < 200);
	//   }
	// });
	
	var FixScale=true;
	window.FixScale=FixScale;
	var UseMapCoordinate=true;
	window.UseMapCoordinate=UseMapCoordinate;
	
    sigInst.iterNodes(function(n){
    	  lat=parseFloat(n.attr.attributes[latIdx].val);
    	  lng=parseFloat(n.attr.attributes[lngIdx].val);
    	  disp=latlng2disp(lat, lng, mapbnd, disp_height, disp_width);
		  loc=disp;
    	  // loc = display2xy(disp);
		  n.attr['orgx']=n.x;
		  n.attr['orgy']=n.y;
    	  n.attr['mapx']=loc[0];
    	  n.attr['mapy']=loc[1];
    });
	sigInst.draw(2,2,2);
  // }).draw_no_rescale(2,2,2);
  
}

function drawNormal(){
	FixScale=false;
    sigInst.iterNodes(function(n){
		  n.x=n.attr['orgx'];
		  n.y=n.attr['orgy'];
    }).draw(2,2,2);  	
}

function shiftLocLatLng(delta){
	deltaLat=delta[0];
	deltaLng=delta[1];
	sigInst.iterNodes(function(n){
  	  lat=parseFloat(n.attr.attributes[latIdx].val)+deltaLat;
  	  lng=parseFloat(n.attr.attributes[lngIdx].val)+deltaLng;
	  n.attr.attributes[latIdx].val=''+lat;
	  n.attr.attributes[lngIdx].val=''+lng;
	});
	drawOnMap();
}
function shiftMapLatLng(delta){
	mc=map.getCenter();
	lat=mc.lat()+delta[0];
	lng=mc.lng()+delta[1];
	mc=new google.maps.LatLng(lat, lng);
	map.setCenter(mc);
}

function adjustMap(deltaLat, deltaLng, zoom){
	shiftMapLatLng([deltaLat, deltaLng]);
	map.setZoom(zoom);
	drawOnMap();
}

// if (document.addEventListener) {
//   document.addEventListener("DOMContentLoaded", init, false);
// } else {
//   window.onload = init;
// }

