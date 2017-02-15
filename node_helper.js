/* Magic Mirror
 * Module: MMM-ScottishPremierLeague
 *
 * By fewieden https://github.com/fewieden/MMM-ScottishPremierLeague
 *
 * MIT Licensed.
 */

/* eslint-env node */
/* eslint-disable no-console */

const request = require('request');
const parser = require('xml2js').parseString;
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({

    baseUrl: 'http://www.xmlsoccer.com/FootballDataDemo.asmx/GetLeagueStandingsBySeason?',

    start() {
        console.log(`Starting module: ${this.name}`);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'CONFIG') {
            this.config = payload;
            this.getData();
            setInterval(() => {
                this.getData();
            }, this.config.updateInterval);
        }
    },

    getData() {
        request(
            {
                url: `${this.baseUrl}ApiKey=${this.config.api_key}&league=3&seasonDateString=${this.config.season}`
            }, (error, response, body) => {
            if (response.statusCode === 200) {
                parser(body, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (Object.prototype.hasOwnProperty.call(result, 'XMLSOCCER.COM') &&
                        Object.prototype.hasOwnProperty.call(result['XMLSOCCER.COM'], 'TeamLeagueStanding')) {
                        this.standing = result['XMLSOCCER.COM'].TeamLeagueStanding;
                        this.sendSocketNotification('DATA', this.standing);
                    } else {
                        console.log('MMM-ScottishPremierLeague: Error no data');
                    }
                });
            } else {
                console.log(`MMM-ScottishPremierLeague: Error getting data ${response.statusCode}`);
            }
        });
    }
});
