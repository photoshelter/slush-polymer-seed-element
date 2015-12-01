/*
 * slush-polymer-seed-element
 * https://github.com/mwootendev/slush-polymer-seed-element
 *
 * Copyright (c) 2015, Michael Wooten
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user, description;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }
    
    description = 'This is a brand new PhotoShelter.com web component.  Build\n'
        + 'from these files to include one base, featureless component, three failing WCT tests\n'
        + 'to remind you to write them for real before you try to pass code along for review,\n'
        + 'and Hydrolysis ready comment helpers that prepare your code for `<iron-component-page/>`\n'
        + 'based documentation while generally outlining our web component style guide.  Enjoy!'

    return {
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        elementDescription: description || ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'elementName',
        message: 'What is the name of your element (ex: seed-element)?',
        default: 'seed-element'
    }, {
        name: 'elementDescription',
        message: 'What is the description of your element?',
        default: defaults.elementDescription
    }, {
        name: 'authorName',
        message: 'Who is the author of this element?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the author\'s email address?',
        default: defaults.authorEmail
    }, {
        name: 'githubUsername',
        message: 'What is the author\'s github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            gulp.src(__dirname + '/templates/**')
                .pipe(template(answers))
                .pipe(rename(function (file) {
                    if (file.basename[0] === '_') {
                        file.basename = '.' + file.basename.slice(1);
                    }
                    if (file.basename === 'seed-element') {
                        file.basename = answers.elementName;
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function () {
                    done();
                });
        });
});
