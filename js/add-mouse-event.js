//overnode event for changing edge color
// sigInst.bind('overnodes',function(event){

var addMouseEvent=function(){		
	var drawDownNodes=function(nodes){	  
		var neighbors = {};
		var info_array=[];
		sigInst.iterEdges(function(e){
			if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){   //edge doesn't include highlighted node
			if(window.EdgeShowing){
				e.color = AppObj.edgeGreyColor;
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
					n.color = AppObj.nodeGreyColor;
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
		AppObj.info_array = info_array;
		$('#info-panel').html(info_text).css({"opacity":0.6});
	
		//When mouse over a name, the corresponding node will highlight.
		$('li').hover(function(){
			window.li=$(this);
			id=$(this)[0].id;
			
			console.log(id);
			$(this).css({'font-size':20, 'color':'#000', 'background-color':'rgba(255,255,255,150)'});
			sigInst.iterNodes(function(n){
				if (n.id == id){
					// n.attr['tcolor']=n.color;
					n.color='#FFF';
					n.attr['tsize']=n.size;
					n.size=n.size*3 < AppObj.nodeMaxSize ? n.size*3 : AppObj.nodeMaxSize;
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
		});

		$('li').click(function(){
			window.li=$(this);
			id=$(this)[0].id;
			
			console.log(id);
			sigInst.iterNodes(function(n){ n.color=n.attr.tcolor; });
			addDownNodes([id]);
		});

		
	};

	var addDownNodes=function(nodes){	  
		var neighbors = {};
		var info_array=AppObj.info_array;	//inistialize with existing info
		sigInst.iterEdges(function(e){
			if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){   //edge doesn't include highlighted node
			//do nothing in this case
			}else{
				e.color = e.source.color;
				e.hidden=false;
				neighbors[e.source] = 1;
				neighbors[e.target] = 1;
			}
		}).iterNodes(function(n){
			if(!neighbors[n.id]){    //node not in the neighbot list we do nothing
			}else{
				n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
				n.attr['grey'] = 0;
				info_array.push([n.id, n.label]);
			}
		}).draw(2,2,2);
	  
		//cleer up duplicates
	  
		var get_uniq_info=function(a){
			for(i=1; i<a.length;){
				if (a[i-1][1]==a[i][1]){
					a.splice(i,1);
				}else{
					i++;
				}
			}
			return a;
		};
	  
		var info_text=$('<ul>');
	  
		var selectnode=sigInst.getNodes(nodes[0]);
		info_text.append('<li>'+selectnode['displayX']+" : "+selectnode['displayY']);
		info_array.sort(function(a,b){
			if( a[1]>b[1]) return 1;
			if (a[1]<b[1]) return -1;
			return 0;
		});
		info_array=get_uniq_info(info_array).forEach(function(st){
			info_text.append('<li id="'+st[0]+'">'+st[1]+'</li>');
			// var btn='<button class="btn-custom" id="'+ st[0]+ '">'+st[1]+'</button>';
			// info_text.append('<li>'+btn+'</li>');
		});
		$('#info-panel').html(info_text).css({"opacity":0.6});
	
		//When mouse over a name, the corresponding node will highlight.
		$('li').hover(function(){
			window.li=$(this);
			id=$(this)[0].id;
			
			console.log(id);
			$(this).css({'font-size':20, 'color':'#000', 'background-color':'rgba(255,255,255,150)'});
			sigInst.iterNodes(function(n){
				if (n.id == id){
					// n.attr['tcolor']=n.color;
					n.color='#FFF';
					n.attr['tsize']=n.size;
					n.size=n.size*3 < AppObj.nodeMaxSize ? n.size*3 : AppObj.nodeMaxSize;
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
		});

		$('li').click(function(){
			window.li=$(this);
			id=$(this)[0].id;
			
			console.log(id);
			sigInst.iterNodes(function(n){ n.color=n.attr.tcolor; });
			addDownNodes([id]);
		});
	};

	sigInst.bind('downnodes',function(event){
		window.mye=event;
		var nodes = event.content;
		window.clicknodes=nodes;
		drawDownNodes(nodes);
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

};