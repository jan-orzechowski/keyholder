let Keyholder = {};

Keyholder.Game = function() {

    let gameCanvas;
    let gameCanvasContext;    
    let canvasWidthInTiles = 16;
    let canvasHeightInTiles = 9;

    let playerImage;
    let tilesImage;
    let imagesLoadingCompleted = false;

    let tileWidth = 16;
    let tileHeight = 24;
    let tileOffset = 1;

    let scale = 2;
    
    let map;

    // Game
    let playerX = 5;
    let playerY = 5;
    let keysInPossesion = [];

    let movementDisallowed = false;

    // Editor
    let editorCanvas;
    let editorCanvasContext;

    let tileUnderMouse;

    let tilePickerScale = 2;
    let colorPickerSize = 32;

    let currentEditorBrush = 0;
    let currentColorID = 0;
    let defaultTileType = 8;
    let defaultColorID = 14;

    let dragging = false;
    let nonDraggableTileTypes = [3, 4, 7, 9, 10, 11];

    let setStartPositionMode = false;

    let mapNameTextArea;
    
    window.onload = function () {
        
        let imagesDirectory = "../../Images/";
        let imagesToLoad = ["player.png", "tiles.png"];

        let images = loadImages(imagesToLoad, imagesDirectory);
        playerImage = images[0];
        tilesImage = images[1];       

        gameCanvas = document.getElementById("gameCanvas");
        if (!gameCanvas.getContext) {
            // Przeglądarka nie wspiera canvas
            return;
        }

        gameCanvas.width = canvasWidthInTiles * scale * tileWidth;
        gameCanvas.height = (canvasHeightInTiles + 1) * scale * tileWidth + (6 * scale);
        gameCanvasContext = gameCanvas.getContext("2d");
        disableSmoothing(gameCanvas);

        if (editorMode) {
            setColorPickerSize();

            editorCanvas = document.getElementById("editorCanvas");
            editorCanvas.height = 2 * scale * (tileHeight + tileOffset);
            editorCanvas.width = 7 * scale * (tileWidth + tileOffset);
            editorCanvasContext = editorCanvas.getContext("2d");
            disableSmoothing(editorCanvas);

            mapNameTextArea = document.getElementById("mapNameTextArea");
            mapNameTextArea.value = mapName;
           
            addEditorEvents();

            map = new Map();
            if (mapJsonObject !== null) {
                map.loadFromJson(mapJsonObject);
            } else {
                map.loadDefaultValues(16, 9);
            }
        }
        else {
            addGameEvents();

            map = new Map();
            map.loadFromJson(mapJsonObject);

            playerX = map.startX;
            playerY = map.startY;
        }

        gameLoop(0);
    };
   
    function gameLoop(currentTime) {
        window.requestAnimationFrame(gameLoop);
        render();
    }
       
    function render() {
        if (imagesLoadingCompleted === false) {
            return;
        }

        function drawTile(x, y, tileXInSpritesheet, tileYInSpritesheet) {
            let destinationX = x * tileWidth;
            let destinationY = y * tileWidth;

            let tileBitmapXCoord = tileXInSpritesheet * (tileWidth + tileOffset);
            let tileBitmapYCoord = tileYInSpritesheet * (tileHeight + tileOffset);

            gameCanvasContext.drawImage(tilesImage, tileBitmapXCoord, tileBitmapYCoord, tileWidth, tileHeight,
                destinationX * scale, destinationY * scale, tileWidth * scale, tileHeight * scale);
        }

        function drawTiles() {          
            for (let y = 0; y < map.height; y++) {
                for (let x = 0; x < map.width; x++) { 
                    let type = map.getTileType(x, y);
                    let offset = colorOffsets[map.getTileColor(x, y)];   
                   
                    if (type < 7) {
                        drawTile(x, y, type + (offset.x * 7), (offset.y * 2));                        
                    }
                    else {
                        drawTile(x, y, (type - 7) + (offset.x * 7), 1 + (offset.y * 2));
                    }

                    let mapObject;
                    let mapObjectOffset;
                    let mapObjectType;

                    mapObject = map.getKey(x, y);
                    if (mapObject !== undefined) {
                        mapObjectType = 9;
                    }
                    else {
                        mapObject = map.getGate(x, y);  
                        if (mapObject !== undefined) {
                            mapObjectType = 7;
                        }
                        else {
                            mapObject = map.getChest(x, y);                        
                            if (mapObject !== undefined) {
                                mapObjectType = 1;
                            }
                        }
                    }

                    if (mapObject !== undefined) {
                        mapObjectOffset = colorOffsets[mapObject.colorID];
                        if (mapObjectType < 7) {
                            drawTile(x, y, mapObjectType + (mapObjectOffset.x * 7), (mapObjectOffset.y * 2));
                        }
                        else {
                            drawTile(x, y, (mapObjectType - 7) + (mapObjectOffset.x * 7), 1 + (mapObjectOffset.y * 2));
                        }                    
                    }                    
                }

                if (editorMode) {
                    if (y === map.startY) {
                        drawStartingPoint();
                    }
                } else {
                    if (y === playerY) {
                        drawPlayer();
                    }
                }
            }
        }

        function drawKeys() {
            let lastX = 0;

            for (let i = 0; i < keysInPossesion.length; i++) {               
                let colorID = keysInPossesion[i];
                let colorOffset = colorOffsets[colorID];

                let tileBitmapXCoord = (2 + (colorOffset.x * 7)) * (tileWidth + tileOffset);
                let tileBitmapYCoord = (1 + (colorOffset.y * 2)) * (tileHeight + tileOffset);

                gameCanvasContext.drawImage(tilesImage, tileBitmapXCoord, tileBitmapYCoord, tileWidth, tileHeight,
                    lastX * scale, canvasHeightInTiles * tileWidth * scale, tileWidth * scale, tileHeight * scale);

                lastX += 16;
            }
        }

        function drawPlayer() {
            gameCanvasContext.drawImage(playerImage,
                playerX * tileWidth * scale, ((playerY * tileWidth) - 5) * scale, 16 * scale, 25 * scale);
        }

        function drawStartingPoint() {
            gameCanvasContext.drawImage(playerImage,
                map.startX * tileWidth * scale, ((map.startY * tileWidth) - 5) * scale, 16 * scale, 25 * scale);
        }

        gameCanvasContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        gameCanvasContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height); 

        drawTiles();

        if (editorMode) {
            drawEditorCanvas();
        } else {
            drawKeys();
        }
    }

    /*
     *      MAP
     */

    function Map() {

        this.startX = 0;
        this.startY = 0;

        this.width = 0;
        this.height = 0;

        this.tiles = [];

        this.keys = [];
        this.chests = [];
        this.gates = [];

        this.loadDefaultValues = function (width, height) {
            this.startX = 8;
            this.startY = 4;

            this.width = width;
            this.height = height;

            this.tiles = new Array(width * height);
            for (let i = 0; i < this.tiles.length; i++) {
                this.tiles[i] = [defaultTileType, defaultColorID];
            }
        };
        
        this.saveToJson = function () {
            return JSON.stringify(this);
        };

        this.loadFromJson = function (newMap) {
            this.startX = newMap.startX;
            this.startY = newMap.startY;

            this.width = newMap.width;
            this.height = newMap.height;

            this.tiles = newMap.tiles;

            this.keys = newMap.keys;
            this.chests = newMap.chests;
            this.gates = newMap.gates;
        };

        this.setTile = function (x, y, type, color) {
            if (this.checkBounds(x, y)) {
                let index = this.getTileIndex(x, y);
                this.tiles[index][0] = type;
                this.tiles[index][1] = color;
            }
        };

        this.getTileType = function (x, y) {
            let index = this.getTileIndex(x, y);
            return this.tiles[index][0];
        };

        this.getTileColor = function (x, y) {
            let index = this.getTileIndex(x, y);
            return this.tiles[index][1];
        };

        this.getTileIndex = function (x, y) {
            return (y * this.width) + x;
        };

        this.checkBounds = function (x, y) {
            let result = !(x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1);
            return result;
        };

        this.removeMapObject = function (x, y, array) {
            let mapObject = array.find(function (obj) {
                return (obj.x === x && obj.y === y);
            });
            if (mapObject !== undefined) {
                remove(array, mapObject);
                return true;
            }
            else {
                return false;
            }
        };

        this.removeObjectsFromTile = function (x, y) {
            return (this.removeMapObject(x, y, this.chests)
                || this.removeMapObject(x, y, this.keys)
                || this.removeMapObject(x, y, this.gates));
        };

        this.isTileBlocking = function (x, y) {
            if (this.checkBounds(x, y) === false) {
                return true;
            }
            else {
                let type = this.getTileType(x, y);
                return !(type === 8);
            }
        };

        this.isExit = function (x, y, approachDirection) {
            let type = this.getTileType(x, y);
            if (isTypeStairs(type)) {
                if (approachDirection === "N") {
                    return (type === 10);
                } else if (approachDirection === "E") {
                    return (type === 4);
                } else if (approachDirection === "S") {
                    return (type === 11);
                } else if (approachDirection === "W") {
                    return (type === 3);
                }
            }
            else return false;
        };

        this.addGate = function (x, y, colorID) {
            this.addMapObject(x, y, colorID, this.gates);
        };

        this.addKey = function (x, y, colorID) {
            this.addMapObject(x, y, colorID, this.keys);
        };

        this.addChest = function (x, y, colorID) {
            this.addMapObject(x, y, colorID, this.chests);
        };

        this.addMapObject = function (x, y, colorID, array) {
            this.removeObjectsFromTile(x, y);
            array.push(new MapObject(x, y, colorID));
        };

        this.getMapObject = function (x, y, array) {
            for (let i = 0; i < array.length; i++) {
                let mapObject = array[i];
                if (mapObject.x === x && mapObject.y === y) {
                    return mapObject;
                }
            }
            return undefined;
        };

        this.getGate = function (x, y) {
            return this.getMapObject(x, y, this.gates);
        };

        this.getKey = function (x, y) {
            return this.getMapObject(x, y, this.keys);
        };

        this.getChest = function (x, y) {
            return this.getMapObject(x, y, this.chests);
        };

        this.isGateOfColor = function (x, y, colorID) {
            for (let i = 0; i < this.gates.length; i++) {
                let gate = this.gates[i];
                if (gate.x === x && gate.y === y && gate.colorID === colorID) {
                    return true;
                }
            }
            return false;
        };

        this.isGateWithMatchingKey = function (x, y) {
            for (let i = 0; i < keysInPossesion.length; i++) {
                let keyColorID = keysInPossesion[i];
                if (this.isGateOfColor(x, y, keyColorID)) {
                    return true;
                }
            }
            return false;
        };

        this.setStartPosition = function (x, y) {
            this.startX = x;
            this.startY = y;
        };

        this.isTileStartingPoint = function (x, y) {
            if (x === this.startX && y === this.startY) {
                return true;
            } else {
                return false;
            }
        };
    }

    function MapObject(x, y, colorID) {
        this.x = x;
        this.y = y;
        this.colorID = colorID;
    }
   
    function isTypeStairs(type) {
        return (type === 3 || type === 4 || type === 10 || type === 11);
    }

    function isTypeGate(type) {
        return (type === 7);
    }

    function isTypeChest(type) {
        return (type === 1);
    }

    function isTypeKey(type) {
        return (type === 9);
    }

    function isTypeFloor(type) {
        return (type === 8);
    }
    
    /*
     *      GAME
     */

    function Victory() {
        movementDisallowed = true;
        $('#victoryModal').on('hide.bs.modal', function (e) {
            document.getElementById("victoryButton").click();
        });
        $('#victoryModal').modal();
    }

    function addGameEvents() {
        window.addEventListener("keydown", function (event) {
            let code = event.keyCode;
            switch (code) {
                case 37:
                    movePlayerLeft();
                    break;
                case 38:
                    movePlayerUp();
                    break;
                case 39:
                    movePlayerRight();
                    break;
                case 40:
                    movePlayerDown();
                    break;
            }
        });
    }

    function movePlayerUp() {
        if (checkTileForMovement(playerX, playerY - 1, "N")) {
            playerY--;
        }
    }

    function movePlayerDown() {
        if (checkTileForMovement(playerX, playerY + 1, "S")) {
            playerY++;
        }
    }

    function movePlayerLeft() {
        if (checkTileForMovement(playerX - 1, playerY, "E")) {
            playerX--;
        }
    }

    function movePlayerRight() {
        if (checkTileForMovement(playerX + 1, playerY, "W")) {
            playerX++;
        }
    }

    function checkTileForMovement(x, y, approachDirection) {
        if (movementDisallowed) {
            return false;
        }
        else if (map.checkBounds(x, y) === false) {
            return false;
        } else if (map.isExit(x, y, approachDirection)) {
            Victory();
            return true;
        } else if (map.isTileBlocking(x, y) === false) {

            let gate = map.getGate(x, y);
            if (gate !== undefined) {
                if (map.isGateWithMatchingKey(x, y)) {
                    map.removeMapObject(x, y, map.gates);
                }
                return false;
            }

            let chest = map.getChest(x, y);
            if (chest !== undefined) {
                if (approachDirection === "N") {
                    if (checkTileForChestMovement(x, y - 1)) {
                        map.removeMapObject(x, y, map.chests);
                        map.addChest(x, y - 1, chest.colorID);
                        return true;
                    }
                } else if (approachDirection === "E") {
                    if (checkTileForChestMovement(x - 1, y)) {
                        map.removeMapObject(x, y, map.chests);
                        map.addChest(x - 1, y, chest.colorID);
                        return true;
                    }
                } else if (approachDirection === "S") {
                    if (checkTileForChestMovement(x, y + 1)) {
                        map.removeMapObject(x, y, map.chests);
                        map.addChest(x, y + 1, chest.colorID);
                        return true;
                    }
                } else if (approachDirection === "W") {
                    if (checkTileForChestMovement(x + 1, y)) {
                        map.removeMapObject(x, y, map.chests);
                        map.addChest(x + 1, y, chest.colorID);
                        return true;
                    }
                }
                return false;
            }

            let key = map.getKey(x, y);
            if (key !== undefined) {
                addKeyToPlayer(key.colorID);
                map.removeMapObject(x, y, map.keys);
                return true;
            }

            return true;
        }
        else {
            return false;
        }
    }

    function checkTileForChestMovement(x, y) {
        if (map.checkBounds(x, y) === false) {
            return false;
        } else {
            return (map.isTileBlocking(x, y) === false
                && map.getChest(x, y) === undefined
                && map.getGate(x, y) === undefined
                && map.getKey(x, y) === undefined);
        }
    }

    function addKeyToPlayer(colorID) {
        if (contains(keysInPossesion, colorID) === false) {
            keysInPossesion.push(colorID);
        }
    }

    /*
     *      EDITOR 
     */

    function SaveMap() {
        function DisplayMessage(message) {
            $("#saveMessage").html(message);
            $("#saveModal").modal();
        }

        let request = $.ajax({
            type: "POST",
            data: { mapString: map.saveToJson(), name: mapNameTextArea.value, currentMapID: mapID },
            url: "Save",
            dataType: 'json',
            async: true
        });
        
        request.done(function (data, textStatus, jqXHR) {
            let newMapID = parseInt(data.mapID);
            console.log(data.mapID);
            if (newMapID !== 0) {
                mapID = newMapID;
                DisplayMessage("Zapisano zmiany.");
            } else {
                DisplayMessage("Błąd - niepoprawna mapa");
            }           
        });

        request.fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            DisplayMessage("Błąd - nie udało się zapisać zmian!");            
        });
    }

    function addEditorEvents() {
        let saveButton = document.getElementById("saveButton");
        saveButton.addEventListener("click", SaveMap);

        let setStartPositionButton = document.getElementById("setStartPositionButton");
        setStartPositionButton.addEventListener("click", function () { setStartPositionMode = true; });
        
        gameCanvas.addEventListener("mousemove", function (event) {
            let pos = getMousePos(gameCanvas, event);
            let screenYOffset = 6;
            updateTileUnderMouse(pos.x, pos.y - (screenYOffset * scale));
            if (dragging) {
                if (tileUnderMouse !== undefined) {
                    paint();
                }
            }
        });
        gameCanvas.addEventListener("mousedown", function () {
            if (tileUnderMouse !== undefined) {
                paint();
                if (contains(nonDraggableTileTypes, currentEditorBrush) === false
                    && setStartPositionMode === false) {
                    dragging = true;
                }
            }
            else {
                dragging = false;
            }
        });
        gameCanvas.addEventListener("mouseup", function () {
            dragging = false;
        });
        gameCanvas.addEventListener("mouseout", function () {
            dragging = false;
        });

        editorCanvas.addEventListener("click", function (event) {
            let pos = getMousePos(editorCanvas, event);
            let chosenTileX = Math.floor(pos.x / ((tileWidth + tileOffset) * tilePickerScale));
            let chosenTileY = Math.floor(pos.y / ((tileHeight + tileOffset) * tilePickerScale));
            if (chosenTileX < 0 || chosenTileX > 6
                || chosenTileY < 0 || chosenTileY > 2) {
                return;
            }
            else {
                currentEditorBrush = (chosenTileX + chosenTileY * 7);
            }
        });

        function addColorPickerEvents() {
            let pickerElements = document.getElementsByClassName("colorPicker");
            for (let i = 0; i < pickerElements.length; i++) {
                let colorName = pickerElements[i].id;
                pickerElements[i].addEventListener("click", function () { pickerEvent(colorName); });
            }

            function pickerEvent(colorName) {
                if (colorIDs[colorName] !== undefined) {
                    let newColorID = colorIDs[colorName];
                    if (newColorID !== currentColorID) {
                        currentColorID = colorIDs[colorName];
                    }
                }
                else {
                    return;
                }
            }
        }
        addColorPickerEvents();
    }
    
    function drawEditorCanvas() {
        let currentColorOffset = colorOffsets[currentColorID];
        if (currentColorOffset === undefined) {
            return;
        }
    
        editorCanvasContext.clearRect(0, 0, editorCanvas.width, editorCanvas.height);

        let tilePickerWidth = 7 * (tileWidth + tileOffset);
        let tilePickerHeight = 2 * (tileHeight + tileOffset);

        let tileBitmapXCoord = currentColorOffset.x * tilePickerWidth;
        let tileBitmapYCoord = currentColorOffset.y * tilePickerHeight;

        editorCanvasContext.drawImage(tilesImage,
            tileBitmapXCoord, tileBitmapYCoord, tilePickerWidth, tilePickerHeight,
            0, 0, tilePickerWidth * tilePickerScale, tilePickerHeight * tilePickerScale);
    }

    function updateTileUnderMouse(x, y) {
        let tileX = Math.floor(x / (tileWidth * scale));
        let tileY = Math.floor(y / (tileWidth * scale));
        tileUnderMouse = { x: tileX, y: tileY };
        return tileUnderMouse;
    }

    function paint() {
        if (tileUnderMouse === undefined) {
            return;
        }

        let x = tileUnderMouse.x;
        let y = tileUnderMouse.y;

        if (map.checkBounds(x, y) === false) {
            return;
        }

        let type = currentEditorBrush;
        let color = currentColorID;

        if (type === undefined || color === undefined) {
            return;
        }

        if (setStartPositionMode) {
            map.removeObjectsFromTile(x, y);
            if (isTypeFloor(map.getTileType(x, y)) === false) {
                map.setTile(x, y, defaultTileType, defaultColorID);
            }
            map.setStartPosition(x, y);
            setStartPositionMode = false;
            return;
        }

        if (map.isTileStartingPoint(x, y)) {
            if (isTypeFloor(type)) {
                map.setTile(x, y, type, color);
            } else {
                return;
            }
        }

        if (isTypeFloor(map.getTileType(x, y)) === false) {
            if (isTypeKey(type) || isTypeGate(type) || isTypeChest(type)) {
                return;
            }
        }

        if (isTypeKey(type)) {
            map.addKey(x, y, color);
        }
        else if (isTypeGate(type)) {
            map.addGate(x, y, color);
        }
        else if (isTypeChest(type)) {
            map.addChest(x, y, color);
        }
        else if (isTypeStairs(type)) {
            map.setTile(x, y, type, color);
            map.removeObjectsFromTile(x, y);
        }
        else {
            map.setTile(x, y, type, color);
            if (isTypeFloor(type) === false) {
                map.removeObjectsFromTile(x, y);
            }
        }
    }

    function ColorOffset(x, y) {
        if (x > 2 || x < 0
            || y > 8 || y < 0 ){
            return undefined;
        }

        this.x = x;
        this.y = y;
    }

    let colorIDs = {
        blue : 0,       darkGreen : 1,  green : 2,      lightGreen : 3,
        mudGreen : 4,   orange : 5,     darkOrange : 6, rust : 7,
        red : 8,        lightRed : 9,   pink : 10,      purple : 11,
        darkBlue : 12,  sand : 13,      grey : 14,      darkGrey : 15
    };
    
    let colorOffsets = [
        new ColorOffset(0, 0), new ColorOffset(0, 1), new ColorOffset(0, 2), new ColorOffset(0, 3),
        new ColorOffset(0, 4), new ColorOffset(0, 5), new ColorOffset(0, 6), new ColorOffset(0, 7),
        new ColorOffset(1, 0), new ColorOffset(1, 1), new ColorOffset(1, 2), new ColorOffset(1, 3),
        new ColorOffset(1, 4), new ColorOffset(1, 5), new ColorOffset(1, 6), new ColorOffset(1, 7)
    ];

    function setColorPickerSize() {
        let cells = pickerCells = document.getElementsByClassName("colorPicker");
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            cell.style.width = colorPickerSize + "px";
            cell.style.height = colorPickerSize + "px";
        }
    }

    /*
     *      HELPERS
     */

    function contains(array, value) {
        return (array.indexOf(value) !== -1);
    }

    function isNumber(n) {
        return isFinite(n) && +n === n;
    }

    function remove(array, element) {
        let index = array.indexOf(element);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    function getMousePos(canvas, event) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }

    function disableSmoothing(canvas) {
        canvasContext = canvas.getContext("2d");
        canvasContext.mozImageSmoothingEnabled = false;
        canvasContext.webkitImageSmoothingEnabled = false;
        canvasContext.msImageSmoothingEnabled = false;
        canvasContext.imageSmoothingEnabled = false;
    }

    function loadImages(imagesToLoad, directory) {
        let loadedImagesCount = 0;
        let totalImagesCount = imagesToLoad.length;
        let images = [];

        for (let i = 0; i < imagesToLoad.length; i++) {
            let image = new Image();

            image.onload = function () {
                loadedImagesCount++;
                if (loadedImagesCount === totalImagesCount) {
                    imagesLoadingCompleted = true;
                }
            };

            image.onerror = function () {
                console.log("Nie udało się załadować obrazka: " + image.src);
            };

            image.src = directory + imagesToLoad[i];

            images[i] = image;
        }

        return images;
    }

}();