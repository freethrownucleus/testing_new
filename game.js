// Globalne varijable
let username, password;
let loginFlag = false, gameInProgress = false;
let timer;
let timeLeft;
let timerEnabled = false;
let mainGame;
let url = "http://localhost:8080/";
let divsArray = ["homePageDiv", "gameFormDiv", "gameDiv", "rankingDiv", "rulesDiv"];

// Inicijalizacija DOM elemenata
function initElements() {
    // Get all necessary elements
    window.homePageDiv = document.getElementById("homePageDiv");
    window.gameFormDiv = document.getElementById("gameFormDiv");
    window.gameDiv = document.getElementById("gameDiv");
    window.rankingDiv = document.getElementById("rankingDiv");
    window.rulesDiv = document.getElementById("rulesDiv");
    window.loginDiv = document.getElementById("loginDiv");
    window.optionsDiv = document.getElementById("optionsDiv");
    window.userInputForm = document.getElementById("userInputForm");
    window.boardSizeForm = document.getElementById("boardSizeForm");
    window.wrongPasswordText = document.getElementById("wrongPasswordText");
    window.userInput = document.getElementById("userInput");
    window.passwordInput = document.getElementById("passwordInput");
    window.tableRankingDiv = document.getElementById("tableRankingDiv");
    window.showLoginDiv = document.getElementById("user-profile");
    window.showLoginText = document.getElementById("username-display");
    window.leaveGameButton = document.getElementById("leaveGameButton");
    window.restartGameButton = document.getElementById("restartGameButton");
    window.timerDisplay = document.getElementById("timerDisplay");
    window.messageH1 = document.getElementById("messageH1");

    // Set up event listeners
    if (userInputForm) {
        userInputForm.addEventListener("submit", function(e) {
            e.preventDefault();
            login();
        });
    }

    // Dodajemo event listener za Enter tipku u oba polja
    [userInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    login();
                }
            });
        }
    });
    
    // Initialize form values
    resetGameOptions();
}

function resetGameOptions() {
    // Set default values for game options
    if (document.querySelector('input[name="playFirstButton"][value="player"]')) {
        document.querySelector('input[name="playFirstButton"][value="player"]').checked = true;
    }
    if (document.getElementById("boardSizeInput")) {
        document.getElementById("boardSizeInput").value = "2";
    }
    if (document.querySelector('input[name="gameVersion"][value="standard"]')) {
        document.querySelector('input[name="gameVersion"][value="standard"]').checked = true;
    }
    if (document.querySelector('input[name="difficulty"][value="easy"]')) {
        document.querySelector('input[name="difficulty"][value="easy"]').checked = true;
    }
    if (document.querySelector('input[name="timerOption"][value="none"]')) {
        document.querySelector('input[name="timerOption"][value="none"]').checked = true;
    }
}

// Rukovanje klikom na gumb za igru
function handlePlayButton() {
    if (loginFlag) {
        showGameForm(true, true);
    } else {
        showGameForm(true, false);
    }
}

// Prikaz početne stranice
function showFrontPage() {
    hideAllScreens();
    if (!loginFlag && homePageDiv) {
        homePageDiv.classList.add("active");
    } else {
        // If logged in, show game form instead
        showGameForm(true, true);
    }
    updateLoginDisplay();
}

// Prikaz forme za igru
function showGameForm(goodPassword = true, showOptions = false) {
    hideAllScreens();
    if (gameInProgress) leaveGame();
    
    if (gameFormDiv) {
        gameFormDiv.classList.add("active");
        
        // Show/hide appropriate sections
        if (loginDiv) loginDiv.style.display = (loginFlag || showOptions) ? "none" : "block";
        if (optionsDiv) optionsDiv.style.display = (loginFlag || showOptions) ? "block" : "none";
        
        // Reset form values
        if (userInputForm) userInputForm.reset();
        resetGameOptions();
    }
    
    updateLoginDisplay();
    if (wrongPasswordText) wrongPasswordText.style.display = goodPassword ? "none" : "block";
}

// Sakrij sve ekrane
function hideAllScreens() {
    divsArray.forEach(divId => {
        const element = document.getElementById(divId);
        if (element) element.classList.remove("active");
    });
}

// Prikaz igre
function showGameDiv() {
    hideAllScreens();
    if (gameDiv) gameDiv.classList.add("active");
}

