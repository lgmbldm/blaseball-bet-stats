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
    return [numBets, numWins, totalBet, totalPayout, winPct];
  };
  try {
    const inputValues = Array.from(document.querySelectorAll("textarea")).map(
      (textarea) => textarea.value
    );
    let parsedJson = [];
    for (const inputValue of inputValues) {
      if (inputValue) {
        const parsedInputValue = await JSON.parse(inputValue);
        parsedJson = parsedJson.concat(parsedInputValue);
      }
    }
    console.log(parsedJson);
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
    const [numBets, numWins, totalBet, totalPayout, winPct] = getBetStats(
      betDatas
    );
    document.getElementById("numBets").innerText = numBets;
    document.getElementById("winPct").innerText = winPct;
    document.getElementById("totalBet").innerText = totalBet;
    document.getElementById("totalPayout").innerText = totalPayout;
    document.getElementById("netPayout").innerText = totalPayout - totalBet;

    const underdogBets = betDatas.filter(
      (betData) => betData.userBetOdds < 0.5
    );
    const [
      numUnderdogBets,
      numUnderdogWins,
      totalUnderdogBet,
      totalUnderdogPayout,
      winPctUnderdog
    ] = getBetStats(underdogBets);
    document.getElementById("numUnderdogBets").innerText = numUnderdogBets;
    document.getElementById("winPctUnderdog").innerText = winPctUnderdog;
    document.getElementById("totalUnderdogBet").innerText = totalUnderdogBet;
    document.getElementById(
      "totalUnderdogPayout"
    ).innerText = totalUnderdogPayout;
    document.getElementById("netUnderdogPayout").innerText =
      totalUnderdogPayout - totalUnderdogBet;

    const overdogBets = betDatas.filter((betData) => betData.userBetOdds > 0.5);
    const [
      numOverdogBets,
      numOverdogWins,
      totalOverdogBet,
      totalOverdogPayout,
      winPctOverdog
    ] = getBetStats(overdogBets);
    document.getElementById("numOverdogBets").innerText = numOverdogBets;
    document.getElementById("winPctOverdog").innerText = winPctOverdog;
    document.getElementById("totalOverdogBet").innerText = totalOverdogBet;
    document.getElementById(
      "totalOverdogPayout"
    ).innerText = totalOverdogPayout;
    document.getElementById("netOverdogPayout").innerText =
      totalOverdogPayout - totalOverdogBet;
  } catch (e) {
    console.log(e);
    document.getElementById("error").innerText = "error, check console logs";
  }
};

window.generateLinks = () => {
  const linksDiv = document.getElementById("links");
  linksDiv.innerHTML = "";
  const season = document.getElementById("season").value;
  const today = new Date();
  const todayDay = today.getDay();
  const dayDiff = today.getDate() - todayDay + (todayDay == 0 ? -6 : 1); // adjust when day is sunday
  const date = new Date(today.setDate(dayDiff));
  for (let x = 0; x < 5; x++) {
    const formattedDate = date.toISOString().split("T")[0];
    const url = `https://api2.blaseball.com//schedule/${season}/${formattedDate}/hourly?timezone=America/New_York`;
    linksDiv.innerHTML += `<a href='${url}' target='_blank'>${url}</a><br>`;
    date.setDate(date.getDate() + 1);
  }
};

