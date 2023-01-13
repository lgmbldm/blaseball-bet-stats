window.loadLocalStorage = () => {
  const season = window.localStorage.getItem("season");
  if (season) {
    document.getElementById("season").value = season;
  }
  const jsons = window.localStorage.getItem("jsons");
  if (jsons) {
    const jsonParts = jsons.split("|||");
    console.log(jsonParts);
    Array.from(document.querySelectorAll("textarea")).forEach((e, i) => {
      if (i < jsonParts.length) {
        e.value = jsonParts[i];
      }
    });
  }
};

window.parseInput = async () => {
  const getBetStats = (betDatas) => {
    const numBets = betDatas.length;
    const numWins = betDatas.filter((betData) => betData.teamWon).length;
    const totalBet = betDatas
      .map((betData) => betData.userBetWager)
      .reduce((a, b) => a + b, 0);
    const totalPayout = betDatas
      .map((betData) => (betData.teamWon ? betData.userBetPayout : 0))
      .reduce((a, b) => a + b, 0);
    const winPct = Math.round((numWins / numBets) * 1000) / 10;
    const avgPayout =
      Math.round(((totalPayout - totalBet) / numBets) * 10) / 10;
    return [numBets, numWins, totalBet, totalPayout, winPct, avgPayout];
  };
  try {
    const inputValues = Array.from(document.querySelectorAll("textarea")).map(
      (textarea) => textarea.value
    );
    window.localStorage.setItem("jsons", inputValues.join("|||"));
    let parsedJson = [];
    for (const inputValue of inputValues) {
      if (inputValue) {
        const parsedInputValue = await JSON.parse(inputValue);
        parsedJson = parsedJson.concat(parsedInputValue);
      }
    }
    document.getElementById("results").style.display = "block";
    document.getElementById("error").innerText = "";

    const betDatas = parsedJson
      .flatMap((item) => item.betDatas)
      .filter(
        (betData) =>
          betData.complete &&
          (betData.homeTeamBetData?.userBetWager ||
            betData.awayTeamBetData?.userBetWager)
      )
      .map((betData) =>
        betData.homeTeamBetData?.userBetWager
          ? betData.homeTeamBetData
          : betData.awayTeamBetData
      );
    const [numBets, numWins, totalBet, totalPayout, winPct, avgPayout] =
      getBetStats(betDatas);
    document.getElementById("numBets").innerText = numBets;
    document.getElementById("winPct").innerText = winPct;
    document.getElementById("totalBet").innerText = totalBet;
    document.getElementById("totalPayout").innerText = totalPayout;
    document.getElementById("netPayout").innerText = totalPayout - totalBet;
    document.getElementById("avgPayout").innerText = avgPayout;

    const underdogBets = betDatas.filter(
      (betData) => betData.userBetOdds < 0.5
    );
    const [
      numUnderdogBets,
      numUnderdogWins,
      totalUnderdogBet,
      totalUnderdogPayout,
      winPctUnderdog,
      avgUnderdogPayout,
    ] = getBetStats(underdogBets);
    document.getElementById("numUnderdogBets").innerText = numUnderdogBets;
    document.getElementById("winPctUnderdog").innerText = winPctUnderdog;
    document.getElementById("totalUnderdogBet").innerText = totalUnderdogBet;
    document.getElementById("totalUnderdogPayout").innerText =
      totalUnderdogPayout;
    document.getElementById("netUnderdogPayout").innerText =
      totalUnderdogPayout - totalUnderdogBet;
    document.getElementById("avgUnderdogPayout").innerText = avgUnderdogPayout;

    const overdogBets = betDatas.filter((betData) => betData.userBetOdds > 0.5);
    const [
      numOverdogBets,
      numOverdogWins,
      totalOverdogBet,
      totalOverdogPayout,
      winPctOverdog,
      avgOverdogPayout,
    ] = getBetStats(overdogBets);
    document.getElementById("numOverdogBets").innerText = numOverdogBets;
    document.getElementById("winPctOverdog").innerText = winPctOverdog;
    document.getElementById("totalOverdogBet").innerText = totalOverdogBet;
    document.getElementById("totalOverdogPayout").innerText =
      totalOverdogPayout;
    document.getElementById("netOverdogPayout").innerText =
      totalOverdogPayout - totalOverdogBet;
    document.getElementById("avgOverdogPayout").innerText = avgOverdogPayout;
  } catch (e) {
    console.log(e);
    document.getElementById("error").innerText = "error, check console logs";
  }
};

window.generateLinks = () => {
  const linksDiv = document.getElementById("links");
  linksDiv.innerHTML = "Right click and open these in new tabs <br>";
  const season = document.getElementById("season").value;
  window.localStorage.setItem("season", season);
  const today = new Date();
  const todayDay = today.getDay();
  const dayDiff = today.getDate() - todayDay + (todayDay == 0 ? -6 : 1); // adjust when day is sunday
  const date = new Date(today.setDate(dayDiff));
  for (let x = 0; x < 6; x++) {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const url = `https://api2.blaseball.com/schedule/${season}/${formattedDate}/hourly?timezone=America/New_York`;
    linksDiv.innerHTML += `<a href='${url}' target='_blank'>${url}</a><br>`;
    date.setDate(date.getDate() + 1);
  }
};
