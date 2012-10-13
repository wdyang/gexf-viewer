GEXF viewer with Sigma.js

version 0.1
Resources used:
Sigma.js, bootstrap

Extension from sigma.js:
1. Show attributes when mouse over
2. Use AJAX/Php/Jquery to list available gexf files on server, populate file selections.
3. When file selection changes, remove all the nodes and edges in sigInst, create a new sigInst. This is not the right way, but it works so far.
4. Add separation force between different groups of node. Separation force adjustable, 0: none, 1: full.

To Do:
1. make it take full screen.
2. select which attributes to show.
3. apply separation force to a specific attributes, rather than just the group id.
4. add separation within a cluster.

10/12/2012
gexf files goes to data folder.
It takes whole window now, with information panel on the right.
When a node is selected, the connected nodes are listed on the info-panel.
When mouse hover over a name on the info-panel, the corresponding node in the graph lit up.