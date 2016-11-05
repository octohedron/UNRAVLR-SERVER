var http = require('http');
var express = require('express');
var api = require('instagram-node').instagram();

const CLIENT_ID = 'a596e9b67cdd4812bee1c23c568d5d75';
const CLIENT_SECRET = 'f08846e1a9b74ed9a352c86c6a3b6a2e';

var redirect_uri = 'http://localhost:5000/bot/handle_auth';

export const InstagramApi = {
    AuthorizeUser(req, res) {
        api.use({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET });
        return res.redirect(api.get_authorization_url(redirect_uri, {
            scope: ['basic', 'likes', 'public_content', 'follower_list', 'comments', 'relationships'],
            state: 'state' }
        ));
    },
    HandleAuth(req, res) {
        return api.authorize_user(req.query.code, redirect_uri, function(err, result) {
            if (err) {
                res.send(err.body);
            } else {
                res.send(result.access_token);
            }
        });
    },
    UserSelf(req, res) {
        api.use({ access_token: req.query.access_token });
        return api.user('self', function (err, result) {
            res.send(result);
        });
    }
};