//separating init function to a new file

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
	AppObj.latIdx=latIdx;
	AppObj.lngIdx=lngIdx;
	console.log('titleIdx:'+titleIdx+' latIdx:'+latIdx+' lngIdx:'+lngIdx);
  
	if(titleIdx>-1)  sigInst._core.graph.nodes.forEach(function(n){ n.label = n.attr.attributes[titleIdx].val; });
	var nodeMaxSize=-1;
	sigInst.iterNodes(function(n){
		nodeMaxSize = (n.size > nodeMaxSize ? n.size : nodeMaxSize);
	});
	sigInst.iterNodes(function(n){
		n.attr['tsize']=n.size;				//for size restoration
	});
	console.log("max node size is "+ nodeMaxSize);
	AppObj.nodeMaxSize=nodeMaxSize;
    
	// assign nodes groupID based in color
	var color_list=Array();
	var group_id=0;
	// for(i=0; i<sigInst._core.graph.nodes.length; i++){

	//Get groupIDs
	sigInst._core.graph.nodes.forEach(function(node){
		// node=sigInst._core.graph.nodes[i];
		color=node.color;
		if (!(color_list.hasOwnProperty(color))){
			color_list[color]=group_id;
			group_id++;
		}
		node.group=color_list[color];
		node.attr.tcolor=node.color;
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

	addMouseEvent();

	//clear info-panel
	$('#info-panel').html('').css({"opacity":0});
	
	// add a popup window for displaying attributes
	addPopUp();
	addFilter('CLASSY', '#select-classy');
	addFilter('TYPE', '#select-type');
	addFilter('NEIGHBORHOOD', '#select-neighborhood');
	addFilter('HIP', '#select-hip');
	addFilter('GIRLS', '#select-girls');
	addFilter('KIDS', '#select-kids');
	addFilter('DATING', '#select-dating');
}






