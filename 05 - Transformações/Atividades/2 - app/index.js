var canvas, contexto, objetos, objeto_atual = null;
var beginX = 0, beginY = 0; // Posições do mouse
var startX = 0, startY = 0; // inicio desenho dos objetos
var operacao = null;
var permite_desenhar = true;
var eixo;
var atualX, atualY;
var coordenadas = "";

// Adiciona o retangulo quando clica em desenhar
function desenha(startX, startY, atualX, atualY) {
  if(permite_desenhar){
    objetos.push({
      type: 'rect',
      x: startX, y: startX,
      width: atualX-startX, height: atualY-startY,
      color: '#18BC9C'
    });
  }
  atualiza_canvas();
}

// Verifica a operação de transformação
// Se o valor for 'desenha', então a operação de desenho é desbloqueada
document.getElementById('transformacoes').onchange = function(e) {
  operacao = document.getElementById('transformacoes').value;
  if (operacao == 'desenha'){
    permite_desenhar = true;
  } 
  if (operacao == 'refletir'){
    exibe();
  } else{
    oculta();
  }
};

// Atualiza o canvas com os objetos selecionados
function atualiza_canvas() {
  contexto.fillStyle = '#ecf0f1';
  contexto.fillRect(0, 0, 800, 400);
  document.getElementById("coordenadas").innerHTML = ""; // Atualiza div coordenadas

  for (var i = 0; i < objetos.length; i++) {
    contexto.fillStyle = objetos[i].color;
    contexto.fillRect(objetos[i].x, objetos[i].y, objetos[i].width, objetos[i].height);
    
    // Exibe coordenadas na tela
    monta_coordenadas(i, objetos[i].x, objetos[i].y, objetos[i].width, objetos[i].height);
  }
  contexto.stroke();
}

// Exibe coordenadas na tela
function monta_coordenadas(i, x, y, width, height){
  if (i != 0){
    coordenadas = "Coordenadas do objeto " + i + ": (" + x + ", " + y + "); (" + (x + width) + ", " + y + "); (" + (x + width) + ", " + (y + height) + "); (" + x + ", " + (y + height) + ")";
    var tag = document.createElement("p");
    var text = document.createTextNode(coordenadas);
    tag.appendChild(text);
    var element = document.getElementById("coordenadas");
    element.appendChild(tag);
  }
}

// Ler a página do canvas. Pega a lista de objetos do canvas
window.onload = function() {
  objetos = [];
  canvas = document.getElementById('transformacoes_canvas');
  contexto = canvas.getContext('2d');
  atualiza_canvas(); // Atualiza o canvas
  oculta(); // oculta html div_eixo

  // Detecta o objeto atual com o clique do mouse, se essa posição está na área de um objeto
  canvas.onmousedown = function(event) {
    for (var i = 0; i < objetos.length; i++) {
      if (objetos[i].x < event.clientX
        && (objetos[i].width + objetos[i].x > event.clientX) &&  objetos[i].y < event.clientY && (objetos[i].height + objetos[i].y > event.clientY)
      ) {
        objeto_atual = objetos[i];
        beginX = event.clientX - objetos[i].x;
        beginY = event.clientY - objetos[i].y;
        permite_desenhar = false;
        break;
      } else if(operacao == 'desenha'){
        beginX = event.clientX;
        beginY = event.clientY;
        permite_desenhar = true;
      }
    }
  }

  // Detecta o objeto atual com o movimento do mouse
  canvas.onmousemove = function(event) {
    // Faz a translação do objeto atual definido no evento mousedown
    if (operacao == 'translacao' && objeto_atual != null) {
      objeto_atual.x = event.clientX - beginX;
      objeto_atual.y = event.clientY - beginY;
      atualiza_canvas();
    }
    
    // 'Escala' o objeto atual definido no evento mousedown
    if (operacao == 'escalar' && objeto_atual != null) {
      objeto_atual.width = event.clientX - objeto_atual.x;
      objeto_atual.height = event.clientY - objeto_atual.y;
      atualiza_canvas();
    }

  }

  // Detecta o objeto atual quando retira o clique do mouse
  canvas.onmouseup = function(event) {
    // Faz o cisalhamento do objeto atual definido no evento mousedown.
    if (operacao == 'cizalhar'){
      contexto.save();
      contexto.transform(1,0,0.3,1,0,0); // transforma o eixo X
    }

    // Espelha o objeto atual definido no evento mousedown
    if (operacao == 'refletir') {
      if (eixo == 'x'){ // eixo X
        objeto_atual.x = canvas.width - (objeto_atual.x + objeto_atual.width);
      } else if (eixo == 'y') {  // eixo Y        
        objeto_atual.y = canvas.height - (objeto_atual.y + objeto_atual.height);
      } else { // eixo XY
        objeto_atual.x = canvas.width - (objeto_atual.x + objeto_atual.width);
        objeto_atual.y = canvas.height - (objeto_atual.y + objeto_atual.height);
      }
    }

    // Rotaciona o objeto no evento mousedown.
    if (operacao == 'rotacionar') {
      contexto.translate(canvas.width / 2, canvas.height / 2); // translate o retangulo para o centro
      contexto.rotate(20 * Math.PI / 180);
      contexto.translate(- canvas.width / 2, - canvas.height / 2); // translate para o ponto de origem
    }
    
    // Adiciona um retângulo transformado na lista
    desenha(startX, startY, atualX, atualY);
    atualiza_canvas(); // atualiza canvas

    // restaura o contextoo final
    contexto.restore();

    // Define o objeto atual como 'null' e as posições atuais como as 'posições do movemouse'
    objeto_atual = null;
    atualX = event.clientX;
    atualY = event.clientY;
  }
}

// oculta div seleção do eixo 
function oculta(){
  var div_eixo = document.getElementById('div_eixo');
  div_eixo.style.visibility = 'hidden';
  eixo = null;
}

// exibe a div seleção do eixo e pega o eixo selecionado
function exibe(){
  var div_eixo = document.getElementById('div_eixo');
  div_eixo.style.visibility = 'visible';
  eixo = document.getElementById('eixo_refletir').value;
}

// Detecta o eixo selecionado
document.getElementById('eixo_refletir').onchange = function(e) {
  eixo = document.getElementById('eixo_refletir').value;
};