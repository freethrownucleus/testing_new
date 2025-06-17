let username, password;
let loginFlag = false, gameInProgress = false;
let mainGame;
let url = "http://localhost:8080";
let divsArray = ["homePageDiv", "gameFormDiv", "gameDiv", "restartGameDiv", "leaveGameDiv", "rankingDiv", "rulesDiv"];

let homePageDiv = document.getElementById("homePageDiv");
let leaveGameDiv = document.getElementById("leaveGameDiv");
let gameDiv = document.getElementById("gameDiv");
let userInputForm = document.getElementById("userInputForm");
let playFirstForm = document.getElementById("playFirstForm");
let boardSizeForm = document.getElementById("boardSizeForm");
let gameFormDiv = document.getElementById("gameFormDiv");
let loginDiv = document.getElementById("loginDiv");
let optionsDiv = document.getElementById("optionsDiv");
let wrongPasswordText = document.getElementById("wrongPasswordText");
let wrongBoardSizeText = document.getElementById("wrongBoardSizeText");
let userInput = document.getElementById("userInput");
let passwordInput = document.getElementById("passwordInput");
let tableRankingDiv = document.getElementById("tableRankingDiv");
let rankingDiv = document.getElementById("rankingDiv");
let rulesDiv = document.getElementById("rulesDiv");
let showLoginDiv = document.getElementById("showLoginDiv");
let showLoginText = document.getElementById("showLoginText");
let restartGameDiv = document.getElementById("restartGameDiv");

userInputForm.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Sprječava defaultnu akciju, npr. slanje forme ako postoji button "submit".
        login(); // Poziva funkciju za prijavu.
    }
});

function showFrontPage() {
    divsArray.forEach(divId => document.getElementById(divId).style.display = "none");
    homePageDiv.style.display = "block";
    showLoginDiv.style.display = loginFlag ? "block" : "none";
}

function showGameForm(goodPassword = true, goodBoardSize = true) {
    if (gameInProgress) leaveGame();
    divsArray.forEach(divId => document.getElementById(divId).style.display = "none");

    gameFormDiv.style.display = "block";
    loginDiv.style.display = loginFlag ? "none" : "block";
    optionsDiv.style.display = loginFlag ? "block" : "none";
    showLoginDiv.style.display = loginFlag ? "block" : "none";
    wrongPasswordText.style.display = goodPassword ? "none" : "block";
    wrongBoardSizeText.style.display = goodBoardSize ? "none" : "block";

    userInputForm.reset();
    playFirstForm.reset();
    boardSizeForm.reset();
}

function leaveGame() {
    if (gameInProgress) {
        console.log("Prekid igre zbog prelaska na drugi dio sučelja.");
        mainGame.leave();
        resetGameDiv();
        gameInProgress = false;
    }
}

function showRanks() {
    if (gameInProgress) mainGame.leave();
    divsArray.forEach(divId => document.getElementById(divId).style.display = "none");

    rankingDiv.style.display = "block";
    let players = [];
    for (let i = 0; i < localStorage.length; i++) {
        let jsonUsername = localStorage.key(i);
        let json = JSON.parse(localStorage.getItem(jsonUsername));

        // Provjera je li korisnik odigrao barem jednu partiju
        if (json.games > 0) {
            let winPercentage = ((json.victories / json.games) * 100).toFixed(2);
            players.push({
                username: jsonUsername,
                games: json.games,
                victories: json.victories,
                losses: json.games - json.victories,
                winPercentage: parseFloat(winPercentage),
            });
        }
    }

    // Sortiranje po postotku pobjeda, zatim po broju pobjeda, zatim abecedno
    players.sort((a, b) => {
        if (b.winPercentage !== a.winPercentage) {
            return b.winPercentage - a.winPercentage; // Po postotku pobjeda
        }
        if (b.victories !== a.victories) {
            return b.victories - a.victories; // Po broju pobjeda
        }
        return a.username.localeCompare(b.username); // Po abecedi
    });

    // Ograničavanje na 10 najboljih
    players = players.slice(0, 10);

    // Generiranje HTML-a za tablicu
    let finalText = "<div class='rankings'><table><tr><th>Igrač</th><th>Ukupno</th><th>Pobjeda</th><th>Poraz</th><th>Omjer</th></tr>";
    players.forEach(player => {
        finalText += `<tr>
            <td>${player.username}</td>
            <td>${player.games}</td>
            <td>${player.victories}</td>
            <td>${player.losses}</td>
            <td>${player.winPercentage}%</td>
        </tr>`;
    });
    finalText += "</table></div>";

    finalText += `<div style="text-align: center; margin-top: 20px;">
        <button onclick="showFrontPage()" style="width: 350px;
            height: 60px;
            padding: 8px;
            font-size: 1.4rem;
            position: fixed;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            color: #1b5e20;
            border-radius: 10px;
            cursor: pointer;
            z-index: 1000;">Povratak na naslovnu stranicu</button>
    </div>`;

    tableRankingDiv.innerHTML = finalText;
}


