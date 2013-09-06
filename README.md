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
To run the algorithm you need to provide the data along with the **eps** and **minPts** parameters. For the traditional **DBSCAN** the steps are the following: 

		var hc = jHC().linkage('AVERAGE')
					  .distance('EUCLIDEAN')
					  .data(point_data);

The distance functions available are: **'EUCLIDEAN', 'HAVERSINE'** (for GPS data), **'MANHATTAN'**. The linkages implemented are **'AVERAGE', 'COMPLETE'** and **'SINGLE'**. Additionally you can provide your own distance function, which must accept at least two parameters (the two points), and then pass it to the *distance* method as its parameter. The next step is to simply run the clustering algorithm.
		
		// This will run the aglorithm and return the resulting hierarchy tree.
		var hierarchy_tree = hc();The resulting clustering hierarchy has the following format:
