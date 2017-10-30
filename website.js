module.exports = {
connect: function() {
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
var func            = require("./modules/functions.js")
var options         = require('./config.js')
var clientID        = options.identity.clientId
var secret          = options.identity.clientSecret
var redirect        = options.identity.redirectUrl
var io              = require('socket.io')(server);
var connect         = require('./app.js')
var bot             = connect.bot
var cio             = require('socket.io-client');
var port            = options.identity.port
var clr             = cio.connect('http://localhost:' + (port + 1));
var sr              = cio.connect('http://localhost:' + (port + 2));
var Twitter         = require('twitter');

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
    "user_subscriptions",
    "channel_editor"
  ]},
  function(accessToken, refreshToken, profile, done) {
    var acc = accessToken
    func.connection.query('update user set accToken = ? where name = "'+profile.username+'"', acc, function (err, result) {if (err) {console.log(err)}})
    console.log("[DEBUG] " + profile.username + " logged into the website")
    var newLog = {type: "login", log: profile.username + " just logged into the website"}
    func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
    return done(null, profile.username);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

clr.on("message", function(data) {
  io.emit('message', { "message": data.message, "user": data.user })
})
clr.on("emote", function(data) {
  io.emit('emote', { "url": data.url, "emote": data.emote })
})
clr.on("sound", function(data) {
  io.emit('sound', { "sound": data.sound, "url": data.url })
})
clr.on("gif", function(data) {
  io.emit('gif', { "gif": data.gif, "url": data.url })
})
clr.on("meme", function(data) {
  io.emit('meme', { "meme": data.meme})
})
clr.on("chatEmote", function(data) {
  io.emit('chatEmote', { "emote": data.url })
})
sr.on("skipSong", function(data) {
  io.emit('nextSong');
})
sr.on("setVolume", function(data) {
  io.emit("setVolume", {"volume": data.volume})
})
sr.on("getVolumeComm", function() {
  io.emit("getVolume")
})

io.on('connection', function (socket) {
  socket.on('restartBot', function (data) {
    bot.say(JSON.stringify(options.channels).slice(2, -2), "Restarting bot MrDestructoid");
    bot.disconnect();
    process.exit(1);
  })
  socket.on("returnVolume", function(data) {
    bot.say(JSON.stringify(options.channels).slice(2, -2), "The current volume is: " + data.volume)
  })
  socket.on('refreshData', function (data) {
    func.connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', new Date().toISOString().substr(0, 10), function(err,result){
      socket.emit('pushSonglist', result);
    })
  })
  socket.on('updateModule', function (data) {
    for (item in data) {
      var id = data[item].id
      var value = data[item].value
      func.connection.query('update modulesettings set value = "'+value+'" where settingName = ?', id, function(err, result) {})
    }
    socket.emit("success")
  })
  socket.on('buyCLR', function (data) {
    func.connection.query('select * from user where name = "'+data.user+'"', function(err,result){
      var points = result[0].points
      if (points >= 1000) {
        if (data.type == "sound") {
          function clrS() {io.emit('sound', {"sound": data.item, "url": data.url }); bot.whisper(data.user, "Succesfully played your sound " + data.item);}
          func.pointCd("CLR_Sound_Web", global, data.user, 10, clrS, 1000)
          socket.emit("success")
        }
        else if (data.type == "gif") {
          function clrG() {io.emit('gif', {"gif": data.item, "url": data.url}); bot.whisper(data.user, "Succesfully showed your gif " + data.item);}
          func.pointCd("CLR_GIF_Web", global, data.user, 10, clrG, 1000)
          socket.emit("success")
        } else {
          socket.emit("failure")
        }
      } else {
        socket.emit("failure")
      }
    })
  })
  socket.on('meme', function (data) {
    func.connection.query('select * from clr where type = "meme"', function(err,result){
      var length = result.length
      var ranN = Math.floor(Math.random() * length)
      io.emit('meme', {"meme": result[ranN].url});
    })
  })
  socket.on('forceSound', function (data) {
    func.connection.query('select * from clr where name = ?', data.name, function(err,result){
      io.emit('sound', {"sound": result[0].name, "url": result[0].url });
    })
  })
  socket.on('forceMeme', function (data) {
    func.connection.query('select * from clr where name = ?', data.name, function(err,result){
      io.emit('meme', {"meme": result[0].url});
    })
  })
  socket.on('removeCLR', function (data) {
    func.connection.query('delete from clr where id = ?', data.id, function(err, result) {})
  })
  socket.on('addSample', function (data) {
    func.connection.query('insert into clr set ?', data, function (err, result) {})
  })
  socket.on('endSong', function (data) {
    func.connection.query('update songrequest set playState = 1 where DATE_FORMAT(time,"%Y-%m-%d") = "' + new Date().toISOString().substr(0, 10) + '" AND songid = ?', data, function(err, result) {})
    socket.emit('nextSong');
  })
  socket.on('removeSong', function (data) {
    func.connection.query('delete from songrequest where DATE_FORMAT(time,"%Y-%m-%d") = "' + new Date().toISOString().substr(0, 10) + '" AND songid = ?', data, function(err, result) {})
  })
  socket.on('prevSong', function (data) {
    func.connection.query('select * from songrequest where playState = 1 AND DATE_FORMAT(time,"%Y-%m-%d") = ? ORDER BY id DESC LIMIT 1', new Date().toISOString().substr(0, 10), function(err,result){
      if (result[0] != undefined) {
      func.connection.query('update songrequest set playState = 0 where songid = ?', result[0].songid, function(err, result) {})
      func.connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', new Date().toISOString().substr(0, 10), function(err,result){
        socket.emit('prevSongInfo', result);
      })
    }})
  })
  socket.on('createPoll', function (data) {
    func.connection.query('insert into pollquestions set question = ?', data.question, function(err, result) {
      var pollId = result.insertId
      var answers = JSON.parse(data.answers)
      for (x = 0; x < answers.length; x++) {
        var pushTo = {
          pollId: pollId,
          answers: answers[x]
        }
        func.connection.query('insert into pollanswers set ?', pushTo, function(err, result) {})
      }
    })
  })
  socket.on('getPoll', function (data) {
    func.connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', data, function(err, result) {
      socket.emit('pollData', {data: result})
    })
  })
  socket.on('addResult', function (data) {
    data.ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    func.connection.query('insert into pollvoted set ?', data, function(err,result){})
  })
  socket.on('retPollRes', function (data) {
    func.connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', data, function(err, result) {
      var answers = result
      func.connection.query('SELECT * FROM pollvoted where pollId = ?', data, function(err, result) {
        var res = new Array;
        for (x = 0; x < answers.length; x++) {
          res.push({
            answer: answers[x].answers,
            id: answers[x].id,
            votes: 0
          })
        }
        var results = result.map(function(a) {return a.answerId;})
        var ids = res.map(function(a) {return parseInt(a.id)})
        for (x = 0; x < results.length; x++) {
          a = parseInt(results[x])
          b = ids.indexOf(a)
          res[b].votes += 1
        }
        socket.emit('pollRes', {data: res})
      });
    });
  })
  socket.on('remPoll', function (data) {
    func.connection.query('delete from pollquestions where id = ?', data, function(err, result) {})
    func.connection.query('delete from pollanswers where pollId = ?', data, function(err, result) {})
    func.connection.query('delete from pollvoted where pollId = ?', data, function(err, result) {})
  })
  socket.on('removeComm', function (data) {
    func.connection.query('delete from commands where commName = ?', data, function(err, result) {})
  })
  socket.on('addCom', function (data) {
    func.connection.query('insert into commands set ?', data, function (err, result) {})
  })
  socket.on('updateComm', function(data) {
    func.connection.query('update commands set commName = "' + data.commName + '", response = "' + data.response + '", level = "' + data.level + '",\
    cdType = "' + data.cdType + '", cd = "' + data.cd + '", points = "' + data.points + '" where commName = "' + data.commName + '"', function(err, result) {})
  })
  socket.on('addTimer', function (data) {
    func.connection.query('select * from timers where name = ?', data.name, function (err, result) {
      if(result[0]) {
        func.connection.query('delete from timers where name = ?', data.name, function(err, result) {})
        func.connection.query('insert into timers set ?', data, function (err, result) {})
      } else {
        func.connection.query('insert into timers set ?', data, function (err, result) {})
      }
    })
  })
  socket.on('remTimer', function (data) {
    func.connection.query('delete from timers where name = ?', data, function(err, result) {})
  })
  socket.on('disableModule', function(data) {
    func.connection.query('update module set state = 0 where moduleName = ?', data, function(err, result) {
      socket.emit('reload')
      console.log("Disabled module: " + data)
    })
  })
  socket.on('enableModule', function(data) {
    func.connection.query('update module set state = 1 where moduleName = ?', data, function(err, result) {
      socket.emit('reload')
      console.log("Enabled module: " + data)
    })
  })
  socket.on('updateStatus', function(data) {
    func.connection.query('select * from user where name = ?', JSON.stringify(options.channels).slice(3, -2), function(err, result) {
      request({
        url: 'https://api.twitch.tv/kraken/channels/' + result[0].userId,
        headers: {
          'Client-ID': clientID,
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Authorization': 'OAuth ' + result[0].accToken
        },
        method: 'PUT',
        json: {
          "channel": {
            "status": data.title,
            "game": data.game
          }
        }
      })
    })
  })
})

