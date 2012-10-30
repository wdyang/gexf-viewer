var addFilter=function(attr, selector_id){
	if(typeof(sigInst)==='undefined'){return;}
	
	// attr='CLASSY';
	// selector_id = '#select-classy'
	var nodes=sigInst._core.graph.nodes;
	
	var attributes=sigInst._core.graph.nodes[0].attr.attributes;
	var attrIdx=-1;
	for(var i=0; i<attributes.length; i+=1){
		if(attributes[i].attr.indexOf(attr) != -1) attrIdx=i;
	}
	
	if(attrIdx < 0){
		return;
	}

	$(selector_id).show();

	vals=nodes.reduce(function(res, n){
		val = n.attr.attributes[attrIdx].val;
		if (res.indexOf(val)<0) res.push(val); 
		return res;
	}, [])
	vals.unshift("All-"+attr)
	
	vals.forEach(function(v){
		$(selector_id).append('<option value="'+v+'">'+v+'</option>');
	});
	
	$(selector_id).change(function() {
		unHideAllNodes();
		val=$(selector_id).val();
		console.log("selected "+attr +" of "+ val);
		if (val.indexOf("All")<0){   //Selected anything but All
			console.log("hiding...")
			showOnlyNodesOfAttr(val);
		} 
		sigInst.draw(2,2,2);
	});
	
	var unHideAllNodes=function(){
		sigInst.iterNodes(function(n){n.hidden=false;});
	};

	var showOnlyNodesOfAttr=function(val){
		sigInst.iterNodes(function(n){
			if (n.attr.attributes[attrIdx].val == val){ 
				n.hidden=false;
			}
			else{
				n.hidden=true;
			}
		});
	};
	
};