// Resetiraj div igre
function resetGameDiv() {
    const gameBoardContainer = document.querySelector(".game-board-container");
    if (gameBoardContainer) {
        gameBoardContainer.innerHTML = "";  // Potpuno očisti ploču
        gameBoardContainer.style.display = "block";  // Osiguraj da je vidljiva
    }
    
    if (timerDisplay) {
        timerDisplay.style.display = "none";
    }
    
    if (messageH1) {
        messageH1.textContent = "";
        messageH1.className = "game-status";
        messageH1.style.display = "block";
    }
}

// Prikaz rang liste
function showRanks() {
    if (gameInProgress) leaveGame();
    hideAllScreens();
    if (rankingDiv) rankingDiv.classList.add("active");

    let players = [];
    for (let i = 0; i < localStorage.length; i++) {
        let jsonUsername = localStorage.key(i);
        let json = JSON.parse(localStorage.getItem(jsonUsername));

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

    players.sort((a, b) => {
        if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
        if (b.victories !== a.victories) return b.victories - a.victories;
        return a.username.localeCompare(b.username);
    });

    players = players.slice(0, 10);

    let finalText = `
        <table class="rankings-table">
            <thead>
                <tr>
                    <th>Igrač</th>
                    <th>Ukupno</th>
                    <th>Pobjeda</th>
                    <th>Poraz</th>
                    <th>Omjer</th>
                </tr>
            </thead>
            <tbody>
                ${players.map(player => `
                    <tr>
                        <td>${player.username}</td>
                        <td>${player.games}</td>
                        <td>${player.victories}</td>
                        <td>${player.losses}</td>
                        <td>${player.winPercentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    if (tableRankingDiv) tableRankingDiv.innerHTML = finalText;
}

// Prikaz pravila
function showRules() {
    if (gameInProgress) leaveGame();
    hideAllScreens();
    if (rulesDiv) rulesDiv.classList.add("active");
}

// Pokreni igru - ISPRAVLJENA FUNKCIJA
function playGame(event) {
    if (event) event.preventDefault();
    
    if (!loginFlag) {
        alert("Morate se prijaviti prije početka igre!");
        showGameForm(true, false);
        return false;
    }

    // Ovo je novi dio - resetiranje prije nove igre
    if (gameInProgress) {
        leaveGame();  // Prvo završi trenutnu igru
        setTimeout(() => {
            initNewGame();  // Započni novu igru nakon kašnjenja
        }, 100);
        return false;
    } else {
        initNewGame();
        return false;
    }
}

// Nova pomoćna funkcija
function initNewGame() {
    resetGameDiv();  // Očisti ploču
    
    const firstPlayer = document.querySelector('input[name="playFirstButton"]:checked')?.value || "player";
    const boardSize = parseInt(document.getElementById("boardSizeInput")?.value) || 2;
    const gameVersion = document.querySelector('input[name="gameVersion"]:checked')?.value || "standard";
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    const timerOption = document.querySelector('input[name="timerOption"]:checked')?.value || "none";

    mainGame = new NimGame(firstPlayer, boardSize, gameVersion, difficulty, timerOption !== "none", timerOption !== "none" ? parseInt(timerOption) : 0);
    mainGame.initiateGame();
}

function restartGame() {
    // Vrati ploču i timer
    const gameBoardContainer = document.querySelector(".game-board-container");
    if (gameBoardContainer) {
        gameBoardContainer.style.display = "";
    }
    if (timerDisplay) {
        timerDisplay.style.display = "";
    }
    
    // Vrati sve gumbe
    const allButtons = document.querySelectorAll('.game-controls button');
    allButtons.forEach(btn => {
        btn.style.display = '';
    });
    
    // Resetiraj poruku
    if (messageH1) {
        messageH1.className = "game-status";
        messageH1.style.display = "";
    }
    
    // Ostatak postojeće logike
    if (!gameInProgress) {
        playGame();
        return;
    }

    if (mainGame && mainGame.currentTimer) {
        clearInterval(mainGame.currentTimer);
        mainGame.currentTimer = null;
    }

    const firstPlayer = document.querySelector('input[name="playFirstButton"]:checked')?.value || "player";
    const boardSize = parseInt(document.getElementById("boardSizeInput")?.value) || 2;
    const gameVersion = document.querySelector('input[name="gameVersion"]:checked')?.value || "standard";
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    const timerOption = document.querySelector('input[name="timerOption"]:checked')?.value || "none";
    const timerEnabled = timerOption !== "none";
    const timeLimit = timerEnabled ? parseInt(timerOption) : 0;

    setTimeout(() => {
        mainGame = new NimGame(firstPlayer, boardSize, gameVersion, difficulty, timerEnabled, timeLimit);
        mainGame.initiateGame();
        
        if (mainGame.pcTimeout) {
            clearTimeout(mainGame.pcTimeout);
            mainGame.pcTimeout = null;
        }
    }, 100);
}

// Prijava korisnika
function login() {
    username = userInput.value;
    password = passwordInput.value;

    let js_obj = { "nick": username, "pass": password };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "register", true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loginFlag = true;
                updateLoginDisplay();
                if (!localStorage[username]) {
                    localStorage[username] = JSON.stringify({ victories: 0, games: 0 });
                }
                showGameForm(true, true);
            } else if (xhr.status === 400) {
                if (userInput) userInput.value = "";
                if (passwordInput) passwordInput.value = "";
                showGameForm(false, false);
            }
        }
    };
    xhr.send(JSON.stringify(js_obj));
}

