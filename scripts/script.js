//custom debugger
var debug = true;
mylog = function() { if (debug) console.log.apply(console, arguments) };


//global variables
var count = 0;
var totalChances = 6;
var chosenWord; // chosen by computer
var chosenWordArray = [];
var guessedLetters = [];
var existingLetters = [];
var finalString = [];
var placeholder = "_";
var countPrompt = "";
var gameEnd = false;
var currentWinStreak = 0;
var currentLevel = urlEasy;
var currentDifficulty = "easy";

//set difficulty of game
var urlEasy = "http://cors-anywhere.herokuapp.com/http://app.linkedin-reach.io/words?difficulty=1";
var urlMedium = "http://cors-anywhere.herokuapp.com/http://app.linkedin-reach.io/words?difficulty=5";
var urlHard = "http://cors-anywhere.herokuapp.com/http://app.linkedin-reach.io/words?difficulty=10";


//set panda urls
var pWelcome = "imgs/panda-welcome.png";
var pSorry = "imgs/panda-sorry.png";
var pError = "imgs/panda-error.png";
var pCorrect = "imgs/panda-correct.png";
var pWrong = "imgs/panda-wrong.png";
var pSuccess = "imgs/panda-win.png";
var pNewGame = "imgs/panda-new-game.png";



//connect to APIht
function startGame(levelSelected, selectedDifficulty) {

    currentLevel = levelSelected;
    difficulty = selectedDifficulty;
    makeRequest();

    // create and send an XHR request
    function makeRequest() {
        httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = responseMethod;
        httpRequest.open('GET', levelSelected);
        httpRequest.send();
        mylog("Making Request to API...");
    }

    // handle XHR response
    function responseMethod() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                chooseWord(httpRequest.responseText); //success call chooseWord();
            } else {
                console.log("Error. Did not receive data.");
            }
        }
    }
}

//Chose a random word
function chooseWord(responseText) {
    var response = httpRequest.responseText;

    //convert retrieved list of words(string) to data to array
    var rListArray = response.split("\n");

    //get length of list
    var listLength = rListArray.length;
    mylog("The length of the list is " + listLength);

    //chose random number from list or words.  
    var i = parseInt(Math.random() * (rListArray.length - 1));
    mylog("the index of the word I chose is " + i);

    //assign chosen word
    chosenWord = rListArray[i].toUpperCase();
    mylog("The Word word I chose is " + chosenWord);

    //get number of letters in string
    chosenWordLength = chosenWord.length;
    mylog("The number of characters in the word is " + chosenWordLength);

    //assign underscore as placeholders
    for (i = 0; i <= chosenWordLength - 1; i++) {
        finalString.push(placeholder);
    }

    //convert chosenWord from string to array
    chosenWordArray = chosenWord.split('', chosenWordLength);
    mylog("The Chosen word array is " + chosenWordArray.join(' '));

    setupBoard();
}

function setupBoard() {

    //update HTML
    var instructionsMsg = "I've chosen a random word with " + '<span id="letterCount" class="green-inverted">' + chosenWordLength + '</span>' + " letters.";
    document.getElementById('instructions').innerHTML = instructionsMsg;
    document.getElementById('placeholders').innerHTML = finalString.join(' ');
    document.getElementById("main").style.visibility = "visible";
    document.getElementById("loadBar").style.visibility = "hidden";
    document.getElementById("guessedLetter").disabled = false;
    document.getElementById('countStatus').innerHTML = "You have " + '<span class="red">' + totalChances + '</span>' + " tries to guess what my word is.";
    document.getElementById("streakNum").innerHTML = currentWinStreak;
    document.getElementById("difficultyLevel").innerHTML = difficulty;
    document.getElementById("easterEgg").innerHTML = chosenWord;
    document.letterBox.letterField.focus();

    //animate letter count
    var numberAnimation = document.getElementById("letterCount");
    var numAnim = new CountUp(numberAnimation, 0, chosenWordLength, 0, 3);
    if (!numAnim.error) {
        numAnim.start();
    } else {
        console.error(numAnim.error);
    }
}


