#!/usr/bin/env node
/**
 * coolor.js - simple terminal text stream colorizer
 *
 * Copyright (C) 2014  Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Version: 0.1
 * URL: http://github.com/yyyar/coolor
 */

var _ = require('lodash'),
    readline = require('readline'),
    chalk = require('chalk');

/* setup streams */
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var configPath = process.argv[2] || __dirname + '/config/default.json';

/* load rules */
var conf = require(configPath);
var rules = _.map(conf.rules, function(rule) {
    return _.merge(_.cloneDeep(conf.defaults), rule);
});


/* process stream */
rl.on('line', function (l) {

    if (conf.general.stripExistingColors) {
        l = chalk.stripColor(l);
    }

    /* go through rules */
    var colorArray = _.foldl(rules, function(colorArray, rule) {

        var r = new RegExp(rule.pattern, rule.flags),
            m = null,
            isMany = _.contains(rule.flags, 'g');

        /* collect styles */
        while((m = r.exec(l))) {
            for(var i=m.index; i<m.index+m[0].length; i++) {
                colorArray[i] = (colorArray[i] || []).concat(rule.style);
            }

            if (!isMany) {
                break;
            }
        }

        return colorArray;

    }, new Array(l.length));


    /* paint line */
    var res = "";
    _.each(colorArray, function(styl, i) {

        /* do not paint symbol if style is the same */
        if (colorArray[i-1] == styl) {
            return res += l[i];
        }

        /* paint */
        res += _.compose.apply(null,
            _.map(styl, function(s) { return chalk[s] || _.identity; } )
        ) (l[i]);
    });

    /* output */
    console.log(res);
});


/* greedy exit */
process.on('SIGINT', function() {
    console.log('Bye!');
    process.exit();
});

