// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.


// To calculate R2 = R0 * R1
// We'll do R0 + R0 + R0........R1 times

  @R2    // Resetting output memory
  M=0

  @R0    // We are copying R0 & R1 to x & y
  D=M

  @x
  M=D

  @END   // Program ends if R0 is 0
  D;JEQ

  @R1
  D=M

  @y
  M=D

  @END   // Program ends if R1 is 0
  D;JEQ

(LOOP)
  @x
  D=M

  @R2
  M=M+D

  @y
  MD=M-1
  @LOOP
  D;JNE

(END)
  @END
  0;JMP
