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
		// console.log(n.id);
		val = n.attr.attributes[attrIdx].val;
		val_split=val.split('_');										//Example: Asian_Sushi, or Downtown_Financial district
		val_split.forEach(function(item){
			if (res.indexOf(item)<0) res.push(item); 
		});
		return res;
	}, []).sort();
	vals.unshift("All-"+attr)
	
	vals.forEach(function(v){
		$(selector_id).append('<option value="'+v+'">'+v+'</option>');
	});
	
	$(selector_id).change(function() {
		val=$(selector_id).val();
		
		console.log("selected "+attr +" of "+ val);
		if (val.indexOf("All")<0){   //Selected anything but All
			console.log("hiding...")
			FilterSystem.addFilter(attrIdx, val);
		}else{
			FilterSystem.removeFilter(attrIdx);
		}
		FilterSystem.doFilter();
		
		sigInst.draw(2,2,2);
	});
};

var FilterSystem=(function(){
	var filterList=[];
	var addFilter=function(attrIdx, val){
		filterList[attrIdx]= val;
	};
	var removeFilter=function(attrIdx){
		delete filterList[attrIdx];
	};
	var hideAllNodes=function(){
		sigInst.iterNodes(function(n){n.hidden=true;});
	};
	var showAllNodes=function(){
		sigInst.iterNodes(function(n){n.hidden=false;});
	};
	
	var showByAttr=function(attrIdx, val){
		sigInst.iterNodes(function(n){
			vals=n.attr.attributes[attrIdx].val.split('_');
			vals.forEach(function(v){
				if (v == val){ n.hidden=false;}
			});
		});
	};
	
	var hideByAttr=function(attrIdx, val){
		sigInst.iterNodes(function(n){
			var vals=n.attr.attributes[attrIdx].val.split('_');
			var matching=vals.reduce(function(res, v){
				return res || v==val;
			}, false);
			if (!matching) n.hidden=true;
		});
	};
	
	
	var doFilter=function(){
		showAllNodes();
		for(attrIdx in filterList){
			hideByAttr(attrIdx, filterList[attrIdx]);
		}
	};
	return {
		addFilter: addFilter,
		removeFilter: removeFilter,
		doFilter: doFilter,
		filterList: filterList
	};
}());

