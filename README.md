# jHC
**Corneliu S.**

---
## Description

Hierarchical clustering **(agglomerative)** is a clustering algorithm that builds a cluster hierarchy from some given points **[1]**.

**[1]** http://en.wikipedia.org/wiki/Hierarchical_clustering


##Additional Features

 Besides n-dimensional data, the algorithm also works on data points given by ***GPS coordinates***.
 
##Usage
1. Import the script.

		<script type="text/javascript" src="jHC.js"></script>
		
2. Sample Data Format
####Basic Data
		var point_data = [[0.1, 5], [2, 4], [0, 7]];
####GPS Data
The **latitude** is the first number in the pair followed by the **longitude**.

		var gps_point_data = [  [55.7858667, 12.5233995]
								 [45.4238667, 12.5233995]
								 [25.3438667, 11.6533995] ];


3. Run the algorithm. 
To run the algorithm you need to provide the data along with the **linkage** and **distance** parameters. For the traditional **hierarchical clustering** the steps are the following: 

		var hc = jHC().linkage('AVERAGE')
					  .distance('EUCLIDEAN')
					  .data(point_data);

The distance functions available are: **'EUCLIDEAN', 'HAVERSINE'** (for GPS data), **'MANHATTAN'**. The linkages implemented are **'AVERAGE', 'COMPLETE'** and **'SINGLE'**. Additionally you can provide your own distance function, which must accept at least two parameters (the two points), and then pass it to the *distance* method as its parameter. The next step is to simply run the clustering algorithm.
		
		// This will run the aglorithm and return the resulting hierarchy tree.
		var hierarchy_tree = hc();###Result FormatThe end root node is wrapped in an array and returned. The resulting clustering hierarchy has the following format:

	[{ children: [ // the two children of the root hierarchy node. 
					{ children : [{ //leaf node 
					   						coordinates: [9, 5],
						   					name: 1,
						   					size: 1 },
	  							   { //leaf node 
						   					coordinates: [7, 9],
						   					name: 2,
						   					size: 1 } 
						   		  ], 
					   coordinates: [11, 12],
					   name: 3,
					   size: 2 }, 
			
					 { //leaf node 
					   coordinates: [9, 9],
					   name: 0,
					   size: 1  }
				  ],
					   
         coordinates: [13, 14], // centroid coordinates for the cluster
         name: 4,				 // id of cluster
         size: 3				 // number of points contained
	}]Additionally you can get the leaf nodes with the *leafNodes* function.###Example
See working example in the **example/example.html** file. Use the console to inspect the input and output of the algorithm.