var express         = require('express');
var app             = express();
var path            = require('path');
var request         = require('request');
var http            = require('http');
var server          = http.createServer(app);
var router          = express.Router();
var bodyParser      = require("body-parser");
var cookieParser    = require("cookie-parser");
var cookieSession   = require("cookie-session");
var passport        = require("passport");
var session         = require('express-session')
var twitchStrategy  = require("passport-twitch").Strategy;
var connection      = require("./modules/connection.js")
var date            = new Date().toISOString().substr(0, 10)
var options         = require('./config.js')
var clientID        = options.identity.clientId
var secret          = options.identity.clientSecret
var redirect        = options.identity.redirectUrl
var io              = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({secret:"xd"}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/templates'));

passport.use(new twitchStrategy({
    clientID: clientID,
    clientSecret: secret,
    callbackURL: redirect,
    scope: [
        "user_read",
        "channel_subscriptions",
        "user_subscriptions"
    ]},
    function(accessToken, refreshToken, profile, done) {
        var acc = accessToken
        console.log("[DEBUG] " + profile.username + " logged into the website")
        var newLog = {type: "login", log: profile.username + " just logged into the website"}
        connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
        return done(null, profile.username);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.all('*', function(req, res, next) {
    res.locals.website = options.identity.websiteUrl
    res.locals.botName = options.identity.username
    res.locals.streamer = options.channels[0]
    if (req.user) {
        connection.query('select * from user where name = ?', req.user, function(err, result) {
            if (result == undefined || result[0] == undefined) {
                return
            } else {
                if (result[0].isMod == 1) {
                    res.locals.login = true,
                    res.locals.mod = true, 
                    res.locals.name = req.user
                } else {
                    res.locals.login = true,
                    res.locals.mod = false, 
                    res.locals.name = req.user
                }
            };
        });  
    } else {
        res.locals.login = false
    }
    next()
});

app.get('/', function(req, res) {
    var info = {
        url: 'https://api.twitch.tv/kraken/streams?channel=' + JSON.stringify(options.channels).slice(2, -2),
        headers: {
            'Client-ID': clientID
        }
    }
    request(info, function (error, response, body) {
        var base = JSON.parse(body).streams[0]
        if (base != undefined) {
            var streamid = base._id
            connection.query('select * from streaminfo where streamid = ?', streamid, function(err, result) {
                if (result[0] != undefined) {
                    res.render('index.html', {
                        status: 1,
                        game: base.game,
                        viewers: base.viewers,
                        title: base.channel.status
                    })
                } else {
                    res.render('index.html', {
                        status: 0
                    })
                }
            });
        } else {
            res.render('index.html', {
                status: 0
            })
        }
    });
})

app.get('/about', function(req, res) {
    connection.query('select * from streaminfo', function(err, result) {res.render('about.html')});
});

app.get('/support', function(req, res) {
    connection.query('select * from streaminfo', function(err, result) {res.render('support.html')});
});

app.get("/login", passport.authenticate("twitch", { failureRedirect: "/" }), function(req, res) {
    res.redirect('/user/' + req.user);
});

app.get('/logout', function(req, res) {
    req.logout();
    res.locals.login = null
    res.locals.mod = null
    res.locals.name = null
    res.redirect('/');
});

app.get('/user/:id', function(req, res) {
    connection.query('select * from user where name = ?', req.params.id, function(err, result) {
        if (result[0] == undefined) {
            res.render("error404.html");
        } else {
            var info = {
                url: 'https://api.twitch.tv/kraken/users/' + req.params.id,
                headers: {
                    'Client-ID': clientID
                }
            }
            request(info, function (error, response, body) {
                var getAge = JSON.stringify(new Date(JSON.parse(body).created_at)).substring(1, 20)
                var age = getAge.substring(0, 10) + " / " + getAge.substring(11, 20)
                var days = Math.round(Math.abs((new Date(JSON.parse(body).created_at).getTime() - new Date().getTime())/(24*60*60*1000)));
                request("https://api.rtainc.co/twitch/channels/" + options.channels[0] + "/followers/" + req.params.id + "?format=[2]", function (error, response, body) {
                    var fa = body
                    res.render('user.html', {
                        age: age,
                        days: days,
                        followAge: fa,
                        user: result[0].name,
                        points: result[0].points,
                        lines: result[0].num_lines
                    })
                })
            });
        };
    });
});

app.get('/user/:id/logs', function(req, res) {
    connection.query('select * from chatlogs where name = ?', req.params.id, function(err, result) {
        if (result[0] == undefined) {
            res.render("error404.html");
        } else {
            res.render('logs.html', { 
                log: result,
                name: result[0].name
            });
        };
    });
});

app.get('/commands', function(req, res) {
    connection.query('select * from commands', function(err, result) {res.render('commands.html')});
});

app.get('/clips', function(req, res) {
    connection.query('select * from streaminfo', function(err, result) {
        request({
            url: 'https://api.twitch.tv/kraken/clips/top?limit=5&channel=' + options.channels[0],
            headers: {
                "Accept": "application/vnd.twitchtv.v4+json",
                "Client-ID": clientID
            }
        }, function(err, res, body) {
            var info = JSON.parse(body)
            io.emit('sendClips', body)
        });
        res.render('clips.html')
    });
});

app.get('/history/:id', function(req, res) {
    connection.query('select * from songrequest where DATE_FORMAT(time,"%Y-%m-%d") = ?', req.params.id, function(err, result) {
        var songInfo = result
        if (result == undefined || result[0] == undefined) {
            res.render("history.html", {
                songInfo: false,
                listDate: req.params.id
            });
        } else {
            connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ? ORDER BY id LIMIT 1', req.params.id, function(err, result) {
                res.render('history.html', { 
                    currSong: result,
                    songInfo: songInfo,
                    listDate: req.params.id
                });
            })
        };
    });
});

app.get('/history', function(req, res) {
    res.redirect('/history/'+ date);
    res.render("history.html")
});

app.get('/admin', function(req, res) {
    connection.query('select * from streaminfo', function(err, result) {
        res.render('admin/home.html', {
            info: result
        })
    });
});

app.get('/admin/songlist', function(req, res) {
    connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', date, function(err,result){
        if (result == undefined || result[0] == undefined) {
            res.render('admin/songlist.html', {songs: false})
        }
        else{
            res.render('admin/songlist.html', {songs: true});
        }
    });
});

