//pup up a small info window over node
var addPopUp=function(){
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
			var stlower=st.toLowerCase();
			res=false;
			// toIgnore.forEach(function(s){if (st.indexOf(s)>-1) res=false;});
			AppObj.popupAttrShow.forEach(function(s){if (stlower.indexOf(s)>-1) res=true;});
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
 
	var showNodeInfo=function(event) {
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
	AppObj.showNodeInfo=showNodeInfo;
	var hideNodeInfo=function(event) {
		popUp && popUp.remove();
		popUp = false;
	}
	AppObj.hideNodeInfo=hideNodeInfo;
 	
	sigInst.bind('overnodes',showNodeInfo).bind('outnodes',hideNodeInfo).draw();
};
