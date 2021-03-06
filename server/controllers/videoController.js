var authenticate = require('services/authService');
const apiService = require('services/apiService'),
  sql = require('services/sqlService'),
  apiConfig = require('config/apiConfig');


function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxx.png'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

const uuidv4 = require('uuid/v4');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');



module.exports = function(app, passport) {
  //Show all users
  app.get('/api/all-videos/?', allVideosHandler);

  // upload video
  app.post('/upload/?', uploadVideoHandler)

  //Get Update
  app.get('/api/get-video/:id/?', particularVideoHandler);

  //Update post
  app.post('/api/edit-video/:id/?', videoUpdateHandler);

  //POST Insert
  app.post('/api/add-video/?', addVideoHandler);

  //Delete
  app.post('/api/delete-video/:id/?', videoDeleteHandler);
};




function uploadVideoHandler(req, res) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      var form = new formidable.IncomingForm();
      form.parse(req);
      form.on('fileBegin', function(name, file) {
        file.path = 'uploads/' + file.name;
        //console.log(__dirname);
      });
      form.on('file', function(name, file) {
        //console.log('Uploaded ' + file.name);
      });
      form.on('end', function() {
        res.send({
          error: false
        })

      });
      //console.log('successfully uploaded')
    } else {
      res.send({
        error: 0
      });
    }
  })
}


function addVideoHandler(req, res) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      var data = {
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        duration: req.body.duration,
        file: req.body.file,
        ispublic: req.body.ispublic
      }
      //console.log(req.body);
      if (!(data.title && data.description && data.author && data.duration && data.file && data.ispublic)) {
        //console.log(data);
        res.send({
          error: true,
          reason: "Insufficient parameters"
        });

      }
      else {
        // var whereObj = {
        //   id: req.body.title
        // }
        // sql.findOne(sql.video, whereObj, function(obj) {
        //   if (obj.data.id) {
        //     res.send({
        //       error: 'true',
        //       reason: 'Video already exists'
        //     })
        //   } else {
            sql.insert(sql.video, data, function(obj) {

              res.send({
                error: false,
                response: "Video created successfully"
              });
            })
          }
        // })

    }
    else {
      res.send({
        error: 0
      });
    }
  })
}


function allVideosHandler(req, res, next) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      sql.findAll(sql.video, {}, function(obj) {
        ////console.log(obj);
        if (obj.error == true || obj.data.length == 0)
          res.send({
            error: true,
            reason: "No video found!!"
          });
        else if (!obj.data) {
          res.send({
            error: true,
            reason: "No data found"
          });
        } else {
          res.send(obj);
        }
      });
    } else {
      res.send({
        error: 0
      });
    }
  })
}

function particularVideoHandler(req, res) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      var whereObj = {
        id: req.params.id
      }
      if (!req.params.id) {
        res.send({
          error: true,
          reason: "Insufficient parameters"
        });
      } else {
        sql.findOne(sql.video, whereObj, function(obj) {
          if (!(obj.data.id)) {
            res.send({
              error: true,
              response: "Video does not exist"
            })
          } else {
            res.send({
              error: false,
              response: obj
            });
          }
        });
      }
    } else {
      res.send({
        error: 0
      });
    }
  })
}


function videoUpdateHandler(req, res, next) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      var data = {
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        duration: req.body.duration,
        file: req.body.file,
        //uploadedat: req.body.uploadedat,
        ispublic: req.body.ispublic
      }
//console.log(data);
      var whereObj = {
        id: req.params.id
      }
      //console.log("data.ispublic"+data.ispublic)
      if (!(data.title && data.description && data.author&& data.duration )) {
        res.send({
          error: true,
          reason: "All fields not filled"
        });
      } else {
        sql.findOne(sql.video, whereObj, function(obj) {
          if (!(obj.data.id)) {
            res.send({
              error: true,
              response: "Video does not exist"
            })
          } else {
            // var filePath = 'uploads/'+obj.data.file;
            // fs.unlinkSync(filePath);
            sql.update(sql.video, data, whereObj, function(obj) {
              res.send({
                error: false,
                response: "Updated successfully"
              });
            });
          }
        });
      }
    } else {
      res.send({
        error: 0
      });
    }
  })
}


function videoDeleteHandler(req, res, next) {
  authenticate.auth(req, res, function(status) {
    //console.log("status" + status);
    if (status) {
      var whereobj = {
        id: req.params.id
      }

      sql.findOne(sql.video, whereobj, function(obj) {
        if (!(obj.data.id)) {
          res.send({
            error: true,
            response: "Video does not exist"
          })
        } else {
          //console.log(obj.data.file);
          var filePath = 'uploads/'+obj.data.file;
          //console.log(filePath);
          fs.unlinkSync(filePath);
          sql.delete(sql.video, whereobj, function response(obj) {

            res.send({
              error: false,
              response: "Video deleted successfully!!"
            });
          })
        }
      })
    } else {
      res.send({
        error: 0
      })
    }
  })
}