app.all('*', function(req, res, next) {
  res.locals.website = options.identity.websiteUrl
  res.locals.botName = options.identity.username
  res.locals.streamer = options.channels[0].substring(1)
  if (req.user) {
    func.connection.query('select * from user where name = ?', req.user, function(err, result) {
      if (result == undefined || result[0] == undefined) {
        return
      } else {
        if (result[0].isMod == 1) {
          res.locals.login = true,
          res.locals.mod = true,
          res.locals.name = req.user
          res.locals.prof_points = result[0].points
          res.locals.num_lines = result[0].num_lines
          res.locals.profile_pic = result[0].profile_pic
        } else {
          res.locals.login = true,
          res.locals.mod = false,
          res.locals.name = req.user
          res.locals.prof_points = result[0].points
          res.locals.num_lines = result[0].num_lines
          res.locals.profile_pic = result[0].profile_pic
        }
      };
    });
  } else {
    res.locals.login = false,
    res.locals.mod = false
  }
  next()
});

app.get('/', function(req, res) {
  var info1 = {
    url: 'https://api.twitch.tv/kraken/users/' + JSON.stringify(options.channels).slice(3, -2),
    headers: {
      'Client-ID': clientID
    }
  }
  var info2 = {
    url: 'https://api.twitch.tv/kraken/streams/' + JSON.stringify(options.channels).slice(3, -2),
    headers: {
      'Client-ID': clientID
    }
  }
  request(info2, function (error, response, body) {
    if (JSON.parse(body).stream != undefined) {
      var base = JSON.parse(body).stream
      var streamid = base._id
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
})

app.get('/about', function(req, res) {
  func.connection.query('select * from user', function(err, result) {res.render('about.html')});
});

app.get('/clr', function(req, res) {
  func.connection.query('select * from commands where commName = ?', "!clr", function(err, result) {
    res.render('clr.html')
  });
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

app.use('/user/:id', function(req, res) {
  func.connection.query('select * from user INNER JOIN userstats ON user.userId = userstats.userId where user.name = ?', req.params.id , function(err, userO) {
  func.connection.query('select * from user order by points DESC', function(err, points) {
  func.connection.query('select * from user order by xp DESC', function(err, xp) {
  func.connection.query('select * from user order by num_lines DESC', function(err, lines) {
  func.connection.query('select * from user order by timeOnline DESC', function(err, timeOnline) {
  func.connection.query('select * from user order by timeOffline DESC', function(err, timeOffline) {
    var pointIndex;
    var xpIndex;
    var linesIndex;
    var timeOnlineIndex;
    var timeOfflineIndex;
    for(var i = 0; i < points.length; i++) {
      if(points[i]["name"] === req.params.id.toLowerCase()) {
        pointIndex = i + 1
      }
    }
    for(var i = 0; i < xp.length; i++) {
      if(xp[i]["name"] === req.params.id.toLowerCase()) {
        xpIndex = i + 1
      }
    }
    for(var i = 0; i < lines.length; i++) {
      if(lines[i]["name"] === req.params.id.toLowerCase()) {
        linesIndex = i + 1
      }
    }
    for(var i = 0; i < timeOnline.length; i++) {
      if(timeOnline[i]["name"] === req.params.id.toLowerCase()) {
        timeOnlineIndex = i + 1
      }
    }
    for(var i = 0; i < timeOffline.length; i++) {
      if(timeOffline[i]["name"] === req.params.id.toLowerCase()) {
        timeOfflineIndex = i + 1
      }
    }
    var info = {
      url: 'https://api.twitch.tv/kraken/users/' + req.params.id,
      headers: {
        'Client-ID': clientID
      }
    }
    request(info, function (error, response, body) {
      var reqBody = JSON.parse(body)
      var userPf = reqBody.logo
      func.connection.query('update user set profile_pic = "' + userPf + '" where name = ?', reqBody.name, function(err, result) {})
      var getAge = JSON.stringify(new Date(reqBody.created_at)).substring(1, 20)
      var age = getAge.substring(0, 10) + " / " + getAge.substring(11, 20)
      var days = Math.round(Math.abs((new Date(reqBody.created_at).getTime() - new Date().getTime())/(24*60*60*1000)));
      var url = req.originalUrl
      if (url.split("/")[3] != undefined) {res.locals.logDate = url.split("/")[3]} else {res.locals.logDate = new Date().toISOString().substr(0, 10)}
      request("http://api.yucibot.nl/followage/" + req.params.id + "/" + options.channels[0].substring(1), function (error, response, body) {
        if (userO[0] == undefined) {
          res.render('user.html', {
            age: age,
            days: days,
            followAge: body,
            level: 0,
            perc: 0,
            xp: 0,
            user: reqBody.name,
            points: 0,
            lines: 0,
            online: 0,
            offline: 0,
            profile_pic_page: userPf,
            log: null,
            date: res.locals.logDate,
            pointIndex: 0,
            xpIndex: 0,
            linesIndex: 0,
            timeOnlineIndex: 0,
            timeOfflineIndex: 0,
            slotWin: 0,
            slotLoss: 0,
            slotProfit: 0,
            roulWin: 0,
            roulLoss: 0,
            roulProfit: 0,
            dungWin: 0,
            dungProfit: 0
          });
        } else {
          func.connection.query('select * from chatlogs where userId = ?', userO[0].userId, function(err, result) {
            var userObj = userO[0]
            var level = Math.ceil(userObj.xp / 100)
            var perc = Math.ceil(String(userObj.xp).slice(-2))
            var onH = Math.floor(userObj.timeOnline / 60);
            var offH = Math.floor(userObj.timeOffline / 60);
            var onM = Math.floor(userObj.timeOnline % 60);
            var offM = Math.floor(userObj.timeOffline % 60);
            var timeOnline = (onH > 0 ? onH + " hours " + (onM < 10 ? "0" : "") : "") + onM + " minutes"
            var timeOffline = (offH > 0 ? offH + " hours " + (offM < 10 ? "0" : "") : "") + offM + " minutes"
            res.render('user.html', {
              age: age,
              days: days,
              followAge: body,
              level: level,
              perc: perc,
              xp: userObj.xp,
              user: userObj.name,
              points: userObj.points,
              lines: userObj.num_lines,
              online: timeOnline,
              offline: timeOffline,
              profile_pic_page: userPf,
              log: result,
              date: res.locals.logDate,
              pointIndex: pointIndex,
              xpIndex: xpIndex,
              linesIndex: linesIndex,
              timeOnlineIndex: timeOnlineIndex,
              timeOfflineIndex: timeOfflineIndex,
              slotWin: userObj.slotWin,
              slotLoss: userObj.slotLoss,
              slotProfit: userObj.slotProfit,
              roulWin: userObj.roulWin,
              roulLoss: userObj.roulLoss,
              roulProfit: userObj.roulProfit,
              dungWin: userObj.dungWin,
              dungProfit: userObj.dungProfit
            });
          });
        }
      });
    });
  });});});});});});
});

app.get('/commands', function(req, res) {
  func.connection.query('select * from commands ORDER BY level', function(err, result) {
    res.render('commands.html', {
      commands: result
    })
  });
});

app.get('/commands/clr', function(req, res) {
  func.connection.query('select * from clr', function(err, result) {
    res.render('clrInfo.html', {
      clr: result
    })
  });
});

app.get('/stats', function(req, res) {
  func.connection.query('select * from user', function(err, result) {
    request({
      url: 'https://api.twitch.tv/kraken/clips/top?limit=5&channel=' + options.channels[0].substring(1),
      headers: {
        "Accept": "application/vnd.twitchtv.v4+json",
        "Client-ID": clientID
      }
    }, function(err, res, body) {
      var info = JSON.parse(body)
      io.emit('sendClips', body)
    });
    func.connection.query('select * from chatlogs', function(err, result) {
      var numLines = result.length
      func.connection.query('select * from user ORDER BY points DESC', function(err, result) {
        var user = result.length
        var toppoints = result
        func.connection.query('select * from user ORDER BY num_lines DESC', function(err, result) {
          var toplines = result
          func.connection.query('select * from user ORDER BY timeOnline DESC', function(err, result) {
            var toponline = result
            func.connection.query('select * from user ORDER BY timeOffline DESC', function(err, result) {
              var topoffline = result
              func.connection.query('SELECT * FROM emotestats INNER JOIN emotes ON emotestats.id = emotes.emoteId ORDER BY emotestats.uses DESC LIMIT 5', function(err, result) {
                var topemotes = result
                func.connection.query('select title from songrequest', function(err, result) {
                  var songrequest = result.length
                  func.connection.query('select type from adminlogs', function(err, result) {
                    var types = result.map(function(a) {return a.type;})
                    var timeouts = types.filter(function(b) {return b == "timeout"});
                    var bans = types.filter(function(b) {return b == "ban"});
                    var allTimeouts = timeouts.length;
                    var allBans = bans.length;
                    res.render('stats.html', {
                      lines: numLines,
                      user: user,
                      songrequest: songrequest,
                      timeout: allTimeouts,
                      ban: allBans,
                      toppoints: toppoints,
                      toplines: toplines,
                      topemotes: topemotes,
                      toponline: toponline,
                      topoffline: topoffline
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get('/stats/emotes', function(req, res) {
  func.connection.query('SELECT * FROM emotestats INNER JOIN emotes ON emotestats.id = emotes.emoteId ORDER BY emotestats.uses DESC', function(err, result) {
    res.render('emotestats.html', { emotes: result });
  })
})

app.get('/history/:id', function(req, res) {
  func.connection.query('select * from songrequest WHERE DATE_FORMAT(time,"%Y-%m-%d") = ?', req.params.id, function(err, result) {
    var songInfo = result
    if (result == undefined || result[0] == undefined) {
      res.render("history.html", {
        currSong: [{"title": "The songlist has finished"}],
        songInfo: false,
        listDate: req.params.id
      });
    } else {
      func.connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ? ORDER BY id LIMIT 1', req.params.id, function(err, result) {
        if (result == undefined || result[0] == undefined) {
          res.render('history.html', {
            currSong: [{"title": "The songlist has finished"}],
            songInfo: songInfo,
            listDate: req.params.id
          });
        } else {
          res.render('history.html', {
            currSong: result,
            songInfo: songInfo,
            listDate: req.params.id
          });
        }
      })
    };
  });
});

app.get('/history', function(req, res) {
  res.redirect('/history/'+ new Date().toISOString().substr(0, 10));
});

app.get('/poll', function(req, res) {
  func.connection.query('select * from pollquestions ORDER BY id DESC LIMIT 1', function(err, result) {
    if(result[0] != undefined) {
      res.redirect('/poll/' + result[0].id)
    } else {
      res.render('error404.html')
    }
  });
});

app.get('/poll/:id', function(req, res) {
  func.connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', req.params.id, function(err, result) {
    var data = result
    func.connection.query('SELECT ip FROM pollvoted where pollId = ?', req.params.id, function(err, result) {
      var ips = result.map(function(a) {return a.ip;})
      var localIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      res.render('poll.html', {
        data: data,
        voted: ips,
        localIp: localIp
      })
    })
  })
})

app.get('/poll/:id/result', function(req, res) {
  func.connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', req.params.id, function(err, result) {
    if(result[0] != undefined) {
    var question = result[0].question
    var answers = result.map(function(a) {return a.answers;})
    func.connection.query('SELECT * FROM pollvoted where pollId = ?', req.params.id, function(err, result) {
      var voteRes = result.map(function(a) {return a.answerId;})
      res.render('pollResult.html', {
        question: question,
        answers: answers,
        voted: voteRes
      })
    })
  } else {
    res.render('pollResult.html', {
      question: undefined
    })
  }
  });
});

app.get('/quotes', function(req, res) {
  func.connection.query('select * from quotes', function(err, result) {
    if(result[0] != undefined) {
      res.render('quotes.html', {
        quotes: result
      })
    } else {
      res.render('quotes.html', {
        quotes: null
      })
    }
  });
});

app.get('/admin', function(req, res) {
  var tweetArr = new Array;
  var followArr = new Array;
  function getMentions() {
    var client = new Twitter({
      consumer_key: options.apiKeys.twitter_consumer_key,
      consumer_secret: options.apiKeys.twitter_consumer_secret,
      access_token_key: options.apiKeys.twitter_access_token_key,
      access_token_secret: options.apiKeys.twitter_access_token_secret
    });
    client.get('statuses/mentions_timeline', {count: 20}, function(error, tweets, response) {
      for(key in tweets) {
        var tweet = tweets[key].text
        var user = tweets[key].user.screen_name
        var toArr = {"tweet": tweet, "user": user}
        tweetArr.push(toArr)
      }
    });
  }
  func.connection.query('select * from user where name = ?', JSON.stringify(options.channels).slice(3, -2), function(err, result) {
    if(res.locals.mod != true) {
      res.render('error403.html');
    } else {
      var info = {
        url: 'https://api.twitch.tv/kraken/streams/' + result[0].userId,
        headers: {
          'Client-ID': clientID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      }
      var info2 = {
        url: 'https://api.twitch.tv/kraken/channels/' + result[0].userId,
        headers: {
          'Client-ID': clientID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      }
      request(info, function (error, response, body) {
        getMentions()
        var follow = {
          url: 'https://api.twitch.tv/kraken/channels/' + options.channels[0].substring(1) + '/follows',
          headers: {
            'Client-ID': clientID,
            'Accept': 'application/vnd.twitchtv.v3+json'
          }
        }
        request(follow, function (error, response, body) {
          var base = JSON.parse(body).follows
          for (key in base) {
            var user = base[key].user.display_name
            var since = base[key].created_at
            var toPush = {"time": since, "user": user}
            followArr.push(toPush)
          }
          if (JSON.parse(body).stream != undefined) {
            var base = JSON.parse(body).stream
            res.render('admin/home.html', {
              status: "ONLINE",
              game: base.game,
              viewers: base.viewers,
              title: base.channel.status,
              streamer: base.channel.name,
              views: base.channel.views,
              followers: base.channel.followers,
              tweets: tweetArr,
              newFollowers: followArr
            })
          } else {
            request(info2, function (error, response, body) {
              var base = JSON.parse(body)
              res.render('admin/home.html', {
                status: "OFFLINE",
                game: base.game,
                viewers: 0,
                title: base.status,
                streamer: base.name,
                views: base.views,
                followers: base.followers,
                tweets: tweetArr,
                newFollowers: followArr
              })
            })
          }
        })
      });
    }
  });
});

app.get('/admin/*', function(req, res, next) {
  func.connection.query('SELECT * FROM user', function(err, result) {
    if(res.locals.mod != true) {
      res.render('error403.html');
    } else {
      next()
    }
  })
})

app.get('/admin/clr', function(req, res) {
  func.connection.query('SELECT * FROM clr', function(err, result) {
    res.render('admin/clrAdmin.html', {
      clr: result
    })
  })
})

app.get('/admin/poll', function(req, res) {
  func.connection.query('SELECT * FROM pollquestions', function(err, result) {
    res.render('admin/poll.html', {
      polls: result
    })
  })
})

app.get('/admin/poll/create', function(req, res) {
  func.connection.query('select * from pollquestions', function(err, result) {
    res.render('admin/pollCreate.html')
  });
});

app.get('/admin/songlist', function(req, res) {
  func.connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', new Date().toISOString().substr(0, 10), function(err,result){
    func.connection.query('select * from modulesettings where moduleType = "songrequest"', function(err, modSet) {
      if (result == undefined || result[0] == undefined) {
        res.render('admin/songlist.html', {songs: false, srMaxLength: 0})
      }
      else{
        res.render('admin/songlist.html', {songs: true, srMaxLength: modSet[2].value});
      }
    });
  });
});

app.get('/admin/logs', function(req, res) {
  func.connection.query('select * from adminlogs LIMIT 100', function(err, result) {
    if (result[0] == undefined) {
      res.render("admin/adminlogs.html", {
        log: false,
        date: new Date().toISOString().substr(0, 10),
        type: undefined
      });
    } else {
      res.render('admin/adminlogs.html', {
        log: result,
        date: new Date().toISOString().substr(0, 10),
        type: "all"
      });
    };
  });
});

app.get('/admin/logs/:page/', function(req, res) {
  func.connection.query('select * from adminlogs where type = ?', req.params.page, function(err, result) {
    if (result[0] == undefined) {
      res.render("admin/adminlogs.html", {
        log: false,
        date: new Date().toISOString().substr(0, 10),
        type: undefined
      });
    } else {
      res.render('admin/adminlogs.html', {
        log: result,
        date: new Date().toISOString().substr(0, 10),
        type: req.params.page
      });
    };
  });
});

app.get('/admin/modules', function(req, res) {
  func.connection.query('select * from module WHERE id != 1 AND type = "main"', function(err, result) {
    res.render('admin/modules.html', {
      moduleList: result,
      website: options.identity.websiteUrl
    });
  });
});

app.get('/admin/modules/:page/', function(req, res) {
  func.connection.query('select * from module WHERE type = ?', req.params.page, function(err, result) {
    res.render('admin/moduleSettings.html', {
      moduleInfo: result,
      isSub: false
    });
  });
});

app.get('/admin/modules/:page/:id', function(req, res) {
  func.connection.query('select * from module WHERE type = ?', req.params.page, function(err, result) {
    var specArr = ["songrequest", "roulette", "slot", "dungeon", "updatePoints", "subNotif", "linkMod", "clrComm", "clrSub"]
    var type = req.params.id
    if (type.indexOf(specArr)) {
      func.connection.query('select * from modulesettings WHERE moduleType = ?', req.params.id, function(err, result) {
        res.render('admin/moduleSettings.html', {
          moduleInfo: result,
          type: type,
          isSub: true
        });
      });
    } else {
      res.render('admin/moduleSettings.html', {
        moduleInfo: result,
        type: type,
        isSub: false
      });
    }
  });
});

app.get('/admin/commands', function(req, res) {
  func.connection.query('select * from commands where response IS NOT NULL ORDER BY level', function(err, result) {
    res.render('admin/commands.html', {
      commands: result
    })
  });
});

app.get('/admin/timers', function(req, res) {
  func.connection.query('select * from timers', function(err, result) {
    res.render('admin/timers.html', {
      timers: result
    })
  });
});

app.get('/admin/commands/create', function(req, res) {
  func.connection.query('select * from commands', function(err, result) {res.render('admin/addCommand.html')});
});

app.get('/admin/commands/edit/:id', function(req, res) {
  var id = req.params.id
  func.connection.query('select * from commands where response IS NOT NULL AND commName = ?', id, function(err, result) {
    res.render('admin/editCommand.html', {
      commands: result
    })
  });
});

app.get('/403', function(req, res) {
  func.connection.query('select * from user', function(err, result) {res.render('error403.html')});
});

app.all('*', function(req, res, next) {
  func.connection.query('select * from user', function(err, result) {res.render('error404.html')});
});

console.log("[DEBUG] Started website")

server.listen(port);

}}