function upload() {

    var extension = document.getElementById("arquivo").value.split(".");
    extension = extension[extension.length - 1]

    if (extension != "txt") {
        marca_pontos() // Marca os pontos na imagem
    } else {
        mask() // carrega a máscara do txt
    }
}

// Inicializa variáveis
Xcoordinates = [[]]
Ycoordinates = [[]]
pos = 0;
new_marker = 0;

// Criar nova máscara
function novaMascara() {
    console.log("Nova marcação!")
    new_marker = 1;
    pos++;
}

// Marcar a imagem com os pontos do poligno
function marca_pontos() {

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image(); // tamanho opcional image
    image.onload = drawImageTamanhoAtual; // Desenha quando a imagem é carregada

    var input = document.getElementById("arquivo");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function(event){
        image.src = event.target.result;
    }

    //Zerando variáveis
    Xcoordinates = [[]]
    Ycoordinates = [[]]
    pos = 0;
    new_marker = 0;

    function drawImageTamanhoAtual() {

        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        console.log("Largura e altura da imagem:");
        console.log(canvas.width, canvas.height);

        ctx.drawImage(this, 0, 0, this.width, this.height);
    }

    canvas.onmousedown = function (evtd) {
        xd = evtd.clientX; // Coordenadas horizontais
        yd = evtd.clientY; // Coordenadas verticais

        if(new_marker == 1) {
            Xcoordinates.push([xd]);
            Ycoordinates.push([yd]);
            new_marker = 0;
        } else {
            Xcoordinates[pos].push(xd);
            Ycoordinates[pos].push(yd);
        }

        console.log("Clique: ", xd, yd);

        ctx.fillStyle = "red";
        ctx.fillRect(xd, yd, 5, 5);
        ctx.fillStyle = "#00ff001C"; // #rrggbbaa

        // Poligno com mais de um ponto
        if(Xcoordinates[pos].length > 1){

            // Traçando uma linha do novo ponto para o ponto anterior
            x_anterior = Xcoordinates[pos][Xcoordinates[pos].length - 2]
            y_anterior = Ycoordinates[pos][Ycoordinates[pos].length - 2]
            ctx.beginPath();
            ctx.moveTo(x_anterior, y_anterior);
            ctx.lineTo(xd, yd);

            // Traçando uma linha do novo ponto para o primeiro ponto
            ctx.lineTo(Xcoordinates[pos][0], Ycoordinates[pos][0], xd, yd);
            ctx.fill();
        }
        
    }
}

// Salvar coordenadas
function salvaCoordenadas() {

    text = "";

    for (var i = 0; i < Xcoordinates.length; i++) {
        for (var j = 0; j < Xcoordinates[i].length; j++) {
            text += Xcoordinates[i][j] + "," + Ycoordinates[i][j] + "\n";
        }
        text += Xcoordinates[i][0] + "," + Ycoordinates[i][0] + "\n";
        text += "novo\n";
    }

    var filename = document.getElementById("arquivo").value.split("\\");
    filename = filename[filename.length - 1].split('.')[0] + ".txt";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Criar máscara
function mask() {

    var input = document.getElementById("arquivo");

    function desenhaMascara(text) {

        var arr = text.split("novo\n"); // Divide as coordenadas dos objetos pela string "novo"
        arr.pop();

        var X = [];
        var Y = [];

        for (var i = 0; i < arr.length; i++) {
            coord = arr[i].split("\n")
            coord.pop()
            x_line = [];
            y_line = [];
            for (var j = 0; j < coord.length; j++) {
                x_line.push(parseInt(coord[j].split(",")[0]));
                y_line.push(parseInt(coord[j].split(",")[1]));
            }
            X.push(x_line);
            Y.push(y_line);
        }
        
        X_concat = [].concat.apply([], X)
        Y_concat = [].concat.apply([], Y)

        Xmax = Math.max.apply(null, X_concat);
        Ymax = Math.max.apply(null, Y_concat);
        Xmin = Math.min.apply(null, X_concat);
        Ymin = Math.min.apply(null, Y_concat);

        console.log(Xmax, Ymax, Xmin, Ymin)

        // Redimensionamento
        for (var i = 0; i < X.length; i++) {
            for (var j = 0; j < X[i].length; j++) {
                X[i][j] = X[i][j] - Xmin;
                Y[i][j] = Y[i][j] - Ymin;
            }
        }

        console.log("Coordenadas da marcação após mapeamento:");
        console.log(X);
        console.log(Y);

        X_concat = [].concat.apply([], X)
        Y_concat = [].concat.apply([], Y)

        Xmax = Math.max.apply(null, X_concat);
        Ymax = Math.max.apply(null, Y_concat);
        Xmin = Math.min.apply(null, X_concat);
        Ymin = Math.min.apply(null, Y_concat);

        console.log("Xmax: ", Xmax, "Ymax: ", Ymax, "Xmin: ", Xmin, "Ymin: ", Ymin);

        const canvas = document.getElementById('canvas');

        const ctx = canvas.getContext('2d');
        //ctx.fillStyle = "#000000";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();

        canvas.width = Xmax;
        canvas.height = Ymax;

        ctx.fillStyle = "#000000";

        for (var i = 0; i < X.length; i++) {
            ctx.moveTo(X[i][0], Y[i][0]);
            for (var j = 0; j < X[i].length; j++) {
                ctx.lineTo(X[i][j], Y[i][j]);
                //ctx.lineTo(Xcoordinates[0], Ycoordinates[0], X[i], Y[i]);
                ctx.fill();
            }
        }
    }

    var input = document.getElementById("arquivo");
    var fReader = new FileReader();
    fReader.readAsText(input.files[0]);
    fReader.onload = function(){
        coordinates = fReader.result;
        desenhaMascara(coordinates);
    }
}