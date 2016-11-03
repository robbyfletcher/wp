var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var wallpaper = require('wallpaper');

var db = new sqlite3.Database('wp.db');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    if(res.headers['content-type'] === 'image/jpeg') {
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    }
  });
};

var intersect = function(a, b, key) {
	var atmp = a.map(function(e) {return e[key]; });
	var btmp = b.map(function(e) {return e[key]; });
	return atmp.filter(function(e) {return btmp.indexOf(e) != -1; });
 };

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
					if (!obj.link.endsWith('.jpg')) { obj.link += '.jpg' }
					arr.push(obj);
				}
			});

			db.run('CREATE TABLE IF NOT EXISTS wp (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, link TEXT, \
				UNIQUE(title, link))', function(err) {
				if (err) {
					console.error(err);
				}

				// var stmt = db.prepare('SELECT * FROM wp WHERE link = ($link)');
				var stmt = db.prepare('INSERT OR IGNORE INTO wp (title, link) VALUES ($title, $link)');

				arr.forEach(function (e, i) {
					stmt.run({
						$title: e.title,
						$link: e.link
					}, function (err, res) {
							if (err) {
								console.error(err);
							}
							if (this.changes) {
								download(e.link, 'wallpapers/' + this.lastID + '.jpeg', function(e) {});
							}
					});
				});
			});

			db.get('SELECT * FROM wp ORDER BY RANDOM() LIMIT 1', function(err, res) {
				if (err) {
					console.error(err);
				}
				wallpaper.set('wallpapers/' + res.id + '.jpeg').then(() => {
					console.log('Wallpaper Set: ' + res.title);
				});
			});
		}
	});