const fs = require('fs');

if (process.argv.length < 3) {
  throw Error('Not enough arguments');
}

var fileName = process.argv[2];

var contents = readFileContents(fileName);

var code = generateCode(parse(toLines(contents)));

//console.log(code);

writeCodeToFile(code, fileName);

function writeCodeToFile(code, fileName) {
  var outFile = (fileName + '.hack').replace('.asm','');
  fs.writeFileSync(outFile, code.join('\n').concat('\n'));
}

function generateCode(instructions) {
  var code = [];
  for(var i=0; i< instructions.length; i++) {
    var instruction = instructions[i];
    if(instruction.type == 'A') {
      code.push(convertNumberToBinary(instruction.value));
    } else if(instruction.type == 'C'){
      var firstBit = '1';
      var comp = translateToBinComp(instruction.value);
      var dest = getDestinationBits(instruction.dest);
      var jump = translateToJumpBits(instruction.jump);
      var hackCode = firstBit + '11' + comp + dest + jump;
      code.push(hackCode);
    }
  }

  return code;

  function translateToJumpBits(jump) {
    const jumpTable = {
      ''    : '000',
      'JGT' : '001',
      'JEQ' : '010',
      'JGE' : '011',
      'JLT' : '100',
      'JNE' : '101',
      'JLE' : '110',
      'JMP' : '111'
    }

    return jumpTable[jump];
  }

  function getDestinationBits(dest) {
    var d1 = d2 = d3 = '0';
    if(dest.indexOf('A') > -1) {
      d1 = '1';
    }

    if(dest.indexOf('D') > -1) {
      d2 = '1';
    }

    if(dest.indexOf('M') > -1) {
      d3 = '1';
    }

    return d1 + d2 + d3;
  }

  function translateToBinComp(val) {
    const translationTable = {
      '0'   : '0101010',
      '1'   : '0111111',
      '-1'  : '0111010',
      'D'   : '0001100',
      'A'   : '0110000',
      'M'   : '1110000',
      '!D'  : '0001101',
      '!A'  : '0110001',
      '!M'  : '1110001',
      '-D'  : '0001111',
      '-A'  : '0110011',
      '-M'  : '1110011',
      'D+1' : '0011111',
      'A+1' : '0110111',
      'M+1' : '1110111',
      'D-1' : '0001110',
      'A-1' : '0110010',
      'M-1' : '1110010',
      'D+A' : '0000010',
      'D+M' : '1000010',
      'D-A' : '0010011',
      'D-M' : '1010011',
      'A-D' : '0000111',
      'M-D' : '1000111',
      'D&A' : '0000000',
      'D&M' : '1000000',
      'D|A' : '0010101',
      'D|M' : '1010101'
    };

    return translationTable[val];
  }

  function dec2bin(dec){
    return (dec >>> 0).toString(2);
  }

  function convertNumberToBinary(num) {
    var binNum = dec2bin(parseInt(num));
    return pad(binNum);
  }

  function pad(bin) {
    if (bin.length < 16) {
      return '0'.repeat(16 - bin.length) + bin;
    } else if(bin.length > 16) {
      return bin.substring(bin.length - 16, bin.length);
    } else {
      return bin;
    }
  }
}

function parse(lines) {

  function clean(line) {
    return line.replace(/\/\/.*/, '').trim();
  }

  var instructions = [];
  var incompleteInstructions = [];
  var labels = {};
  for (var i=0; i<lines.length; i++) {
    var line = clean(lines[i]);

    if (!line) continue;

    if (line.match(/^@[A-Za-z]/)) {
      instructions.push({
          type: 'A',
          value: line.substring(1)
      });

      incompleteInstructions.push(instructions.length-1);

    } else if (line.match(/^@/)) {
      instructions.push({
          type: 'A',
          value: line.substring(1)
      });

    } else if (line.match(/^\(/)) {
      var label = line.substring(1, line.length-1);
      labels[label] = instructions.length;

    } else {
      instructions.push(getCInstruction(line));
    }
  }

  convertSymbolsAndVariables();
  return instructions;

  function convertSymbolsAndVariables() {
    var variablesLocation = 16;
    var variables = {
                R0 : '0', R1 : '1', R2 : '2', R3 : '3', R4 : '4',
                R5 : '5', R6 : '6', R7 : '7', R8 : '8', R9 : '9',
                R10 : '10', R11 : '11', R12 : '12', R13 : '13', R14 : '14',
                R15 : '15',
                SP : '0',
                LCL : '1',
                ARG : '2',
                THIS : '3',
                THAT : '4',
                SCREEN : '16384',
                KBD : '24576'
              };
    for (var i=0; i<incompleteInstructions.length; i++) {
      var instruction = instructions[incompleteInstructions[i]];
      if (Object.keys(labels).indexOf(instruction.value) > -1) {
        instruction.value = labels[instruction.value];
      } else if (Object.keys(variables).indexOf(instruction.value) > -1) {
        instruction.value = variables[instruction.value];
      } else {
        variables[instruction.value] = variablesLocation;
        instruction.value = variablesLocation;
        variablesLocation++;
      }
      //console.log(instruction);
    }
  }

  function getCInstruction(line) {
    var instruction = {
      type : 'C',
      dest : '',
      value: '',
      jump: ''
    };

    var equalToPos = line.indexOf("=");
    var semicolonPos = line.indexOf(";");
    var instructionValStart = 0;
    var instructionValEnd = line.length;

    if(equalToPos > -1) {
      instruction.dest = line.substring(0, equalToPos);
      instructionValStart = equalToPos + 1;
    }

    if (semicolonPos > -1) {
      instruction.jump = line.substring(semicolonPos+1);
      instructionValEnd = semicolonPos;
    }

    instruction.value = line.substring(instructionValStart, instructionValEnd);
    return instruction;
  }
}

function toLines(contents) {
  return contents.split('\n');
}

function readFileContents(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf-8');
  } else {
    throw Error('File does not exist');
  }
}
