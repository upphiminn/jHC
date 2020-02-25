/* 
Author: 
Corneliu S. (github.com/upphiminn)
2013

Code style is very imperative, I know :)
*/

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.jHC = factory();
	}
})(typeof self !== 'undefined' ? self : this, function() {
	const jHC = function() {
		//Local lets
		let point_data;
		let distance_function;
		let linkage;

		const clusters = [];
		const leaf_nodes = {};

		const point_cluster_assignment = [];

		const point_distance_matrix = [];
		const cluster_distance_matrix = {};

		const link_distance = {};

		//Distance Functions
		function euclidean_distance(a, b) {
			let d = 0;

			for (let i = 0; i < a.length; i++) {
				d += Math.pow(a[i] - b[i], 2);
			}

			return Math.sqrt(d);
		}

		function mannhattan_distance(a, b) {
			let d = 0;

			for (let i = 0; i < a.length; i++) {
				d += Math.abs(a[i] - b[i]);
			}

			return Math.sqrt(d);
		}

		function haversine_distance(a, b, precision = 4) {
			const R = 6371;
			const lat1 = (a[1] * Math.PI) / 180;
			const lon1 = (a[0] * Math.PI) / 180;
			const lat2 = (b[1] * Math.PI) / 180;
			const lon2 = (b[0] * Math.PI) / 180;
			const dLat = lat2 - lat1;
			const dLon = lon2 - lon1;

			a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			const d = R * c;

			return d.toPrecision(precision);
		}

		// Core Algorithm Related.
		function init() {
			point_data.forEach(function(d, i) {
				clusters[i] = {
					name: i, // interal id
					coordinates: point_data[i],
					size: 1
				};
				leaf_nodes[clusters[i].name] = clusters[i];
				point_cluster_assignment[i] = i;
			});
		}

		function update_point_cluster_assignment(new_id, c1_id, c2_id) {
			for (let i = 0; i < point_cluster_assignment.length; i++) {
				if (point_cluster_assignment[i] == c1_id || point_cluster_assignment[i] == c2_id) {
					point_cluster_assignment[i] = new_id;
				}
			}
		}

		function compute_centroid(cluster_name) {
			const cluster_coordinates = [];
			let num_points = 0;

			for (let i = 0; i < point_cluster_assignment.length; i++) {
				if (point_cluster_assignment[i] == cluster_name) {
					for (let j = 0; j < point_data[i].length; j++) {
						cluster_coordinates[j] = (cluster_coordinates[j] || 0) + point_data[i][j];
					}

					num_points++;
				}
			}

			for (let j = 0; j < cluster_coordinates.length; j++) {
				cluster_coordinates[j] /= num_points;
			}

			return cluster_coordinates;
		}

		function update_next_link_index(c1, c2) {
			const link_distance_keys = Object.keys(link_distance);

			link_distance_keys.forEach(function(k) {
				if (link_distance[k] == c1 || link_distance[k] == c2) {
					link_distance[k] = undefined;
				}
			});

			for (let i = 0; i < clusters.length; i++) {
				if (typeof clusters[i] === 'undefined') {
					continue;
				}

				let cl_1 = clusters[i].name;

				for (let j = 0; j < clusters.length; j++) {
					if (typeof clusters[j] === 'undefined') {
						continue;
					}

					let cl_2 = clusters[j].name;

					if (cl_1 == cl_2) {
						continue;
					}

					if (link_distance[i] == undefined) {
						link_distance[cl_1] = cl_2;
					} else if (
						cluster_distance_matrix[cl_1][link_distance[cl_1]] > cluster_distance_matrix[cl_1][cl_2]
					) {
						link_distance[cl_1] = cl_2;
					}
				}
			}
		}

		function cluster_link_distance(c1, c2) {
			const c1_points = [];
			const c2_points = [];

			point_cluster_assignment.forEach(function(d, i) {
				if (d == c1.name) {
					c1_points.push(i);
				} else if (d == c2.name) {
					c2_points.push(i);
				}
			});

			if (linkage === 'SINGLE') {
				let min = Infinity;

				for (let i = 0; i < c1_points.length; i++) {
					for (let j = 0; j < c2_points.length; j++) {
						let d = distance(point_data[c1_points[i]], point_data[c2_points[j]]);

						if (d < min) {
							min = d;
						}
					}
				}

				return min;
			} else if (linkage === 'COMPLETE') {
				let max = 0;

				for (let i = 0; i < c1_points.length; i++) {
					for (let j = 0; j < c2_points.length; j++) {
						let d = distance(point_data[c1_points[i]], point_data[c2_points[j]]);
						if (d > max) {
							max = d;
						}
					}
				}

				return max;
			} else if (linkage === 'AVERAGE') {
				let average = 0;

				for (let i = 0; i < c1_points.length; i++) {
					for (let j = 0; j < c2_points.length; j++) {
						let d = distance(point_data[c1_points[i]], point_data[c2_points[j]]);
						average = average + +d;
					}
					average /= c1_points.length * c2_points.length;
				}

				return average;
			}
		}

		function update_distance_matrix(c_id) {
			if (arguments.length === 0) {
				// intialization
				for (let i = 0; i < clusters.length; i++) {
					for (let j = 0; j <= i; j++) {
						let d = Infinity;

						if (i != j) d = distance(clusters[i].coordinates, clusters[j].coordinates);

						point_distance_matrix[i] = point_distance_matrix[i] || [];
						point_distance_matrix[j] = point_distance_matrix[j] || [];

						point_distance_matrix[i][j] = d;
						point_distance_matrix[j][i] = d;
					}
				}

				point_distance_matrix.forEach(function(line, i) {
					cluster_distance_matrix[i] = {};
					let min_link_distance = Infinity;

					line.forEach(function(element, j) {
						cluster_distance_matrix[i][j] = element;

						if (min_link_distance > element) {
							link_distance[i] = j;
							min_link_distance = element;
						}
					});
				});
			} else {
				// update
				for (let i = 0; i < clusters.length; i++) {
					let d = Infinity;

					if (typeof clusters[i] === 'undefined') {
						continue;
					}

					if (clusters[i].name != c_id) {
						d = cluster_link_distance(clusters[i], clusters[c_id]);
					}

					cluster_distance_matrix[c_id] = cluster_distance_matrix[c_id] || {};
					cluster_distance_matrix[c_id][clusters[i].name] = d;
					cluster_distance_matrix[clusters[i].name][c_id] = d;
				}
			}
		}

		function get_closest_clusters() {
			let min = Infinity;
			let c1_id;
			let c2_id;

			for (let i = 0; i < clusters.length; i++) {
				if (typeof clusters[i] === 'undefined') {
					continue;
				}

				let cluster_id = clusters[i].name;

				if (cluster_distance_matrix[cluster_id][link_distance[cluster_id]] < min) {
					min = cluster_distance_matrix[cluster_id][link_distance[cluster_id]];
					c2_id = link_distance[cluster_id];
					c1_id = cluster_id;
				}
			}
			return [c1_id, c2_id, min];
		}

		function remove_clusters(c1, c2) {
			delete clusters[c1];
			delete clusters[c2];
			delete link_distance[c1];
			delete link_distance[c2];
			delete cluster_distance_matrix[c1];
			delete cluster_distance_matrix[c2];

			let keys = Object.keys(cluster_distance_matrix);

			for (let i = 0; i < keys.length; i++) {
				if (typeof cluster_distance_matrix[i] !== 'undefined') {
					delete cluster_distance_matrix[i][c1];
					delete cluster_distance_matrix[i][c2];
				}
			}
		}

		function merge_clusters() {
			let to_merge = get_closest_clusters();

			let new_cluster = {
				name: clusters.length,
				size: clusters[to_merge[0]].size + clusters[to_merge[1]].size,
				children: [clusters[to_merge[0]], clusters[to_merge[1]]]
			};

			clusters[to_merge[0]].parent = new_cluster;
			clusters[to_merge[1]].parent = new_cluster;

			remove_clusters(to_merge[0], to_merge[1]);
			update_point_cluster_assignment(new_cluster.name, to_merge[0], to_merge[1]);

			let coordinates = compute_centroid(new_cluster.name);
			new_cluster.coordinates = coordinates;

			clusters.push(new_cluster);

			update_distance_matrix(new_cluster.name);
			update_next_link_index(to_merge[0], to_merge[1]);

			return new_cluster;
		}

		let core = function() {
			// main algorithm loop
			let num_clusters = point_data.length;

			init();
			update_distance_matrix();
			update_next_link_index();

			while (num_clusters > 1) {
				merge_clusters();
				num_clusters--;
			}

			return clusters;
		};

		core.leafNodes = function() {
			return leaf_nodes;
		};

		core.distance = function(fn) {
			if (arguments.length == 1) {
				if (typeof fn === 'string') {
					switch (fn) {
						case 'HAVERSINE':
							distance = haversine_distance;
							break;
						case 'EUCLIDEAN':
							distance = euclidean_distance;
							break;
						case 'MANHATTAN':
							distance = manhattan_distance;
							break;
						default:
							distance = euclidean_distance;
					}
				} else if (typeof fn === 'function') {
					distance = fn;
				}
			}

			return core;
		};

		core.linkage = function(l) {
			if (typeof l === 'string') {
				if (l === 'AVERAGE' || l === 'COMPLETE' || l === 'SINGLE') linkage = l;
			}
			return core;
		};

		core.data = function(data) {
			if (typeof data != undefined) {
				point_data = data;
			}
			return core;
		};

		return core;
	};

	return jHC;
});