function showRules() {
    if (gameInProgress) mainGame.leave();
    divsArray.forEach(divId => document.getElementById(divId).style.display = "none");

    // Generiranje HTML-a za pravila s gumbom za povratak
    let finalText = `
        <ol>
            <li>Igra sadrži jedan ili više nizova loptica s određenim brojem novčića u svakom nizu.</li><br><br>
            <li>Igrač i računalo igraju naizmjence, a svatko uklanja proizvoljan broj novčića iz jednog od stupaca.</li><br><br>
            <li>Pobjednik je onaj igrač koji ukloni zadnji novčić.</li>
        </ol>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="showFrontPage()" style="    width: 350px;
                height: 60px;
                padding: 8px;
                font-size: 1.4rem;
                position: fixed;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                color: #1b5e20;
                border-radius: 10px;
                cursor: pointer;
                z-index: 1000;">Povratak na naslovnu stranicu</button>
        </div>
    `;

    // Prikazivanje pravila s gumbom za povratak
    rulesDiv.innerHTML = finalText;
    rulesDiv.style.display = "block";
}


function showGameDiv() {
    divsArray.forEach(divId => document.getElementById(divId).style.display = "none");
    gameDiv.style.display = "block";
}

function resetGameDiv() {
    while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
}

function playGame() {
    if (gameInProgress) leaveGame();

    let firstPlayer = playFirstForm.elements["playFirstButton"].value;
    let boardSize = boardSizeForm.elements["boardSizeInput"].value;
    let gameVersion = document.querySelector("input[name='gameVersion']:checked").value;
    let difficulty = document.querySelector("input[name='difficulty']:checked").value;

    if (isNaN(boardSize) || boardSize < 2 || boardSize > 7) {
        showGameForm(true, false);
        return;
    }

    mainGame = new NimGame(firstPlayer, boardSize, gameVersion, difficulty);
    mainGame.initiateGame();
}

function restartGame() {
    playGame();
}

function login() {
    username = userInput.value;
    password = passwordInput.value;

    let js_obj = { "nick": username, "pass": password };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "register", true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loginFlag = true;
                showLoginDiv.style.display = "block";
                showLoginText.innerHTML = `Bok, ${username}!`;
                if (!localStorage[username]) {
                    localStorage[username] = JSON.stringify({ victories: 0, games: 0 });
                }
                showGameForm(true, true);
            } else if (xhr.status === 400) {
                userInput.value = ""; // Briše unos korisničkog imena
                passwordInput.value = ""; // Briše unos lozinke
                showGameForm(false, true); // Prikazuje poruku o pogrešci
            }
        }
    };
    xhr.send(JSON.stringify(js_obj));
}


function logout() {
    if (gameInProgress) {
        showLoginText.innerHTML = "Igra još traje!";
        setTimeout(() => {
            showLoginText.innerHTML = `Bok, ${username}!`;
        }, 4000);
        return;
    }

    showLoginDiv.style.display = "none";
    loginFlag = false;
    username = null;
    showFrontPage();
}

