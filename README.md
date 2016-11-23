BookX
=====
> *An easy way to put your books up for trade with like minded individuals in a secure and private way!*
> -Joseph Livengood

----------

**User Stories**

 - As an authenticated user, I can add books to my library easily using only the ISBN.
 - All added books will be shown to all users with the cover, title, and some info.
 - Other users may request one of my books and I will be able to view their books to accept a trade or decline if they have none I want.
 - I will not have their private email shared unless a trade is accepted.
 - I can see a detailed history of my trades.
 - I can remove books from my library at any time.
 - My books will be removed if I accept a trade involving them so I don't recieve further requests- but while they are active I can recieve unlimited requests from different users for said book.

-----------

Install&Run

    npm install
    node server.js
    
    env 'db' = CONNECTION_STRING to MongoDB
	    (mongodb://admin:pass@URL)
    env 'emp' = smtp server password
    smtp login = app/auth/passwordless.js

Dependencies Used

    Node.js
    Express 4.14.0
    Express-Session 1.14.2
    Body-Parser 1.15.2
    Cookie-Parser 1.4.3
    Mongodb 2.2.11
    Emailjs 1.0.8
    Pug 2.0.0-Beta6
    Passwordless 1.1.2
    Passwordless-Mongostore 0.1.4

	Sass (compiler)
	Bootstrap 4.0.0-Alpha5 (css/js CDN used)
	Font-Awesome 4.3.0 (css CDN used)
	jQuery 3.1.1 (js CDN used)
	Tether 1.3.7 (js CDN used)
    
-----------

**Passwordless**

A token based login system. Users sign in with only their email. A token is emailed to them to click to be authenticated. Tokens can be single/multi use with different expiration options and lifetimes.
Edit the email contents/login in the passwordless init file app/auth/passwordless.js.

[Check them out](https://passwordless.net/)
*They support 2-factor, multiple token delivery options, and easy setup*

---------------------

