#!/usr/bin/env node
console.log( "Hello!" );
const fs = require('fs');
const parse = require('csv-parse');
const util = require('util');

const oneDay = 24 * 60 * 60 * 1000;

var json1 = {};
json1['Regions'] = {};
json1['ItemTypes'] = {};

var json2 = {};

var json3 = {};

function processRow(row) {
	if (row != null && row[0] != null) {
		var region = row[0];
		var country = row[1];
		var item_type = row[2];
		var order_priority = row[4];
		var order_date = new Date(row[5]);
		var ship_date = new Date(row[7]);
		var ship_day_period = Math.round(Math.abs((order_date - ship_date) / oneDay));

		var total_revenue = parseFloat(row[11]);
		var total_cost = parseFloat(row[12]);
		var total_profit = parseFloat(row[13]);

		if (json1['Regions'][region] == null) {
			json1['Regions'][region] = {};
			json1['Regions'][region]['Total']= {};
			json1['Regions'][region]['Total']['Revenue'] = 0;
			json1['Regions'][region]['Total']['Cost'] = 0;
			json1['Regions'][region]['Total']['Profit'] = 0;
			json1['Regions'][region]['Countries']= {};
		}

		if (json1['Regions'][region]['Countries'][country] == null) {
			json1['Regions'][region]['Countries'][country] = {};
			json1['Regions'][region]['Countries'][country]['Total'] = {};
			json1['Regions'][region]['Countries'][country]['Total']['Revenue'] = 0;
			json1['Regions'][region]['Countries'][country]['Total']['Cost'] = 0;
			json1['Regions'][region]['Countries'][country]['Total']['Profit'] = 0;
			json1['Regions'][region]['Countries'][country]['ItemTypes'] = {};
		}

		if (json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type] == null) {
			json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type] = {};
			json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Revenue'] = 0;
			json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Cost'] = 0;
			json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Profit'] = 0;
		}

		if (json1['ItemTypes'][item_type] == null) {
			json1['ItemTypes'][item_type] = {};
			json1['ItemTypes'][item_type]['Revenue'] = 0;
			json1['ItemTypes'][item_type]['Cost'] = 0;
			json1['ItemTypes'][item_type]['Profit'] = 0;
		}

		json1['Regions'][region]['Total']['Revenue'] += total_revenue;
		json1['Regions'][region]['Total']['Cost'] += total_cost;
		json1['Regions'][region]['Total']['Profit'] += total_profit;
		
		json1['Regions'][region]['Countries'][country]['Total']['Revenue'] += total_revenue;
		json1['Regions'][region]['Countries'][country]['Total']['Cost'] += total_cost;
		json1['Regions'][region]['Countries'][country]['Total']['Profit'] += total_profit;

		json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Revenue'] += total_revenue;
		json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Cost'] += total_cost;
		json1['Regions'][region]['Countries'][country]['ItemTypes'][item_type]['Profit'] += total_profit;

		json1['ItemTypes'][item_type]['Revenue'] = total_revenue;
		json1['ItemTypes'][item_type]['Cost'] = total_cost;
		json1['ItemTypes'][item_type]['Profit'] = total_profit;

		if (json2[order_date.getFullYear()] == null) {
			json2[order_date.getFullYear()] = {};
		}
		if (json2[order_date.getFullYear()][order_date.getMonth()+1] == null) {
			json2[order_date.getFullYear()][order_date.getMonth()+1] = {};
		}
		if (json2[order_date.getFullYear()][order_date.getMonth()+1][order_priority] == null) {
			json2[order_date.getFullYear()][order_date.getMonth()+1][order_priority] = 0;
		}
		json2[order_date.getFullYear()][order_date.getMonth()+1][order_priority] += 1;

		if (json3[order_date.getFullYear()] == null) {
			json3[order_date.getFullYear()] = {};
		}
		if (json3[order_date.getFullYear()][order_date.getMonth()+1] == null) {
			json3[order_date.getFullYear()][order_date.getMonth()+1] = {};
			json3[order_date.getFullYear()][order_date.getMonth()+1]['TotalDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['AvgDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['NumberOfOrders'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'] = {};
		}
		if (json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region] == null) {
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region] = {};
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['TotalDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['AvgDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['NumberOfOrders'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'] = {};
		}
		if (json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country] == null) {
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country] = {};
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['TotalDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['AvgDaysToShip'] = 0;
			json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['NumberOfOrders'] = 0;
		}

		json3[order_date.getFullYear()][order_date.getMonth()+1]['TotalDaysToShip'] += ship_day_period;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['NumberOfOrders'] += 1;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['AvgDaysToShip'] = json3[order_date.getFullYear()][order_date.getMonth()+1]['TotalDaysToShip'] / json3[order_date.getFullYear()][order_date.getMonth()+1]['NumberOfOrders'];

		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['TotalDaysToShip'] = ship_day_period;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['NumberOfOrders'] += 1;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['AvgDaysToShip'] = json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['TotalDaysToShip'] / json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['NumberOfOrders'];

		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['TotalDaysToShip'] = ship_day_period;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['NumberOfOrders'] += 1;
		json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['AvgDaysToShip'] = json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['TotalDaysToShip'] / json3[order_date.getFullYear()][order_date.getMonth()+1]['Regions'][region]['Countries'][country]['NumberOfOrders'];
	}
}

var parser = parse({delimiter: ','}, async function(err, data){
	for (var i=2; i< data.length + 1; i++) {
		await processRow(data[i]);
	}
	await writeJSON('json1.json', json1);
	await writeJSON('json2.json', json2);
	await writeJSON('json3.json', json3);
});

async function writeJSON (filename, json) {
	console.log(util.inspect(json, false, null, true));
	fs.writeFile(filename, JSON.stringify(json), 'utf8', function(err) {
    	if (err) throw err;
    	console.log('Written to ' + filename);
    	}
	);

}

fs.createReadStream(__dirname+'/node-data-processing-medium-data.csv').pipe(parser);