function Board(x, y) {
    this.boardQuantityArray = [];
    this.xMax = x;
    this.yMax = y;

    this.createBoard = function () {
        this.boardDiv = document.createElement("div");
        this.boardDiv.id = "boardDiv";
        this.boardDiv.className = "boardDiv";
        this.boardDiv.style.width = `${90 * this.xMax}px`;
        gameDiv.appendChild(this.boardDiv);

        for (let i = 0; i < this.yMax; i++) {
            this.boardQuantityArray.push(i + 1);
            let tempDiv = document.createElement("div");
            tempDiv.id = `cellDiv${i}`;
            tempDiv.className = "cellDiv";

            for (let j = i; j >= 0; j--) {
                let piece = new Piece(i, j);
                tempDiv.appendChild(piece.html);
            }
            this.boardDiv.appendChild(tempDiv);
        }
    };
}

function NimGame(firstPlayer, boardSize, gameVersion, difficulty) {
    this.firstPlayer = firstPlayer;
    this.boardSize = boardSize;
    this.gameVersion = gameVersion;
    this.difficulty = difficulty;

    this.initiateGame = function () {
    this.board = new Board(this.boardSize, this.boardSize); // Kreira novu ploču za igru
    this.pc = new PC(this.gameVersion, this.difficulty); // Inicijalizira protivnika (računalo)
    this.moves = 0; // Broj poteza se resetira na 0

    gameInProgress = true; // Označava da je igra u tijeku
    resetGameDiv(); // Resetira HTML element za igru

    // Kreira novi <h1> element za prikaz trenutnog igrača
    let messageH = document.createElement("h1");
    messageH.id = "messageH1";
    messageH.style.position = "relative";
    messageH.style.textAlign = "center";
    messageH.style.marginTop = "5px";
    gameDiv.appendChild(messageH);

    this.board.createBoard(); // Kreira ploču na osnovu zadanih dimenzija
    showGameDiv(); // Prikazuje HTML element za igru

    leaveGameDiv.style.display = "block"; // Prikazuje gumb za povratak

    // Postavlja funkcionalnost za gumb "Povratak na naslovnu stranicu"
    let backButton = document.getElementById("leaveGameButton");
    backButton.style.display = "block"; // Gumb je uvijek vidljiv tijekom igre
    backButton.onclick = () => {
        if (gameInProgress) this.leave(); // Prekida igru ako je u tijeku
        showFrontPage(); // Povratak na naslovnu stranicu
        backButton.style.display = "none"; // Sakriva gumb nakon povratka
    };

    this.updateMessageDiv(); // Prikazuje trenutnog igrača na početku igre

    // Ako računalni igrač počinje prvi, pokreće njegov potez
    if (this.firstPlayer === "pc") {
        setTimeout(() => this.pc.move(), 1500); // Računalo pravi potez s malim zakašnjenjem
    }
};

this.updateMessageDiv = function () {
    // Određuje tko je trenutno na potezu
    let currentPlayer = ((this.moves % 2 === 0 && this.firstPlayer === "player") || 
        (this.moves % 2 !== 0 && this.firstPlayer !== "player")) ? username : "Računalo";
    document.getElementById("messageH1").innerText = currentPlayer; // Ažurira tekst <h1> elementa
};


    this.deletePiece = function (x, y) {
        for (let i = y; i < this.board.boardQuantityArray[x]; i++) {
            document.getElementById(`piece${x}|${i}`).className = "pieceDeleted";
        }
        this.board.boardQuantityArray[x] = y;

        if (this.checkGameOver()) {
            this.endGame();
            return;
        }

        this.moves++;
        if (gameInProgress) this.updateMessageDiv();

        if ((this.moves % 2 === 0 && this.firstPlayer === "pc") || (this.moves % 2 !== 0 && this.firstPlayer !== "pc")) {
            setTimeout(() => this.pc.move(), 1500);
        }
    };

    this.checkGameOver = function () {
        return this.board.boardQuantityArray.every(q => q === 0);
    };

    this.endGame = function () {
        let json = JSON.parse(localStorage[username]);
        let playerWon = (this.moves % 2 === 0 && this.firstPlayer === "player") || 
                        (this.moves % 2 !== 0 && this.firstPlayer !== "player");

        if (this.gameVersion === "misere") {
            playerWon = !playerWon;
        }
    
        json.games++;
        if (playerWon) json.victories++;
        localStorage[username] = JSON.stringify(json);
    
        let messageH1 = document.getElementById("messageH1");
    
        // Ažuriranje poruke i primjena stilova
        messageH1.innerHTML = playerWon 
            ? "Pobijedili ste! 😊" 
            : "Izgubili ste... 😢";
        messageH1.style.position = "absolute";
        messageH1.style.top = "50%";
        messageH1.style.left = "50%";
        messageH1.style.transform = "translate(-50%, -50%)";
        messageH1.style.fontSize = "2rem";
        messageH1.style.textAlign = "center";
    
        gameInProgress = false;
    
        let startButton = document.getElementById("gumbic");
        startButton.onclick = () => showGameForm(true, true);
        startButton.classList.remove("disabled");
    };
    
    

    this.leave = function () {
        console.log("Napustili ste igru.");
        gameInProgress = false;
        resetGameDiv();
        showFrontPage();
    };
}