// Odjava korisnika
function logout() {
    if (gameInProgress) {
        if (showLoginText) {
            showLoginText.textContent = "Igra još traje!";
            setTimeout(() => {
                if (showLoginText) showLoginText.textContent = username;
            }, 4000);
        }
        return;
    }

    loginFlag = false;
    username = null;
    updateLoginDisplay();
    showFrontPage(); // This will now properly show the home page
}

// Ažuriraj prikaz prijave
function updateLoginDisplay() {
    if (showLoginDiv) {
        showLoginDiv.style.display = loginFlag ? "flex" : "none";
        if (showLoginText) showLoginText.textContent = loginFlag ? username : "";
    }
    
    // Hide home page if logged in
    if (loginFlag && homePageDiv && homePageDiv.classList.contains("active")) {
        homePageDiv.classList.remove("active");
        showGameForm(true, true);
    }
}

// Napusti igru
function leaveGame() {
    if (gameInProgress) {
        mainGame.leave();
        resetGameDiv();
        gameInProgress = false;
    }
    showFrontPage();
}

// Klasa za ploču igre
function Board(size) {
    this.size = size;
    this.boardQuantityArray = [];
    
    this.createBoard = function() {
        const boardContainer = document.querySelector(".game-board-container");
        if (!boardContainer) return;
        
        boardContainer.innerHTML = "";
        
        const boardDiv = document.createElement("div");
        boardDiv.className = "board";
        
        for (let row = 0; row < this.size; row++) {
            const coinsInRow = row * 2 + 1;
            this.boardQuantityArray.push(coinsInRow);

            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            
            // Add spaces for pyramid shape
            const spaces = this.size - 1 - row;
            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("div");
                space.className = "coin-space";
                rowDiv.appendChild(space);
            }
            
            // Add coins
            for (let col = 0; col < coinsInRow; col++) {
                const piece = new Piece(row, col);
                rowDiv.appendChild(piece.html);
            }
            
            boardDiv.appendChild(rowDiv);
        }
        
        boardContainer.appendChild(boardDiv);
    };
}


