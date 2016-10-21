// var schedule = require('node-schedule');

// var rule = new schedule.RecurrenceRule();

// rule.second = Array.from({length: 30}, (v, k) => k*2);

// var j = schedule.scheduleJob(rule, function() {
// 	console.log('2 SECONDS!\n');
// });

var request = require('request');
var cheerio = require('cheerio');

request('https://www.reddit.com/r/EarthPorn/search?q=1920x1080&sort=top&restrict_sr=on&t=all',
	function (error, response, body) {
		if (!error && response.statusCode == 200) {

			var $ = cheerio.load(body);
			var arr = new Array;
			$('.contents').children().each(function(i, elem) {
				if ($(this).find('.search-result-footer').text().includes('imgur')) {
					var obj = new Object;
					obj.title = $(this).find('.search-result-header').text();
					obj.link = $(this).find('.search-result-footer').text();
					arr.push(obj);
				}
			});
			console.log(arr);
		}
	});