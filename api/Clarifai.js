var rp = require('request-promise');

const CLIENT_ID = 'Vy6fftQs9p_XB3FVn52nqaYWrs_VsZ1a525A3qIX'
const CLIENT_SECRET = 'PndsaiLPN8kkZPZ9POt-KqlFGerutKo9O6UZMTl7'
const TOKEN = 'VvTjfuwWuSolF49f8icRjF5fViXtlN'

var url = "https://api.clarifai.com/v1/tag"

export const ClarifaiApi = {
    GetTagsByUrl(req, res) {
		var options = {
		    uri: url,
		    qs: {
		        url: req.query.url
		    },
		    headers: {
		        'Authorization': 'Bearer ' + TOKEN
		    },
		    json: true
		};
		rp(options)
		.then(function (htmlString) {
			res.send(htmlString);
		})
		.catch(function (err) {
			console.log(err);
		});
	}
}