// Klasa za igru - ISPRAVLJENA
function NimGame(firstPlayer, boardSize, gameVersion, difficulty, timerEnabled, timeLimit) {
    this.firstPlayer = firstPlayer;
    this.boardSize = boardSize;
    this.gameVersion = gameVersion;
    this.difficulty = difficulty;
    this.timerEnabled = timerEnabled;
    this.timeLimit = timeLimit;
    this.currentTimer = null;
    this.timeLeft = 0;
    this.playerTurn = false;
    this.moves = 0; // Dodano inicijaliziranje poteza

    this.initiateGame = function() {
        // Resetiraj stanje
        this.moves = 0;
        this.playerTurn = (this.firstPlayer === "player");
        
        // Postavi globalno stanje
        gameInProgress = true;  // OVO JE KLJUČNO - postavimo da igra traje
        
        // Kreiraj ploču
        this.board = new Board(this.boardSize);
        this.pc = new PC(this.gameVersion, this.difficulty);
        
        // Očisti prethodnu igru
        resetGameDiv();
        
        // Postavi timer display samo ako je timer omogućen
        if (this.timerEnabled && timerDisplay) {
            if (this.playerTurn) {
                timerDisplay.style.display = "block";
                this.startPlayerTimer();
            } else {
                timerDisplay.textContent = "Na redu je računalo";
                timerDisplay.style.display = "block";
            }
        }

        // Kreiraj ploču
        this.board.createBoard();
        
        // Prikaži gameDiv
        showGameDiv();
        
        // Ažuriraj status
        this.updateGameState();

        // Ako računalo igra prvo
        if (this.firstPlayer === "pc") {
            setTimeout(() => {
                if (gameInProgress) {
                    this.pc.move();
                }
            }, 1500);
        }
    };

    this.startPlayerTimer = function() {
        // POTPUNO ZAUSTAVI SVE PRETHODNE TIMERE
        this.clearTimer();
        clearInterval(this.currentTimer);
        this.currentTimer = null;
        
        if (!this.timerEnabled || !gameInProgress || !this.playerTurn) {
            return;
        }
        
        this.timeLeft = this.timeLimit;
        this.updateTimerDisplay();
        
        this.currentTimer = setInterval(() => {
            if (!gameInProgress || !this.playerTurn) {
                this.clearTimer();
                return;
            }
            
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeOut();
            }
        }, 1000);
    };

    this.clearTimer = function() {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
        }
        // Dodatno osiguranje - poništi sve intervalne timere
        let id = window.setInterval(function(){}, 9999);
        while (id--) {
            window.clearInterval(id);
        }
    };

    this.updateTimerDisplay = function() {
        if (!this.timerEnabled || !timerDisplay || !this.playerTurn) {
            // Sakrij timer ako nije korisnikov red ili timer nije omogućen
            if (timerDisplay) timerDisplay.style.display = this.playerTurn ? "block" : "none";
            return;
        }
        
        // Prikaži timer samo ako je korisnikov red
        timerDisplay.style.display = "block";
        timerDisplay.textContent = `Još ${this.timeLeft} sekundi za ${username}`;
        timerDisplay.className = "";
        timerDisplay.style.fontSize = "20px";
        
        if (this.timeLeft <= 3) {
            timerDisplay.classList.add("time-critical");
        } else if (this.timeLeft <= this.timeLimit / 2) {
            timerDisplay.classList.add("time-warning");
        }
    };

    this.handleTimeOut = function() {
        // Potpuno zaustavi sve timere prije kraja
        this.clearTimer();
        clearInterval(this.currentTimer);
        this.currentTimer = null;
        
        if (!gameInProgress) return;
        
        // Blokiraj sve novčiće
        const allCoins = document.querySelectorAll('.coin:not(.removed)');
        allCoins.forEach(coin => {
            coin.style.pointerEvents = 'none';
        });
        
        if (messageH1) messageH1.textContent = "Vrijeme je isteklo! Izgubili ste... 😢";
        
        let json = JSON.parse(localStorage[username] || '{"victories":0,"games":0}');
        json.games++;
        localStorage[username] = JSON.stringify(json);
        
        gameInProgress = false;
        this.playerTurn = false; // Dodajemo eksplicitno postavljanje da nije igračev red
    };

    this.updateGameState = function() {
        this.playerTurn = ((this.moves % 2 === 0 && this.firstPlayer === "player") || 
                    (this.moves % 2 !== 0 && this.firstPlayer !== "player"));
    
        // Disable/enable pointer events for all coins based on whose turn it is
        const allCoins = document.querySelectorAll('.coin:not(.removed)');
        allCoins.forEach(coin => {
            coin.style.pointerEvents = this.playerTurn ? 'auto' : 'none';
            if (!this.playerTurn) {
                coin.classList.remove("selected"); // Ukloni hover efekte ako postoje
            }
        });
        // POTPUNO ZAUSTAVI SVE TIMERE PRIJE PROMJENE STANJA
        this.clearTimer();
        clearInterval(this.currentTimer);
        this.currentTimer = null;

        if (messageH1) {
            messageH1.textContent = this.playerTurn ? `${username} (Vi)` : "Računalo";
            messageH1.className = "game-status " + (this.playerTurn ? "player-turn" : "pc-turn");
        }

        if (this.timerEnabled) {
            if (this.playerTurn) {
                if (timerDisplay) {
                    timerDisplay.style.display = "block";
                    this.startPlayerTimer();
                    timerDisplay.textContent = `Još ${this.timeLeft} sekundi za ${username}`;
                    timerDisplay.style.fontSize = "20px";
                }
            } else {
                if (timerDisplay) {
                    timerDisplay.textContent = "Računalo razmišlja...";
                    timerDisplay.style.display = "block";
                    timerDisplay.className = "";
                    timerDisplay.style.fontSize = "20px";
                }
            }
        } else {
            // Ako timer nije omogućen, prikaži samo tko je na potezu
            if (timerDisplay) {
                timerDisplay.textContent = this.playerTurn ? `${username} razmišlja...` : "Računalo razmišlja...";
                timerDisplay.style.display = "block";
                timerDisplay.className = "";
                timerDisplay.style.fontSize = "20px";
            }
        }
    };

    this.deletePiece = function(row, col) {
        if (!gameInProgress) return;
        
        // AGRESIVNO ZAUSTAVI TIMER PRIJE BILO KAKVE PROMJENE
        this.clearTimer();
        clearInterval(this.currentTimer);
        this.currentTimer = null;
        
        // Provjeri je li redak već prazan
        if (this.board.boardQuantityArray[row] === 0) {
            return; // Preskoči ako je redak već prazan
        }
        
        const coinsInRow = this.board.boardQuantityArray[row];
        const coinsToRemove = coinsInRow - col;
        
        // Validacija poteza
        if (coinsToRemove <= 0 || coinsToRemove > coinsInRow || col < 0) {
            console.error("Nevažeći potez:", {row, col, coinsInRow});
            return;
        }
        
        // Oznaci novčiće kao uklonjene
        for (let i = coinsInRow - 1; i >= col; i--) {
            const piece = document.getElementById(`piece${row}|${i}`);
            if (piece) {
                piece.classList.add("removed");
                piece.style.pointerEvents = "none";
            }
        }
        
        // Ažuriraj stanje ploče
        this.board.boardQuantityArray[row] = col;
        
        // Provjeri kraj igre
        if (this.checkGameOver()) {
            this.endGame();
            return;
        }
        
        this.moves++;
        this.updateGameState();
        
        if (!this.playerTurn && gameInProgress) {
            if (timerDisplay) {
                timerDisplay.textContent = "Računalo razmišlja...";
                timerDisplay.style.display = "block";
                timerDisplay.className = "";
                
            }
            
            this.pcTimeout = setTimeout(() => {
                if (gameInProgress) {
                    this.pc.move();
                }
            }, 1500);
        }
    };

    this.checkGameOver = function() {
        return this.board.boardQuantityArray.every(q => q === 0);
    };

    this.endGame = function() {
        this.clearTimer();
        
        let json = JSON.parse(localStorage[username] || '{"victories":0,"games":0}');
        let playerWon = this.playerTurn;
        
        if (this.gameVersion === "misere") {
            playerWon = !playerWon;
        }
        
        json.games++;
        if (playerWon) json.victories++;
        localStorage[username] = JSON.stringify(json);
        
        // Potpuno sakrij ploču i timer
        const gameBoardContainer = document.querySelector(".game-board-container");
        if (gameBoardContainer) {
            gameBoardContainer.style.display = "none";
        }
        if (timerDisplay) {
            timerDisplay.style.display = "none";
        }
        
        // Postavi poruku o rezultatu
        if (messageH1) {
            messageH1.textContent = playerWon ? "Pobijedili ste! 😊" : "Izgubili ste, više sreće sljedeći put... 😢";
            messageH1.className = "game-status end-game-message " + (playerWon ? "win" : "lose");
            messageH1.style.display = "block";
            messageH1.style.fontSize = "32px";
        }
        
        // Prikaži trofej ako je pobjeda
        const trophy = document.getElementById("trophy");
        if (trophy) {
            if (playerWon) {
                trophy.classList.remove("hidden");
                setTimeout(() => {
                    trophy.classList.add("hidden");
                }, 3000);
            } else {
                trophy.classList.add("hidden");
            }
        }
        
        // Sakrij sve nepotrebne gumbe osim restart i leave
        const allButtons = document.querySelectorAll('.game-controls button');
        allButtons.forEach(btn => {
            if (btn.id !== 'restartGameButton' && btn.id !== 'leaveGameButton') {
                btn.style.display = 'none';
            }
        });
        
        gameInProgress = false;
    };

    this.leave = function() {
        gameInProgress = false;
        this.clearTimer();
        resetGameDiv();
    };
}

