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
  socket.on('createPoll', function (data) {
    connection.query('insert into pollquestions set question = ?', data.question, function(err, result) {
      var pollId = result.insertId
      var answers = JSON.parse(data.answers)
      for (x = 0; x < answers.length; x++) {
        var pushTo = {
          pollId: pollId,
          answers: answers[x]
        }
        connection.query('insert into pollanswers set ?', pushTo, function(err, result) {})
      }
    })
  })
  socket.on('getPoll', function (data) {
    connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', data, function(err, result) {
      socket.emit('pollData', {data: result})
    })
  })
  socket.on('addResult', function (data) {
    data.ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    connection.query('insert into pollvoted set ?', data, function(err,result){})
  })
  socket.on('retPollRes', function (data) {
    connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', data, function(err, result) {
      var answers = result
      connection.query('SELECT * FROM pollvoted where pollId = ?', data, function(err, result) {
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
    connection.query('delete from pollquestions where id = ?', data, function(err, result) {})
    connection.query('delete from pollanswers where pollId = ?', data, function(err, result) {})
    connection.query('delete from pollvoted where pollId = ?', data, function(err, result) {})
  })
  socket.on('removeComm', function (data) {
    connection.query('delete from commands where commName = ?', data, function(err, result) {})
  })
  socket.on('addCom', function (data) {
    connection.query('insert into commands set ?', data, function (err, result) {})
  })
  socket.on('updateComm', function(data) {
    connection.query('update commands set commName = "' + data.commName + '", response = "' + data.response + '", level = "' + data.level + '",\
    cdType = "' + data.cdType + '", cd = "' + data.cd + '" where commName = "' + data.commName + '"', function(err, result) {})
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
    res.locals.login = false
  }
  next()
});

app.get('/', function(req, res) {
  var info = {
    url: 'https://api.twitch.tv/kraken/streams/' + JSON.stringify(options.channels).slice(2, -2),
    headers: {
      'Client-ID': clientID
    }
  }
  request(info, function (error, response, body) {
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
        var reqBody = JSON.parse(body)
        var userPf = reqBody.logo
        connection.query('update user set profile_pic = "' + userPf + '" where name = ?', reqBody.name, function(err, result) {})
        var getAge = JSON.stringify(new Date(reqBody.created_at)).substring(1, 20)
        var age = getAge.substring(0, 10) + " / " + getAge.substring(11, 20)
        var days = Math.round(Math.abs((new Date(reqBody.created_at).getTime() - new Date().getTime())/(24*60*60*1000)));
        request("https://api.rtainc.co/twitch/channels/" + options.channels[0] + "/followers/" + req.params.id + "?format=[2]", function (error, response, body) {
          res.render('user.html', {
            age: age,
            days: days,
            followAge: body,
            user: result[0].name,
            points: result[0].points,
            lines: result[0].num_lines,
            profile_pic_page: userPf
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
        name: result[0].name,
        date: date,
        type: "all"
      });
    };
  });
});

app.get('/user/:id/logs/:page', function(req, res) {
  connection.query('select * from chatlogs where DATE_FORMAT(time,"%Y-%m-%d") = "' + req.params.page + '" AND name = ?', req.params.id, function(err, result) {
    if (result[0] == undefined) {
      res.render("logs.html", {
        log: undefined,
        date: req.params.page,
        type: undefined
      });
    } else {
      res.render('logs.html', {
        log: result,
        name: result[0].name,
        date: req.params.page,
        type: undefined
      });
    };
  });
});

app.get('/commands', function(req, res) {
  connection.query('select * from commands ORDER BY level', function(err, result) {
    res.render('commands.html', {
      commands: result
    })
  });
});

app.get('/commands/:id', function(req, res) {
  var comm = "!" + req.params.id
  connection.query('select * from commands where commName = ?', comm, function(err, result) {
    res.render('commandDetails.html', {
      commands: result
    })
  });
});

app.get('/stats', function(req, res) {
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
    var streams = result.length
    connection.query('select * from chatlogs', function(err, result) {
      var numLines = result.length
      connection.query('select * from user ORDER BY points DESC', function(err, result) {
        var user = result.length
        var toppoints = result
        connection.query('select * from user ORDER BY num_lines DESC', function(err, result) {
          var toplines = result
          connection.query('select title from songrequest', function(err, result) {
            var songrequest = result.length
            connection.query('select type from adminlogs', function(err, result) {
              var types = result.map(function(a) {return a.type;})
              var timeouts = types.filter(function(b) {return b == "timeout"});
              var bans = types.filter(function(b) {return b == "ban"});
              var allTimeouts = timeouts.length;
              var allBans = bans.length;
              res.render('stats.html', {
                lines: numLines,
                user: user,
                songrequest: songrequest,
                stream: streams,
                timeout: allTimeouts,
                ban: allBans,
                toppoints: toppoints,
                toplines: toplines
              })
            })
          });
        })
      });
    });
  });
});