//evaluate the user's input
function evaluateEntry() {

    var userInput = document.getElementById("guessedLetter").value.toUpperCase();
    guessedLetters.push(userInput);

    //check if its # or punction using regx
    if (!userInput.match(/[a-zA-Z]/g)) {
        document.getElementById('errorStatus').innerHTML = "Invalid Entry";
        changeImage(pError);
        mylog("not a valid input");
    } else if (chosenWordArray.includes(userInput)) {
        if (existingLetters.includes(userInput)) {
            document.getElementById('errorStatus').innerHTML = "You've already selected that letter.";
            changeImage(pError);
        } else {
            mylog('Wow you guessed one of the letters which is ' + userInput);
            existingLetters.push(userInput);
            changeImage(pCorrect);
            updateBoardSuccess(userInput);
        }
    } else {
        if (existingLetters.includes(userInput)) {
            document.getElementById('errorStatus').innerHTML = "You've already selected that letter.";
            changeImage(pError);
        } else {
            count++;
            existingLetters.push(userInput);
            mylog(userInput + " is not part of the word " + chosenWord + " Try again.");
            document.getElementById('errorStatus').innerHTML = " ";
            updateBoardFail();
        }
    }
    //update HTML
    document.getElementById('placeholders').innerHTML = finalString.join(' ');
    document.getElementById("letterEntry").reset();
    document.getElementById('lettersGuessedTextBox').innerHTML = guessedLetters.join(" ");
}

//check if there are any matches
function updateBoardSuccess(userInput) {

    //check if the user got the whole word
    chosenWordArray.forEach(function(item, index) {
        if (userInput === item) {
            finalString[index] = userInput;
            if (chosenWordArray.join() === finalString.join()) {
                currentWinStreak++;
                document.getElementById("pandaHolder").classList.add("animated", "bounce", "infinite");
                document.getElementById('countStatus').innerHTML = '<span class="green-success sizeMed">' + "CONTRATS YOU GUESSED IT!!" + '<br>' + "The word is " + '<b>' + chosenWord + '</b>' + '</span>';
                document.getElementById("reset").innerHTML = "New Game";
                document.getElementById("reset").classList.add("animated", "pulse", "infinite");
                document.getElementById("guessedLetter").disabled = true;
                document.getElementById("streakNum").innerHTML = currentWinStreak;
                document.getElementById('errorStatus').innerHTML = " ";
                changeImage(pSuccess);
                mylog('You found all the letters and got my word.');
            } else {
                mylog('not all letters found yet...');
            }
        }
    });

}


//update board if no match
function updateBoardFail() {
    if (count !== totalChances) {
        var remainingCount = totalChances - count;
        countPrompt = "You have " + '<span class="red box">' + remainingCount + '</span>' + " chances to guess what it is.";
        document.getElementById('countStatus').innerHTML = countPrompt;
        changeImage(pWrong);
    } else {
        countPrompt = "You have no more guesses remaining";
        document.getElementById("guessedLetter").disabled = true;
        finalString = chosenWordArray; // show chosen word
        document.getElementById('placeholders').innerHTML = finalString;
        document.getElementById('countStatus').innerHTML = '<span class="red">' + "The word was " + chosenWord + '</span>';
        var resetBtn = document.getElementById("reset");
        resetBtn.classList.add("animated", "pulse", "infinite");
        resetBtn.innerHTML = "Try Again";
        currentWinStreak = 0;
        changeImage(pSorry);
    }
}

//change panda image
function changeImage(a) {
    document.getElementById("pandaHolder").src = a;
}

function resetGame(level, difficulty) {
    var newLevel = level;

    switch (difficulty) {
        case "easy":
            currentDifficulty = "easy";
            break;
        case "medium":
            currentDifficulty = "medium";
            break;
        case "hard":
            currentDifficulty = "hard";
            break;
        default:
            //do nothing
    }

    //reset values
    count = 0;
    totalChances = 6;
    finalString = [];
    chosenWordArray = [];
    guessedLetters = [];
    existingLetters = [];

    changeImage(pNewGame);

    //reset html prompts
    document.getElementById("lettersGuessedTextBox").innerHTML = "The letters you choose will go in here ";
    document.getElementById("loadBar").style.visibility = "visible";
    document.getElementById('errorStatus').innerHTML = " ";
    document.getElementById("reset").innerHTML = "Reset Game";
    document.getElementById("pandaHolder").className = " ";
    document.getElementById("reset").classList.remove("pulse", "infinite");
    document.getElementById("difficultyLevel").innerHTML = difficulty;
    startGame(newLevel, difficulty);
}

//init
startGame(urlEasy, 'easy');