window.Scoreboard = {

    render({
        container,
        currentTeamLabel,
        teams,
        currentTeam,
        pokemonHunters = false
    }) {

        container.innerHTML = "";

        teams.forEach((team, index) => {

            const teamBox = document.createElement("div");

            teamBox.classList.add("team-box");

            if (index === currentTeam) {
                teamBox.classList.add("active-team");
            }

            const teamName = document.createElement("h3");

            if (pokemonHunters) {
                teamName.innerHTML = `Team<br>${index + 1}`
            } else {
                teamName.textContent =
                    team.name || `Team ${index + 1}`;
            }
            const teamScore = document.createElement("p");

            teamScore.textContent = team.score;

            teamBox.appendChild(teamName);
            teamBox.appendChild(teamScore);

            container.appendChild(teamBox);
        });

        currentTeamLabel.textContent =
            `Team ${currentTeam + 1}'s Turn`;
    }
};