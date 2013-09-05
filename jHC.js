(function(){
	//TODO: add threshold as an official parameter! and getters/setters
	HierarchicalClustering = function() {

		//Local vars 
		var point_data;
		
		var distance_function;
		var linkage;

		var clusters   = [];
		var leaf_nodes = {};

		var point_cluster_assignment = [];

		var point_distance_matrix   = [];
		var cluster_distance_matrix = {};

        var link_distance = {};

        //Distances
		function euclidean_distance(a, b){
			var d = 0;
			for(var i = 0; i < a.length; i++)
				d += Math.pow(a[i] - b[i], 2);
			d = Math.sqrt(d);
			return d;
		};

		function mannhattan_distance(a, b){
			var d = 0;
			for(var i = 0; i < a.length; i++)
				d += Math.abs(a[i] - b[i]);
			d = Math.sqrt(d);
			return d;
		};

		function haversine_distance(a, b, precision){
			if (typeof precision == 'undefined') precision = 4;

			var R = 6371;

			var lat1 = a.y  * Math.PI / 180, 
				lon1 = a.x  * Math.PI / 180;
			var lat2 = b.y  * Math.PI / 180,
				lon2 = b.x  * Math.PI / 180;

			var dLat = lat2 - lat1;
			var dLon = lon2 - lon1;

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			        Math.cos(lat1)   * Math.cos(lat2) *
			        Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = R * c;

			return d.toPrecision(precision);
		};

		//Core Algorithm Related.
        function init(){
        	point_data.forEach(function(d, i){
				clusters[i] = {
								name: i, // interal id
								id:   point_data[i].id,
								x:    point_data[i].x,
								y:    point_data[i].y,
								//children: [],
								size: 1,
								//level: 0
							  };
				leaf_nodes[clusters[i].id]  = clusters[i];
				point_cluster_assignment[i] = i;
			});
        }

        function update_point_cluster_assignment(new_id, c1_id, c2_id){
        	for(var i = 0; i < point_cluster_assignment.length; i++)
        		if(point_cluster_assignment[i] == c1_id || point_cluster_assignment[i] == c2_id){
        			point_cluster_assignment[i] = new_id;
        		}
        }

        function compute_centroid(cluster_name){
        	var cluster_x = 0;
        	var cluster_y = 0;
        	var num_points = 0;
        	for(var i = 0; i < point_cluster_assignment.length; i++)
        		if(point_cluster_assignment[i] == cluster_name){
        			cluster_x += point_data[i].x;
        			cluster_y += point_data[i].y;
        			num_points++;
        	}

        	cluster_x /= num_points;
        	cluster_y /= num_points;

        	return { x: cluster_x, y: cluster_y };
        }

        function update_next_link_index(c1, c2){

        	var link_distance_keys = Object.keys(link_distance);

        	link_distance_keys.forEach(function(k,i){
        		if(link_distance[k] == c1 || link_distance[k] == c2)
        			link_distance[k] = undefined;
        	});

           for(var i = 0; i < clusters.length; i++){
           			if(typeof clusters[i] == 'undefined')
           				continue;
					var cl_1 = clusters[i].name;
					for(var j = 0; j < clusters.length; j++){
						if(typeof clusters[j] == 'undefined')
           						continue;
           				var cl_2 = clusters[j].name;
           				
           				if(cl_1 == cl_2)
           						continue;

						if(link_distance[i] == undefined) {
							link_distance[cl_1] = cl_2;
						} else if(cluster_distance_matrix[cl_1][link_distance[cl_1]] > cluster_distance_matrix[cl_1][cl_2]){
							link_distance[cl_1] = cl_2;
						}	
					}		
			}
        }

        function cluster_link_distance(c1, c2){
        	var c1_points = [];
        	var c2_points = [];

        	point_cluster_assignment.forEach(function(d,i){
        			if( d == c1.name){
        				c1_points.push(i);
        			} else if ( d == c2.name ){
        				c2_points.push(i);
        			}
        	});

        	if(linkage == 'SINGLE'){

        		var min = Infinity;
        		for(var i = 0 ; i < c1_points.length; i++)
        			for(var j = 0 ; j < c2_points.length; j++){
        				var d =  distance(point_data[c1_points[i]], point_data[c2_points[j]]);
        				if (d < min){
        					min = d;
        				}
        			}
        		return min;

        	}else if(linkage == 'COMPLETE'){

        		var max = 0;
        		for(var i = 0 ; i < c1_points.length; i++)
        			for(var j = 0 ; j < c2_points.length; j++){
        				var d =  distance(point_data[c1_points[i]], point_data[c2_points[j]]);
        				if (d > max){
        					max = d;
        				}
        			}
        		return max;

        	}else if(linkage == 'AVERAGE'){

        		var average = 0;
        		for(var i = 0 ; i < c1_points.length; i++)
        			for(var j = 0 ; j < c2_points.length; j++){
        				var d =  (point_data[c1_points[i]], point_data[c2_points[j]]);
	        			average = average + (+d);
        			}
        		average /= (c1_points.length * c2_points.length);
        		return average;

        	}
        }

		function update_distance_matrix(c_id){
			if(arguments.length == 0){
				//intialization
				for(var i = 0; i < clusters.length; i++){
					for(var j = 0; j <= i; j++){
						var d = Infinity;
						if(i != j)
						 	d = distance(clusters[i], clusters[j]);

						point_distance_matrix[i] = point_distance_matrix[i] || [];
						point_distance_matrix[j] = point_distance_matrix[j] || [];

						point_distance_matrix[i][j] = d;
						point_distance_matrix[j][i] = d;
					}
				}
				point_distance_matrix.forEach(function(line,i){
					cluster_distance_matrix[i] = {};
					var min_link_distance = Infinity;
					line.forEach(function(element,j){
						cluster_distance_matrix[i][j] = element;
						if( min_link_distance > element){
							link_distance[i] = j;
							min_link_distance = element;
						}
					});
				});

			}else{
				//update
				for(var i = 0; i < clusters.length; i++){
					var d = Infinity;

					if(typeof clusters[i] == 'undefined'){
						continue;
					}

					if(clusters[i].name != c_id)
						d = cluster_link_distance(clusters[i], clusters[c_id]);

					cluster_distance_matrix[c_id] = cluster_distance_matrix[c_id] || {};
					cluster_distance_matrix[c_id][clusters[i].name] = d;
					cluster_distance_matrix[clusters[i].name][c_id] = d;
				}
			}
		}

		function get_closest_clusters(){
			var min = Infinity;
			var c1_id;
			var c2_id;

			for(var i = 0; i < clusters.length; i++){
				
				if(typeof clusters[i] == 'undefined')
					continue;

				var cluster_id = clusters[i].name;

				if(cluster_distance_matrix[cluster_id][link_distance[cluster_id]] < min){
					min   = cluster_distance_matrix[cluster_id][link_distance[cluster_id]]; 
					c2_id = link_distance[cluster_id]; 
					c1_id = cluster_id;
				}
			}
			return [c1_id, c2_id, min]
		}

		function remove_clusters(c1, c2){
			delete clusters[c1];
			delete clusters[c2];
			delete link_distance[c1];
			delete link_distance[c2];
			delete cluster_distance_matrix[c1];
			delete cluster_distance_matrix[c2];

			var keys = Object.keys(cluster_distance_matrix);

			for(var i = 0; i < keys.length; i++)
				if(typeof cluster_distance_matrix[i] != 'undefined'){
					delete cluster_distance_matrix[i][c1];
					delete cluster_distance_matrix[i][c2];
			}
		}

		function merge_clusters(){
			var to_merge = getClosestClusters();
			var new_cluster = {
					name: 		clusters.length,
					size: 		clusters[to_merge[0]].size + clusters[to_merge[1]].size,
					children: 	[clusters[to_merge[0]], clusters[to_merge[1]]],
				//	level: 		Math.max(clusters[to_merge[0]].level, clusters[to_merge[1]].level) + 1
			};
			
			clusters[to_merge[0]].parent = new_cluster;
			clusters[to_merge[1]].parent = new_cluster;
			
			remove_clusters(to_merge[0], to_merge[1]);
			update_point_cluster_assignment(new_cluster.name, to_merge[0], to_merge[1]);
			
			var coordinates = compute_centroid(new_cluster.name);
			new_cluster.x   = coordinates.x;
			new_cluster.y   = coordinates.y;
			
			clusters.push(new_cluster);

			update_distance_matrix(new_cluster.name);
			update_next_link_index(to_merge[0],to_merge[1]);

			return new_cluster;
		}

		var core = function(){ // main algorithm loop
			var num_clusters = point_data.length;
			init();
			update_distance_matrix();
			update_next_link_index();

			while(num_clusters > 1){
				mergeClusters();
				num_clusters--;
			}
			
			return clusters;
		};

		core.leafNodes = function(){
			return leaf_nodes;
		}

		core.distance = function(fct){
			if(arguments.length == 1)
			{
				if(typeof fct == 'string'){
					switch(fct){
						case 'HAVERSINE':
								distance = haversine_distance;
								break;
						case 'EUCLIDEN':
								distance = euclidean_distance;
								break;
						case 'MANHATTAN':
								distance = manhattan_distance;
								break;
						default:   
								distance = euclidean_distance;
					}
				}
				else 
					if(typeof fct == 'function'){
						distance = fct;
					}
			}
			
			return core;
		};

		core.linkage = function(l){
			if(typeof l == 'string'){
				if(l == 'AVERAGE' || l == 'COMPLETE' || l == 'SINGLE')
					linkage = l;
			}
				return core;
		};

		core.pointData = function(data){
			if(typeof data != undefined){
				point_data = data;
			}
			return core;
		};

		return core;
	};
})();