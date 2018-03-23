# Express Facebook Auth

Opinionated authentication middleware for Express that uses Facebook. By being opinionated, this module is relatively straightforward to use, as far as authentication is concerned. In all honestly, I mostly created this module because I was getting tired of copy-pasting the same code over and over :-P

## Installation

```Bash
npm install express-facebook-auth
```
## Example usage

Let's start by creating a login page for our users called `login.pug`. This example uses the [Pug templating engine](https://pugjs.org/api/getting-started.html).

```Pug
doctype html
body
  div(id='fb-root')
  a(href='https://www.facebook.com/v2.10/dialog/oauth?client_id=' + facebookAppId + '&redirect_uri=' + redirectUri) Login with Facebook
```

Then, we create our express app:

```JavaScript
const { Authenticator } = require('express-facebook-auth');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'pug');

// Cookie parser is Needed by express-facebook-auth to pass the Facebook
// authentication token from the browser to this server
app.use(cookieParser());

// The login URI is used to specify the endpoint, relative to the `app` property
// passed to `authenticator.createLoginSuccessEndpoint` method
const loginUri = '/login';

// The redirect URI must be a fully qualified domain name, as this is passed to
// Facebook from the browser, which it then uses to redirect the browser on its own
const redirectUri = 'http://myserver.net/login-success/';

const authenticator = new Authenticator({
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,

  // This callback is used to determine if the given Facebook user is allowed to
  // access your system. By the time this method is called, the user has already
  // been authenticated against Facebook. For this example, let's just say all
  // Facebook users are registered with this server. In practice, you should have
  // this method query your own user database to associate the Facebook ID with your user
  isUserRegistered: (facebookId) => true,
  loginUri,
  redirectUri
});

// Render the login.pug file from above when a user navigates to http://myserver.net/login
app.get(loginUri, (req, res) => {
  res.render('login', {
    facebookAppId: process.env.FACEBOOK_APP_ID,
    redirectUri
  });
});

authenticator.createLoginSuccessEndpoint(app);

// The boolean value passed to createMiddleware indicates whether or not a failed
// login attempt should redirect back to `loginUri`, or return a 401 HTTP code. A
// good rule of thumb is to set this to `true` for page URLs, and `false` for API
// calls (i.e. XHR or Fetch calls)
app.get('/', authenticator.createMiddleware(true), (req, res) => {
  res.send('If you can see this, you are logged in!');
});

app.listen(3000, () => console.log('Example authenticated app listening on port 3000!'));
```

# License

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