// Klasa za računalnog igrača
function PC(gameVersion, difficulty) {
    this.gameVersion = gameVersion;
    this.difficulty = difficulty;

    this.move = function() {
        const nonZeroPiles = mainGame.board.boardQuantityArray.filter(p => p > 0);
        
        if (this.difficulty === "hard") {
            // Uvijek igraj optimalno za "hard"
            this.hardMove();
        } 
        else if (nonZeroPiles.length <= 3) {
            // Za "easy": ako je <=3 retka, igraj optimalno
            this.hardMove();
        } 
        else {
            // Inače (više od 3 retka + "easy"), igraj nasumično
            this.randomMove();
        }
    };

    this.randomMove = function() {
        let x;
        do {
            x = Math.floor(Math.random() * mainGame.board.boardQuantityArray.length);
        } while (mainGame.board.boardQuantityArray[x] === 0);

        let y = Math.floor(Math.random() * mainGame.board.boardQuantityArray[x]);
        mainGame.deletePiece(x, y);
    };

    this.hardMove = function() {
        const piles = [...mainGame.board.boardQuantityArray];
        const nonZeroPiles = piles.filter(p => p > 0);
        const ones = nonZeroPiles.filter(p => p === 1).length;
        const moreThanOne = nonZeroPiles.filter(p => p > 1).length;
        const totalPiles = nonZeroPiles.length;

        if (totalPiles === 1) {
            const index = piles.indexOf(nonZeroPiles[0]);
            if (nonZeroPiles[0] > 1) {
                mainGame.deletePiece(index, nonZeroPiles[0] - (this.gameVersion === "misere" ? 0 : 1));
            } else {
                mainGame.deletePiece(index, 0);
            }
            return;
        }

        if (this.gameVersion === "misere" && moreThanOne <= 1) {
            if (moreThanOne === 1) {
                const bigPileIndex = piles.findIndex(p => p > 1);
                const bigPileSize = piles[bigPileIndex];
                
                if (ones > 0) {
                    const target = (ones % 2 === 0) ? 1 : 0;
                    mainGame.deletePiece(bigPileIndex, target);
                } else {
                    mainGame.deletePiece(bigPileIndex, bigPileSize - 1);
                }
                return;
            } else {
                if (totalPiles % 2 === 0) {
                    const index = piles.indexOf(1);
                    mainGame.deletePiece(index, 0);
                } else {
                    const index = piles.indexOf(1);
                    mainGame.deletePiece(index, totalPiles > 1 ? 0 : 0);
                }
                return;
            }
        }

        const xorSum = piles.reduce((a, b) => a ^ b, 0);
        if (xorSum !== 0) {
            for (let i = 0; i < piles.length; i++) {
                if (piles[i] > 0) {
                    const target = piles[i] ^ xorSum;
                    if (target < piles[i]) {
                        mainGame.deletePiece(i, target);
                        return;
                    }
                }
            }
        }

        this.randomMove();
    };
}