function PC(gameVersion, difficulty) {
    this.gameVersion = gameVersion;
    this.difficulty = difficulty;

    this.move = function () {
        if (this.difficulty === "easy") {
            this.randomMove();
        } else {
            this.hardMove();
        }
    };

    this.randomMove = function () {
        let x;
        do {
            x = Math.floor(Math.random() * mainGame.board.boardQuantityArray.length);
        } while (mainGame.board.boardQuantityArray[x] === 0);

        let y = Math.floor(Math.random() * mainGame.board.boardQuantityArray[x]);
        mainGame.deletePiece(x, y);
    };

    this.hardMove = function () {
        const piles = [...mainGame.board.boardQuantityArray];
        const nonZeroPiles = piles.filter(p => p > 0);
        const ones = nonZeroPiles.filter(p => p === 1).length;
        const moreThanOne = nonZeroPiles.filter(p => p > 1).length;
        const totalPiles = nonZeroPiles.length;

        // 1. Posebni slučaj - samo jedna hrpa
        if (totalPiles === 1) {
            const index = piles.indexOf(nonZeroPiles[0]);
            if (nonZeroPiles[0] > 1) {
                // U misère verziji, uzmi sve osim 1 da protivnik uzme zadnji
                mainGame.deletePiece(index, nonZeroPiles[0] - 1);
            } else {
                mainGame.deletePiece(index, 0);
            }
            return;
        }

        // 2. Misère završna strategija
        if (this.gameVersion === "misere" && moreThanOne <= 1) {
            // Ako postoji točno jedna hrpa >1
            if (moreThanOne === 1) {
                const bigPileIndex = piles.findIndex(p => p > 1);
                const bigPileSize = piles[bigPileIndex];
                
                // Strategija produžavanja igre:
                if (ones > 0) {
                    // Ako ima hrpi od 1, smanji veliku hrpu na 1 ili 0 ovisno o parnosti
                    const target = (ones % 2 === 0) ? 1 : 0;
                    mainGame.deletePiece(bigPileIndex, target);
                } else {
                    // Ako je samo jedna hrpa >1 i nema hrpi od 1, uzmi sve osim 1
                    mainGame.deletePiece(bigPileIndex, bigPileSize - 1);
                }
                return;
            }
            // Sve hrpe su veličine 1
            else {
                if (totalPiles % 2 === 0) {
                    // Uzmi jednu hrpu da ostaviš neparan broj
                    const index = piles.indexOf(1);
                    mainGame.deletePiece(index, 0);
                } else {
                    // Produži igru uzimajući minimalno moguće
                    const index = piles.indexOf(1);
                    if (totalPiles > 1) {
                        mainGame.deletePiece(index, 0);
                    } else {
                        // Mora uzeti zadnju
                        mainGame.deletePiece(index, 0);
                    }
                }
                return;
            }
        }

        // 3. Normalna Nim strategija (XOR) s produženjem igre
        const xorSum = piles.reduce((a, b) => a ^ b, 0);
        if (xorSum !== 0) {
            // Pronađi potez koji ostavlja XOR 0 i maksimizira broj preostalih hrpi
            let bestMove = null;
            let maxRemainingPiles = -1;
            
            for (let i = 0; i < piles.length; i++) {
                if (piles[i] > 0) {
                    const target = piles[i] ^ xorSum;
                    if (target < piles[i]) {
                        // Simuliraj potez
                        const tempPiles = [...piles];
                        tempPiles[i] = target;
                        const remainingPiles = tempPiles.filter(p => p > 0).length;
                        
                        // Odaberi potez koji ostavlja najviše hrpi
                        if (remainingPiles > maxRemainingPiles) {
                            maxRemainingPiles = remainingPiles;
                            bestMove = { index: i, target };
                        }
                    }
                }
            }
            
            if (bestMove) {
                mainGame.deletePiece(bestMove.index, bestMove.target);
                return;
            }
        }

        // 4. Ako nema dobrog poteza, napravi potez koji najviše produžava igru
        let bestRandomMove = null;
        let maxPilesAfterMove = -1;
        
        for (let i = 0; i < piles.length; i++) {
            if (piles[i] > 0) {
                for (let j = 0; j < piles[i]; j++) {
                    const tempPiles = [...piles];
                    tempPiles[i] = j;
                    const remainingPiles = tempPiles.filter(p => p > 0).length;
                    
                    if (remainingPiles > maxPilesAfterMove) {
                        maxPilesAfterMove = remainingPiles;
                        bestRandomMove = { index: i, target: j };
                    }
                }
            }
        }
        
        if (bestRandomMove) {
            mainGame.deletePiece(bestRandomMove.index, bestRandomMove.target);
        } else {
            this.randomMove();
        }
    };



    this.xor = function () {
        return mainGame.board.boardQuantityArray.reduce((acc, curr) => acc ^ curr, 0);
    };
}