io.on('connection', function (socket) {
    socket.on('refreshData', function (data) {
        connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', date, function(err,result){
            socket.emit('pushSonglist', result);
        })
    })
    socket.on('endSong', function (data) {
        connection.query('update songrequest set playState = 1 where DATE_FORMAT(time,"%Y-%m-%d") = "' + date + '" AND songid = ?', data, function(err, result) {})
        socket.emit('nextSong');
    })
    socket.on('removeSong', function (data) {
        connection.query('update songrequest set playState = 2 where DATE_FORMAT(time,"%Y-%m-%d") = "' + date + '" AND songid = ?', data, function(err, result) {
            socket.emit('nextSong');
        })
    })
    socket.on('prevSong', function (data) {
        connection.query('select * from songrequest where playState = 1 AND DATE_FORMAT(time,"%Y-%m-%d") = ? ORDER BY id DESC LIMIT 1', date, function(err,result){
            if (result[0] != undefined) {
            connection.query('update songrequest set playState = 0 where songid = ?', result[0].songid, function(err, result) {})
            socket.emit('nextSong');
        }})
    })
    socket.on('disableModule', function(data) {
        connection.query('update module set state = 0 where moduleName = ?', data, function(err, result) {
            socket.emit('reload')
            console.log("Disabled module: " + data)
        })
    })
    socket.on('enableModule', function(data) {
        connection.query('update module set state = 1 where moduleName = ?', data, function(err, result) {
            socket.emit('reload')
            console.log("Enabled module: " + data)
        })
    })
})

app.get('/admin/logs', function(req, res) {
    connection.query('select * from adminlogs', function(err, result) {
        if (result[0] == undefined) {
            res.render("admin/adminlogs.html", {
                log: false
            });
        } else {
            res.render('admin/adminlogs.html', { 
                log: result
            });
        };
    });
});

app.get('/admin/logs/login', function(req, res) {
    connection.query('select * from adminlogs where type = "login"', function(err, result) {
        if (result[0] == undefined) {
            res.render("admin/adminlogs.html", {
                log: false
            });
        } else {
            res.render('admin/adminlogs.html', { 
                log: result
            });
        };
    });
});

app.get('/admin/logs/points', function(req, res) {
    connection.query('select * from adminlogs where type = "points"', function(err, result) {
        if (result[0] == undefined) {
            res.render("admin/adminlogs.html", {
                log: false
            });
        } else {
            res.render('admin/adminlogs.html', { 
                log: result
            });
        };
    });
});

app.get('/admin/logs/sub', function(req, res) {
    connection.query('select * from adminlogs where type = "sub" OR type = "resub"', function(err, result) {
        if (result[0] == undefined) {
            res.render("admin/adminlogs.html", {
                log: false
            });
        } else {
            res.render('admin/adminlogs.html', { 
                log: result
            });
        };
    });
});

app.get('/admin/logs/timeout', function(req, res) {
    connection.query('select * from adminlogs where type = "timeout" OR type = "ban"', function(err, result) {
        if (result[0] == undefined) {
            res.render("admin/adminlogs.html", {
                log: false
            });
        } else {
            res.render('admin/adminlogs.html', { 
                log: result
            });
        };
    });
});

app.get('/admin/modules', function(req, res) {
    connection.query('select * from module WHERE id != 15', function(err, result) {
        res.render('admin/modules.html', { 
            moduleList: result,
            website: options.identity.websiteUrl
        });
    });
});

app.get('/403', function(req, res) {
    connection.query('select * from streaminfo', function(err, result) {res.render('error403.html')});
});

app.all('*', function(req, res, next) {
    connection.query('select * from streaminfo', function(err, result) {res.render('error404.html')});
});

console.log("Started website")

server.listen(3000);