// Klasa za novčić
// Klasa za novčić
function Piece(x, y) {
    this.html = document.createElement("div");
    this.html.className = "coin";
    this.html.id = `piece${x}|${y}`;
    this.html.textContent = "●";
    this.html.style.transition = "opacity 0.1s ease, transform 0.1s ease";

    this.html.onmouseover = function() {
        if (!this.classList.contains("removed") && mainGame.playerTurn && gameInProgress) {
            highlightPieces(this.id, true);
        }
    };

    this.html.onmouseleave = function() {
        if (!this.classList.contains("removed") && mainGame.playerTurn && gameInProgress) {
            highlightPieces(this.id, false);
        }
    };

    this.html.onclick = function() {
        if (!this.classList.contains("removed") && mainGame.playerTurn && gameInProgress) {
            let [x, y] = this.id.replace("piece", "").split("|").map(Number);
            mainGame.deletePiece(x, y);
        }
    };

    function highlightPieces(id, hover) {
        let [x, y] = id.replace("piece", "").split("|").map(Number);
        for (; y < mainGame.board.boardQuantityArray[x]; y++) {
            const piece = document.getElementById(`piece${x}|${y}`);
            if (piece) {
                piece.classList.toggle("selected", hover);
            }
        }
    }
}

// Inicijalizacija kada se stranica učita
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    updateLoginDisplay(); // Check login state first
    showFrontPage(); // This will show home page only if not logged in
    
    // Dodaj event listener za gumb "Započni igru"
    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.addEventListener("click", playGame);
    }
});