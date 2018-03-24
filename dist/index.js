"use strict";
/*
MIT License

Copyright (c) 2018 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const url_1 = require("url");
const states = new WeakMap();
class Authenticator {
    constructor(opt) {
        states.set(this, opt);
    }
    createLoginSuccessEndpoint(app) {
        const { facebookAppId, facebookAppSecret, loginUri, redirectUri } = states.get(this);
        const redirectUriPath = url_1.parse(redirectUri).path;
        if (!redirectUriPath) {
            throw new Error(`Could not extract the path from the redirect URI ${redirectUri}`);
        }
        app.get(redirectUriPath, (req, res) => {
            if (req.query.code) {
                const verifyUrl = `https://graph.facebook.com/v2.10/oauth/access_token?` +
                    `client_id=${facebookAppId}` +
                    `&redirect_uri=${redirectUri}` +
                    `&client_secret=${facebookAppSecret}` +
                    `&code=${req.query.code}`;
                request(verifyUrl, (err, verifyRes, body) => {
                    try {
                        const parsedBody = JSON.parse(body);
                        res.cookie('accessToken', parsedBody.access_token);
                        res.redirect('/');
                    }
                    catch (e) {
                        res.sendStatus(500);
                    }
                });
            }
            else if (req.query.token) {
                res.cookie('accessToken', req.query.token);
                res.redirect('/');
            }
            else {
                res.redirect(loginUri);
            }
        });
    }
    createMiddleware(redirect) {
        const { facebookAppId, facebookAppSecret, loginUri, isUserRegistered } = states.get(this);
        return (req, res, next) => {
            const handleUnauthorized = () => {
                if (redirect) {
                    res.redirect(loginUri);
                }
                else {
                    res.sendStatus(401);
                }
            };
            const accessToken = req.cookies.accessToken;
            if (!accessToken) {
                handleUnauthorized();
                return;
            }
            const connectionUrl = 'https://graph.facebook.com/debug_token?' +
                `input_token=${accessToken}&` +
                `access_token=${facebookAppId}|${facebookAppSecret}`;
            request(connectionUrl, (err, verifyRes, body) => {
                try {
                    const parsedBody = JSON.parse(body).data;
                    if (!parsedBody.is_valid) {
                        handleUnauthorized();
                    }
                    else {
                        if (!isUserRegistered(parsedBody.user_id)) {
                            res.sendStatus(403);
                        }
                        else {
                            req.userId = parsedBody.user_id;
                            next();
                        }
                    }
                }
                catch (e) {
                    res.sendStatus(500);
                }
            });
        };
    }
}
exports.Authenticator = Authenticator;
//# sourceMappingURL=index.js.map