function Piece(x, y) {
    this.html = document.createElement("img");
    this.html.className = "piece";
    this.html.id = `piece${x}|${y}`;
    this.html.src = "piece.png";

    this.html.onmouseover = function () {
        if (this.className !== "pieceDeleted" && ((mainGame.moves % 2 === 0 && mainGame.firstPlayer === "player") || (mainGame.moves % 2 !== 0 && mainGame.firstPlayer !== "player"))) {
            highlightPieces(this.id, true);
        }
    };

    this.html.onmouseleave = function () {
        if (this.className !== "pieceDeleted" && ((mainGame.moves % 2 === 0 && mainGame.firstPlayer === "player") || (mainGame.moves % 2 !== 0 && mainGame.firstPlayer !== "player"))) {
            highlightPieces(this.id, false);
        }
    };

    this.html.onclick = function () {
        if (this.className !== "pieceDeleted" && ((mainGame.moves % 2 === 0 && mainGame.firstPlayer === "player") || (mainGame.moves % 2 !== 0 && mainGame.firstPlayer !== "player"))) {
            let [x, y] = this.id.replace("piece", "").split("|").map(Number);
            mainGame.deletePiece(x, y);
        }
    };

    function highlightPieces(id, hover) {
        let [x, y] = id.replace("piece", "").split("|").map(Number);
        for (; y < mainGame.board.boardQuantityArray[x]; y++) {
            document.getElementById(`piece${x}|${y}`).className = hover ? "pieceHovered" : "piece";
        }
    }
}
