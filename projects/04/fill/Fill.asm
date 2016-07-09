// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, the
// program clears the screen, i.e. writes "white" in every pixel.

// Put your code here.

(INFLOOP)
  @KBD
  D=M
  @WHITEN
  D;JEQ

(BLACKEN)
  @R2
  M=-1

(WHITENORBLACKEN)
  // Stored Screen Address in R0
  @SCREEN
  D=A
  @R0
  M=D

  // Stored 8192 in R1. As there are total 8192 blocks which need updating.
  @8192
  D=A
  @R1
  M=D

(WHITENORBLACKENLOOP)
  @R2
  D=M

  @R0
  A=M
  M=D
  @R0
  M=M+1
  @R1
  MD=M-1
  @WHITENORBLACKENLOOP
  D;JNE
  @INFLOOP
  0;JMP

(WHITEN)
  @R2
  M=0
  @WHITENORBLACKEN
  0;JMP
