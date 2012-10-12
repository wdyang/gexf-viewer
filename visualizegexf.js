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
  var edgeGreyColor = '#000';
  var nodeGreyColor = '#404040';
  sigInst._core.graph.edges.forEach(function(e){  e.color=edgeGreyColor; });
  
  //finding the index of TITLE in nodes attributes
  var n0=sigInst._core.graph.nodes[0];
  attr=n0.attr.attributes;
  var titleIdx=-1;
  for(var i=0; i<attr.length; i+=1){
	  if(attr[i].attr.indexOf('TITLE') != -1) titleIdx=i;
  }
  
  if(titleIdx>-1)  sigInst._core.graph.nodes.forEach(function(n){ n.label = n.attr.attributes[titleIdx].val; });
  
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
	  // console.log(nodes);
      var neighbors = {};
      sigInst.iterEdges(function(e){
        if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){   //edge doesn't include highlighted node
			e.color = edgeGreyColor;
			e.hidden=true;
        }else{
		  e.color = nodes[0].color;
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
        }
      }).draw(2,2,2);
    });

	sigInst.bind('downgraph',function(){
	      sigInst.iterEdges(function(e){
	        e.color=edgeGreyColor;
	      }).iterNodes(function(n){
	        n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
	        n.attr['grey'] = 0;
	      }).draw(2,2,2);
	  });
	
	// .bind('outnodes',function(){
	//       sigInst.iterEdges(function(e){
	//         e.color=edgeGreyColor;
	//       }).iterNodes(function(n){
	//         n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
	//         n.attr['grey'] = 0;
	//       }).draw(2,2,2);
	//   });
	
	
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
		var toIgnore=["GEOHASH", "LAT", "LNG", "TITLE", "degree", "modularity", "component", "eccent", "closness", "between"];
		
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
}

// if (document.addEventListener) {
//   document.addEventListener("DOMContentLoaded", init, false);
// } else {
//   window.onload = init;
// }