app.get('/history/:id', function(req, res) {
  connection.query('select * from songrequest where DATE_FORMAT(time,"%Y-%m-%d") = ?', req.params.id, function(err, result) {
    var songInfo = result
    if (result == undefined || result[0] == undefined) {
      res.render("history.html", {
        currSong: [{"title": "The songlist has finished"}],
        songInfo: false,
        listDate: req.params.id
      });
    } else {
      connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ? ORDER BY id LIMIT 1', req.params.id, function(err, result) {
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
  res.redirect('/history/'+ date);
});

app.get('/poll', function(req, res) {
  connection.query('select * from pollquestions ORDER BY id DESC LIMIT 1', function(err, result) {
    if(result[0] != undefined) {
      res.redirect('/poll/' + result[0].id)
    } else {
      res.render('error404.html')
    }
  });
});

app.get('/poll/:id', function(req, res) {
  connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', req.params.id, function(err, result) {
    var data = result
    connection.query('SELECT ip FROM pollvoted where pollId = ?', req.params.id, function(err, result) {
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
  connection.query('SELECT * FROM pollquestions INNER JOIN pollanswers ON pollquestions.id = pollanswers.pollId where pollquestions.id = ?', req.params.id, function(err, result) {
    if(result[0] != undefined) {
    var question = result[0].question
    var answers = result.map(function(a) {return a.answers;})
    connection.query('SELECT * FROM pollvoted where pollId = ?', req.params.id, function(err, result) {
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

app.get('/admin', function(req, res) {
  connection.query('select * from streaminfo', function(err, result) {
    res.render('admin/home.html', {
      info: result
    })
  });
});

app.get('/admin/poll', function(req, res) {
  connection.query('SELECT * FROM pollquestions', function(err, result) {
    res.render('admin/poll.html', {
      polls: result
    })
  })
})

app.get('/admin/poll/create', function(req, res) {
  connection.query('select * from pollquestions', function(err, result) {
    res.render('admin/pollCreate.html')
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

app.get('/admin/logs', function(req, res) {
  connection.query('select * from adminlogs', function(err, result) {
    if (result[0] == undefined) {
      res.render("admin/adminlogs.html", {
        log: false,
        date: date,
        type: undefined
      });
    } else {
      res.render('admin/adminlogs.html', {
        log: result,
        date: date,
        type: "all"
      });
    };
  });
});

app.get('/admin/logs/:page', function(req, res) {
  connection.query('select * from adminlogs where type = ?', req.params.page, function(err, result) {
    if (result[0] == undefined) {
      res.render("admin/adminlogs.html", {
        log: false,
        date: date,
        type: undefined
      });
    } else {
      res.render('admin/adminlogs.html', {
        log: result,
        date: date,
        type: req.params.page
      });
    };
  });
});

app.get('/admin/modules', function(req, res) {
  connection.query('select * from module WHERE id != 1', function(err, result) {
    res.render('admin/modules.html', {
      moduleList: result,
      website: options.identity.websiteUrl
    });
  });
});

app.get('/admin/commands', function(req, res) {
  connection.query('select * from commands where response IS NOT NULL ORDER BY level', function(err, result) {
    res.render('admin/commands.html', {
      commands: result
    })
  });
});

app.get('/admin/commands/create', function(req, res) {
  connection.query('select * from commands', function(err, result) {res.render('admin/addCommand.html')});
});

app.get('/admin/commands/edit/:id', function(req, res) {
  var id = req.params.id
  connection.query('select * from commands where response IS NOT NULL AND commName = ?', id, function(err, result) {
    res.render('admin/editCommand.html', {
      commands: result
    })
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
