/* global Module Log */

/* Magic Mirror
 * Module: MMM-ScottishPremierLeague
 *
 * By fewieden https://github.com/fewieden/MMM-ScottishPremierLeague
 *
 * MIT Licensed.
 */

Module.register('MMM-ScottishPremierLeague', {

    defaults: {
        api_key: false,
        focus_on: false,
        max_teams: false,
        updateInterval: 180 * 60 * 1000,
        season: '1617'
    },

    loading: true,

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('CONFIG', this.config);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'DATA') {
            this.standing = payload;
            this.loading = (!this.standing);
            this.updateDom(300);
        }
    },

    getStyles() {
        return ['font-awesome.css', 'MMM-ScottishPremierLeague.css'];
    },

    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    getDom() {
        const wrapper = document.createElement('div');

        if (this.loading ||
            !this.standing) {
            const title = document.createElement('header');
            title.innerHTML = this.name;
            wrapper.appendChild(title);

            const subtitle = document.createElement('div');
            subtitle.classList.add('small', 'dimmed', 'light');
            subtitle.innerHTML = (this.loading) ? this.translate('LOADING') : this.translate('NO_DATA_AVAILABLE');
            wrapper.appendChild(subtitle);

            return wrapper;
        }

        if (this.standing) {
            // League header
            const title = document.createElement('header');
            title.innerHTML = 'Scottish Premier League';
            wrapper.appendChild(title);

            // Standings container
            const table = document.createElement('table');
            table.classList.add('xsmall', 'table');

            // Standings header row
            const headerRow = document.createElement('tr');
            headerRow.classList.add('row');

            const position = document.createElement('th');
            headerRow.appendChild(position);

            const nameLabel = document.createElement('th');
            nameLabel.classList.add('name');
            nameLabel.innerHTML = this.translate('TEAM');
            headerRow.appendChild(nameLabel);

            const pointsLabel = document.createElement('th');
            pointsLabel.classList.add('centered');
            const pointsIcon = document.createElement('i');
            pointsIcon.classList.add('fa', 'fa-line-chart');
            pointsLabel.appendChild(pointsIcon);
            headerRow.appendChild(pointsLabel);

            const goalsLabel = document.createElement('th');
            goalsLabel.classList.add('centered');
            const goalsIcon = document.createElement('i');
            goalsIcon.classList.add('fa', 'fa-soccer-ball-o');
            goalsLabel.appendChild(goalsIcon);
            headerRow.appendChild(goalsLabel);

            table.appendChild(headerRow);

            // Get First and Last teams to display in standings
            let focusTeamIndex;
            let firstTeam;
            let lastTeam;

            /* focus_on for current league is set */
            if (this.config.focus_on) {
                /* focus_on TOP */
                if (this.config.focus_on === 'TOP') {
                    focusTeamIndex = -1;
                    firstTeam = 0;
                    lastTeam = (this.config.max_teams && this.config.max_teams <= this.standing.length) ?
                        this.config.max_teams : this.standing.length;
                } else if (this.config.focus_on === 'BOTTOM') {
                    focusTeamIndex = -1;
                    firstTeam = (this.config.max_teams && this.config.max_teams <= this.standing.length) ?
                        this.standing.length - this.config.max_teams : 0;
                    lastTeam = this.standing.length;
                } else {
                    for (let i = 0; i < this.standing.length; i += 1) {
                        /* focus_on is teamName */
                        if (this.standing[i].Team[0] === this.config.focus_on) {
                            focusTeamIndex = i;
                            /* max_teams is set */
                            if (this.config.max_teams) {
                                const before = parseInt(this.config.max_teams / 2);
                                firstTeam = focusTeamIndex - before >= 0 ? focusTeamIndex - before : 0;
                                /* index for lastTeam is in range */
                                if (firstTeam + this.config.max_teams <= this.standing.length) {
                                    lastTeam = firstTeam + this.config.max_teams;
                                } else {
                                    lastTeam = this.standing.length;
                                    firstTeam = lastTeam - this.config.max_teams >= 0 ?
                                        lastTeam - this.config.max_teams : 0;
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
            for (let i = firstTeam; i < lastTeam; i += 1) {
                const row = document.createElement('tr');
                if (i === focusTeamIndex) {
                    row.classList.add('bright');
                }

                const pos = document.createElement('td');
                pos.innerHTML = i + 1;
                row.appendChild(pos);

                const name = document.createElement('td');
                name.classList.add('name');
                name.innerHTML = this.standing[i].Team[0];
                row.appendChild(name);

                const points = document.createElement('td');
                points.innerHTML = this.standing[i].Points[0];
                points.classList.add('centered');
                row.appendChild(points);

                const goals = document.createElement('td');
                goals.innerHTML = this.standing[i].Goal_Difference[0];
                goals.classList.add('centered');
                row.appendChild(goals);

                // Create fade in/out effect.
                if (this.config.max_teams && focusTeamIndex >= 0) {
                    if (i !== focusTeamIndex) {
                        const currentStep = Math.abs(i - focusTeamIndex);
                        row.style.opacity = 1 - ((1 / this.config.max_teams) * currentStep);
                    }
                }

                table.appendChild(row);
            }
            wrapper.appendChild(table);
        }
        return wrapper;
    }
});
