/**
 *	MODULE GENERATOR SITE
 */

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var rimraf = require('rimraf');
var fs = require('fs-extra');
var replace = require('replace');
var bodyParser = require('body-parser');
var EasyZip = require('easy-zip').EasyZip;


app.set('port', port);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


app
  .route('/')
  //GET REQUEST DRAW THE HOME PAGE
  .get(function(req, res) {
    res.render("index", {});
    //res.redirect('https://wppb.me');
  }) // END GET ROUTE

  .post(function(req, res) {
    var origin = process.cwd() + '/source/';
    var moduleName = 'sample4';
    var moduleDesc = '';
    var destination = '';
    var data = req.body;

    // ALL FIELDS REQUIRED IF EMPTY SET DEFAULT VALUES
    if(String(data.slug).length) {
      moduleName = String(data.slug).toLowerCase().replace(/[^A-Z0-9]/ig, "-");
    }
    
    moduleDesc = String(data.desc).length ? data.desc : 'This module is an example on how to add ACF fields to a group. And how to add this group to the flexible content element';
    destination =
      process.cwd() + '/tmp/' + moduleName + '-' + new Date().getTime();

    fs.copy(origin, destination, function(err) {
      if (err) {
        console.error(err);

        return;
      }

      //RENAME THE MAIN PLUGIN DIRECTORY
      fs.renameSync(
        destination + '/sample4',
        destination + '/' + moduleName
      );

      //FIND AND REPLACE FILES NAMES
      walker(destination + '/' + moduleName, function(err, files) {

        if (err) {
          console.error(err);
          return;
        }

        
        files.forEach(function(file) {

          var filename = file.replace(/^.*[\\\/]/, '');

          if(filename === 'sample4-template.php') {
            var tempName;
            var re = /sample4-template/gi;
            tempName = file.replace(re, moduleName);
  
            fs.renameSync(file, tempName);
          } else {
            var newName;
            var re = /sample4/gi;
            newName = file.replace(re, pascalCase(moduleName));

            replace({
              regex: 'Sample4',
              replacement: pascalCase(moduleName),
              paths: [file],
              recursive: false,
              silent: true
            });

            fs.renameSync(file, newName);
          }

        });

        replace({
          regex: 'logo_carousel',
          replacement: snackCase(moduleName),
          paths: [destination + '/' + moduleName + '/classes/General/AcfGroups.php'],
          recursive: true,
          silent: true
        });

        replace({
          regex: 'sample-template',
          replacement: moduleName,
          paths: [destination + '/' + moduleName + '/classes/General/AcfGroups.php'],
          recursive: true,
          silent: true
        });

        replace({
          regex: 'Logo Carousel',
          replacement: camelCase(moduleName),
          paths: [destination + '/' + moduleName + '/classes/General/AcfGroups.php'],
          recursive: true,
          silent: true
        });

        replace({
          regex: 'Sample4',
          replacement: moduleName,
          paths: [destination + '/' + moduleName + '/' + 'module.json'],
          recursive: false,
          silent: true
        });

        replace({
          regex: 'This module is an example on how to add ACF fields to a group. And how to add this group to the flexible content element',
          replacement: moduleDesc,
          paths: [destination + '/' + moduleName + '/' + 'module.json'],
          recursive: false,
          silent: true
        });

        try {
          if (data.cpost === undefined) {
            fs.unlinkSync(destination + '/' + moduleName + '/classes/General/CustomPostTypes.php');
          }

          if(data.modulesetting === undefined) {
            fs.unlinkSync(destination + '/' + moduleName + '/classes/General/ModuleSettings.php');
          }

          if (data.frontend === undefined) {
            fs.unlinkSync(destination + '/' + moduleName + '/classes/Frontend.php');
            fs.rmdirSync(destination + '/' + moduleName + '/classes/Frontend', { recursive: true });
          }
          
          //file removed
        } catch(err) {
          console.error(err)
        }

        //Replace done ZIP it

        var zip = new EasyZip();

        zip.zipFolder(destination + '/' + moduleName, function() {
          zip.writeToResponse(res, kebabCase(moduleName));
        });

        setTimeout(() => {
  
          fs.rmdir(destination, { recursive: true })
          .then(() => console.log('directory removed!'));

        }, 1000);
      });
    });
  }); //END ROUTE


/**
 * RECURSIVE WALKER TO GET ALL THE FILES IN DIRECTORY
 */
var walker = function(dir, done) {
  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) return done(null, results);

      file = dir + '/' + file;

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walker(file, function(err, res) {
            results = results.concat(res);

            next();
          });
        } else {
          results.push(file);

          next();
        }
      });
    })();
  });
};

var kebabCase = function(name) {
  var newName = '';
  // name = name.replace(/-/gi, '-');
  pieces = name.split(' ');
  pieces.forEach(function(word) {
    newName += word.toLowerCase() + ' ';
  });

  return newName.trim().replace(/ /gi, '-');
};

var camelCase = function(str) {
  return str.split('-').map(function capitalize(part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
}).join(' ');
};

var snackCase = function(name) {
  var newName = '';
  // name = name.replace(/-/gi, '-');
  pieces = name.split(' ');
  pieces.forEach(function(word) {
    newName += word.toLowerCase() + ' ';
  });

  return newName.trim().replace(/-/gi, '_');
};

var clearAndUpper = function(text) {
  return text.replace(/-/, "").toUpperCase();
}

var pascalCase =  function(text) {
  // var newName = '';
  // // name = name.replace(/-/gi, '-');
  // pieces = name.split(' ');
  // pieces.forEach(function(word) {
  //   newName += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  // });
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
};


// On Init get initial code
// getSourceCode();

//Start web app.
app.listen(app.get('port'), function() {
  console.log('Node app is running at localhost:' + app.get('port'));
});
