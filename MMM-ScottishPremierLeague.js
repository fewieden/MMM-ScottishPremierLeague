/* Magic Mirror
 * Module: MMM-ScottishPremierLeague
 *
 * By fewieden https://github.com/fewieden/MMM-ScottishPremierLeague
 *
 * MIT Licensed.
 */

Module.register("MMM-ScottishPremierLeague",{

    defaults: {
        api_key: false,
        focus_on: false,
        max_teams: false,
        updateInterval: 180*60*1000,
        season: '1617'
    },

    loading: true,

    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
    },

    socketNotificationReceived: function(notification, payload){
        if(notification === 'DATA'){
            this.standing = payload;
            this.loading = (!this.standing);
            this.updateDom(300);
        }
    },

    getStyles: function() {
        return ["font-awesome.css", "MMM-ScottishPremierLeague.css"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.loading ||
            !this.standing) {
            var title = document.createElement("header");
            title.innerHTML = this.name;
            wrapper.appendChild(title);

            var subtitle = document.createElement("div");
            subtitle.classList.add("small", "dimmed", "light");
            subtitle.innerHTML = (this.loading) ? this.translate("LOADING") : this.translate("NO_DATA_AVAILABLE");
            wrapper.appendChild(subtitle);

            return wrapper;
        }

        if(this.standing){
            // League header
            var title = document.createElement("header");
            title.innerHTML = "Scottish Premier League";
            wrapper.appendChild(title);

            // Standings container
            var table = document.createElement('table');
            table.classList.add('xsmall', 'table');

            // Standings header row
            var row = document.createElement('tr');
            row.classList.add('row');

            var position = document.createElement('th');
            row.appendChild(position);

            var name = document.createElement('th');
            name.classList.add('name');
            name.innerHTML = this.translate("TEAM");
            row.appendChild(name);

            var pointsLabel = document.createElement('th');
            pointsLabel.classList.add('centered');
            var points = document.createElement('i');
            points.classList.add('fa', 'fa-line-chart');
            pointsLabel.appendChild(points);
            row.appendChild(pointsLabel);

            var goalsLabel = document.createElement('th');
            goalsLabel.classList.add('centered');
            var goals = document.createElement('i');
            goals.classList.add('fa', 'fa-soccer-ball-o');
            goalsLabel.appendChild(goals);
            row.appendChild(goalsLabel);

            table.appendChild(row);

            // Get First and Last teams to display in standings
            var focusTeamIndex, firstTeam, lastTeam;

            /* focus_on for current league is set */
            if(this.config.focus_on){
                /* focus_on TOP */
                if(this.config.focus_on === 'TOP'){
                    focusTeamIndex = -1;
                    firstTeam = 0;
                    lastTeam = (this.config.max_teams && this.config.max_teams <= this.standing.length) ? this.config.max_teams : this.standing.length;
                }
                /* focus_on BOTTOM */
                else if(this.config.focus_on === 'BOTTOM'){
                    focusTeamIndex = -1;
                    firstTeam = (this.config.max_teams && this.config.max_teams <= this.standing.length) ? this.standing.length - this.config.max_teams : 0;
                    lastTeam = this.standing.length;
                }
                /* focus_on specific team */
                else {
                    for(var i = 0; i < this.standing.length; i++){
                        /* focus_on is teamName */
                        if(this.standing[i].Team[0] === this.config.focus_on){
                            focusTeamIndex = i;
                            /* max_teams is set */
                            if(this.config.max_teams){
                                var before = parseInt(this.config.max_teams / 2);
                                firstTeam = focusTeamIndex - before >= 0 ? focusTeamIndex - before : 0;
                                /* index for lastTeam is in range */
                                if(firstTeam + this.config.max_teams <= this.standing.length){
                                    lastTeam =  firstTeam + this.config.max_teams;
                                } else {
                                    lastTeam = this.standing.length;
                                    firstTeam = lastTeam - this.config.max_teams >= 0 ? lastTeam - this.config.max_teams : 0;
                                }
                            } else {
                                firstTeam = 0;
                                lastTeam = this.standing.length;
                            }
                            break;
                        }
                    }
                }
            } else {
                focusTeamIndex = -1;
                firstTeam = 0;
                lastTeam = this.config.max_teams || this.standing.length;
            }

            // Render Team Rows
            for(var i = firstTeam; i < lastTeam; i++){
                var row = document.createElement('tr');
                if(i === focusTeamIndex){
                    row.classList.add('bright');
                }

                var pos = document.createElement('td');
                pos.innerHTML = i + 1;
                row.appendChild(pos);

                var name = document.createElement('td');
                name.classList.add('name');
                name.innerHTML = this.standing[i].Team[0];
                row.appendChild(name);

                var points = document.createElement('td');
                points.innerHTML = this.standing[i].Points[0];
                points.classList.add('centered');
                row.appendChild(points);

                var goals = document.createElement('td');
                goals.innerHTML = this.standing[i].Goal_Difference[0];
                goals.classList.add('centered');
                row.appendChild(goals);

                // Create fade in/out effect.
                if (this.config.max_teams && focusTeamIndex >= 0) {
                    if (i != focusTeamIndex) {
                        var currentStep = Math.abs(i - focusTeamIndex);
                        row.style.opacity = 1 - (1 / this.config.max_teams * currentStep);
                    }
                }

                table.appendChild(row);
            }
            wrapper.appendChild(table);
        }
        return wrapper;
    }
});