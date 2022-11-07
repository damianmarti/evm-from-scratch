/**
 * EVM From Scratch
 * TypeScript template
 *
 * To work on EVM From Scratch in TypeScript:
 *
 * - Install Node.js: https://nodejs.org/en/download/
 * - Go to the `typescript` directory: `cd typescript`
 * - Install dependencies: `yarn` (or `npm install`)
 * - Edit `evm.ts` (this file!), see TODO below
 * - Run `yarn test` (or `npm test`) to run the tests
 * - Use Jest Watch Mode to run tests when files change: `yarn test --watchAll`
 */

const bigintConversion = require('bigint-conversion');
const keccak256 = require('keccak256');

function hexStringToUint8Array(hexString: string) {
  return new Uint8Array(
    (hexString?.match(/../g) || []).map((byte) => parseInt(byte, 16))
  );
}

export default function evm(code: Uint8Array, tx: Object, state: Object, block: Object, storeFromPrevContext: Object, staticCall: Boolean) {

  console.log("CODE: ", code);
  console.log("TX: ", tx);
  console.log("STATE: ", state);
  console.log("BLOCK: ", block);

  let stack = [];

  const logs = [];

  let success = true;
  let returnData = [];

  // TODO: better memory allocation
  let memory = new Uint8Array(1024);
  let msize = BigInt(0);

  let store = {};

  if (storeFromPrevContext) {
    store = storeFromPrevContext;
  }

  let subResultReturn = new Uint8Array(0);

  let codeIterator = code.values();

  console.log("codeIterator: ", codeIterator);

  let next = codeIterator.next();

  console.log("next: ", next);

  const MAX_2_256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff") + BigInt(1);

  let pc = 0;

  while (pc < code.length) {
    const opcode = code[pc];
    pc++;

    // STOP
    if (opcode == 0) {
      console.log("STOP");
      pc = code.length;
    }

    // ADD
    if (opcode == 1) {
      console.log("ADD");
      const value = (stack.shift() + stack.shift()) % MAX_2_256;
      stack.unshift(value);
    }

    // MUL
    if (opcode == 2) {
      console.log("MUL");
      const value = (stack.shift() * stack.shift()) % MAX_2_256;
      stack.unshift(value);
    }

    // SUB
    if (opcode == 3) {
      console.log("SUB");
      const value = (((stack.shift() - stack.shift()) % MAX_2_256) + MAX_2_256) % MAX_2_256;
      stack.unshift(value);
    }

    // DIV
    if (opcode == 4) {
      console.log("DIV");
      const num = stack.shift();
      const den = stack.shift();
      if (den == 0) {
        stack.unshift(BigInt(0));
      } else {
        const value = (num / den) % MAX_2_256;
        stack.unshift(value);
      }
    }

    // SDIV
    if (opcode == 5) {
      console.log("SDIV");
      const num = BigInt.asIntN(256, stack.shift());
      const den = BigInt.asIntN(256, stack.shift());
      if (den == 0) {
        stack.unshift(BigInt(0));
      } else {
        const value = (((num / den) % MAX_2_256) + MAX_2_256) % MAX_2_256;
        stack.unshift(value);
      }
    }

    // MOD
    if (opcode == 6) {
      console.log("MOD");
      const num = stack.shift();
      const den = stack.shift();
      if (den == 0) {
        stack.unshift(BigInt(0));
      } else {
        const value = num % den;
        stack.unshift(value);
      }
    }

    // SMOD
    if (opcode == 7) {
      console.log("SMOD");
      const num = BigInt.asIntN(256, stack.shift());
      const den = BigInt.asIntN(256, stack.shift());
      if (den == 0) {
        stack.unshift(BigInt(0));
      } else {
        const value = (((num % den) % MAX_2_256) + MAX_2_256) % MAX_2_256;
        stack.unshift(value);
      }
    }

    // LT
    if (opcode == 0x10) {
      console.log("LT");
      let value = BigInt(0);
      if (stack.shift() < stack.shift()) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // GT
    if (opcode == 0x11) {
      console.log("GT");
      let value = BigInt(0);
      if (stack.shift() > stack.shift()) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // SLT
    if (opcode == 0x12) {
      console.log("SLT");
      let value = BigInt(0);
      const left = BigInt.asIntN(256, stack.shift());
      const right = BigInt.asIntN(256, stack.shift());
      if (left < right) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // SGT
    if (opcode == 0x13) {
      console.log("SGT");
      let value = BigInt(0);
      const left = BigInt.asIntN(256, stack.shift());
      const right = BigInt.asIntN(256, stack.shift());
      if (left > right) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // EQ
    if (opcode == 0x14) {
      console.log("EQ");
      let value = BigInt(0);
      if (stack.shift() == stack.shift()) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // ISZERO
    if (opcode == 0x15) {
      console.log("ISZERO");
      let value = BigInt(0);
      if (stack.shift() == value) {
        value = BigInt(1);
      }
      stack.unshift(value);
    }

    // AND
    if (opcode == 0x16) {
      console.log("AND");
      const value = stack.shift() & stack.shift();
      stack.unshift(value);
    }

    // OR
    if (opcode == 0x17) {
      console.log("OR");
      const value = stack.shift() | stack.shift();
      stack.unshift(value);
    }

    // XOR
    if (opcode == 0x18) {
      console.log("XOR");
      const value = stack.shift() ^ stack.shift();
      stack.unshift(value);
    }

    // NOT
    if (opcode == 0x19) {
      console.log("NOT");
      const value = (~stack.shift() + MAX_2_256) % MAX_2_256;
      stack.unshift(value);
    }

    // SHA3
    if (opcode == 0x20) {
      console.log("SHA3");
      const offset = stack.shift();
      const size = stack.shift();
      let valueArray = new Uint8Array(size.toString());
      // TODO: check memory size
      for (let j = 0; j<size; j++) {
        valueArray[j] = memory[offset+BigInt(j)];
      }
      const keccak = keccak256(Buffer.from(valueArray));
      stack.unshift(bigintConversion.bufToBigint(keccak));
    }

    // BYTE
    if (opcode == 0x1A) {
      console.log("BYTE");
      const index = BigInt(31) - stack.shift();
      console.log("index: ", index);
      const byteValue = stack.shift();
      const byteArray = new Uint8Array(bigintConversion.bigintToBuf(byteValue, true));
      console.log("byteArray: ", byteArray);
      if (index < 0) {
        stack.unshift(BigInt(0));
      } else {
        stack.unshift(BigInt(byteArray.reverse()[index]));
      }
    }

    // ADDRESS
    if (opcode == 0x30) {
      console.log("ADDRESS");
      stack.unshift(bigintConversion.bufToBigint(hexStringToUint8Array(tx.to)));
    }

    // BALANCE
    if (opcode == 0x31) {
      console.log("BALANCE");
      console.log("stack: ", stack);
      const address = stack.shift();
      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);
      console.log("state: ", state);
      let balance = "0x0";
      if (state && state[addressHex]) {
        balance = state[addressHex].balance;
      }
      console.log("balance: ", balance);
      stack.unshift(bigintConversion.hexToBigint(balance.split('x')[1]));
    }

    // ORIGIN
    if (opcode == 0x32) {
      console.log("ORIGIN");
      stack.unshift(bigintConversion.bufToBigint(hexStringToUint8Array(tx.origin)));
    }

    // CALLER
    if (opcode == 0x33) {
      console.log("CALLER");
      stack.unshift(bigintConversion.bufToBigint(hexStringToUint8Array(tx.from)));
    }

    // CALLVALUE
    if (opcode == 0x34) {
      console.log("CALLVALUE");
      stack.unshift(bigintConversion.hexToBigint(tx.value.split('x')[1]));
    }

    // CALLDATALOAD
    if (opcode == 0x35) {
      console.log("CALLDATALOAD");
      const offset = stack.shift();
      const dataArray = hexStringToUint8Array(tx.data);
      const result = new Uint8Array(32);

      const dataSlice = dataArray.slice(Number(offset), Number(offset) + 32);

      for (let j = 0; j<dataSlice.length; j++) {
        result[j] = dataSlice[j];
      }

      console.log("result: ", result);
      stack.unshift(bigintConversion.bufToBigint(result));
    }

    // CALLDATASIZE
    if (opcode == 0x36) {
      console.log("CALLDATASIZE");
      let size = 0;
      if (tx && tx.data) {
        const dataArray = hexStringToUint8Array(tx.data);
        size = dataArray.length;
      }
      stack.unshift(BigInt(size));
    }

    // CALLDATACOPY
    if (opcode == 0x37) {
      console.log("CALLDATACOPY");
      const destOffset = stack.shift();
      const offset = stack.shift();
      const size = stack.shift();

      const dataArray = hexStringToUint8Array(tx.data);
      const valueArray = new Uint8Array(Number(size));

      const dataSlice = dataArray.slice(Number(offset), Number(offset) + 32);

      for (let j = 0; j<dataSlice.length; j++) {
        valueArray[j] = dataSlice[j];
      }

      console.log("valueArray: ", valueArray);

      if ((destOffset + size) > msize) {
        msize = destOffset + size - BigInt(1); // TODO: check
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const value = stack.shift();

      for (let j = 0; j<valueArray.length; j++) {
        memory[destOffset+BigInt(j)] = valueArray[j];
      }
    }

    // CODESIZE
    if (opcode == 0x38) {
      console.log("CODESIZE");
      stack.unshift(BigInt(code.length));
    }

    // CODECOPY
    if (opcode == 0x39) {
      console.log("CODECOPY");
      const destOffset = stack.shift();
      const offset = stack.shift();
      const size = stack.shift();

      const dataArray = code;
      const valueArray = new Uint8Array(Number(size));

      const dataSlice = dataArray.slice(Number(offset), Number(offset) + 32);

      for (let j = 0; j<dataSlice.length; j++) {
        valueArray[j] = dataSlice[j];
      }

      console.log("valueArray: ", valueArray);

      if ((destOffset + size) > msize) {
        msize = destOffset + size - BigInt(1); // TODO: check
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const value = stack.shift();

      for (let j = 0; j<valueArray.length; j++) {
        memory[destOffset+BigInt(j)] = valueArray[j];
      }
    }

    // GASPRICE
    if (opcode == 0x3A) {
      console.log("GASPRICE");
      stack.unshift(bigintConversion.hexToBigint(tx.gasprice.split('x')[1]));
    }

    // EXTCODESIZE
    if (opcode == 0x3B) {
      console.log("EXTCODESIZE");
      const address = stack.shift();
      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);
      let size = 0;
      if (state && state[addressHex] && state[addressHex].code) {
        console.log("state[addressHex].code.bin: ", state[addressHex].code.bin);
        size = hexStringToUint8Array(state[addressHex].code.bin).length;
      }
      stack.unshift(BigInt(size));
      console.log("stack: ", stack);
    }

    // EXTCODECOPY
    if (opcode == 0x3C) {
      console.log("EXTCODECOPY");
      const address = stack.shift();
      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);
      const destOffset = stack.shift();
      const offset = stack.shift();
      const size = stack.shift();

      const dataArray = hexStringToUint8Array(state[addressHex].code.bin);
      const valueArray = new Uint8Array(Number(size));

      const dataSlice = dataArray.slice(Number(offset), Number(offset) + Number(size));

      const emptySize = Number(size) - dataSlice.length;

      for (let j = 0; j<dataSlice.length; j++) {
        valueArray[j+emptySize] = dataSlice[j];
      }

      console.log("dataSlice: ", dataSlice);
      console.log("valueArray: ", valueArray);

      console.log("destOffset: ", destOffset);
      console.log("size: ", size);
      console.log("msize: ", msize);

      if ((destOffset + size) > msize) {
        msize = destOffset + size - BigInt(1); // TODO: check
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const value = stack.shift();

      for (let j = 0; j<valueArray.length; j++) {
        memory[destOffset+BigInt(j)] = dataSlice[j];
      }
    }

    // RETURNDATASIZE
    if (opcode == 0x3D) {
      console.log("RETURNDATASIZE");
      stack.unshift(BigInt(subResultReturn.length));
    }

    // RETURNDATACOPY
    if (opcode == 0x3E) {
      console.log("RETURNDATACOPY");
      const destOffset = stack.shift();
      const offset = stack.shift();
      const size = stack.shift();

      for (let j=0; j<BigInt(size); j++) {
        memory[destOffset+BigInt(j)] = subResultReturn[offset+BigInt(j)];
      }
    }

    // COINBASE
    if (opcode == 0x41) {
      console.log("COINBASE");
      stack.unshift(bigintConversion.hexToBigint(block.coinbase.split('x')[1]));
    }

    // TIMESTAMP
    if (opcode == 0x42) {
      console.log("TIMESTAMP");
      stack.unshift(bigintConversion.hexToBigint(block.timestamp.split('x')[1]));
    }

    // NUMBER
    if (opcode == 0x43) {
      console.log("NUMBER");
      stack.unshift(bigintConversion.hexToBigint(block.number.split('x')[1]));
    }

    // DIFFICULTY / PREVRANDAO
    if (opcode == 0x44) {
      console.log("DIFFICULTY / PREVRANDAO");
      stack.unshift(bigintConversion.hexToBigint(block.difficulty.split('x')[1]));
    }

    // GASLIMIT
    if (opcode == 0x45) {
      console.log("GASLIMIT");
      stack.unshift(bigintConversion.hexToBigint(block.gaslimit.split('x')[1]));
    }

    // CHAINID
    if (opcode == 0x46) {
      console.log("CHAINID");
      stack.unshift(bigintConversion.hexToBigint(block.chainid.split('x')[1]));
    }

    // SELFBALANCE
    if (opcode == 0x47) {
      console.log("SELFBALANCE");

      const addressHex = tx.to;

      let balance = "0x0";
      if (state && state[addressHex]) {
        balance = state[addressHex].balance;
      }
      console.log("balance: ", balance);
      stack.unshift(bigintConversion.hexToBigint(balance.split('x')[1]));
    }

    // POP
    if (opcode == 0x50) {
      console.log("PROCESING POP");
      stack.shift();
    }

    // MLOAD
    if (opcode == 0x51) {
      console.log("MLOAD");
      const offset = stack.shift();
      if ((offset + BigInt(31)) > msize) {
        msize = offset + BigInt(31);
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const value = memory[offset];
      let valueArray = new Uint8Array(32);
      for (let j = 0; j<32 && (offset+BigInt(j)) < memory.length; j++) {
        valueArray[j] = memory[offset+BigInt(j)];
      }
      stack.unshift(bigintConversion.bufToBigint(valueArray));
    }

    // MSTORE
    if (opcode == 0x52) {
      console.log("MSTORE");
      const offset = stack.shift();
      if ((offset + BigInt(31)) > msize) {
        msize = offset + BigInt(31);
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const value = stack.shift();
      const valueArray = new Uint8Array(32);
      const valueFrom = new Uint8Array(bigintConversion.bigintToBuf(value, true));
      console.log("valueFrom: ", valueFrom);

      const emptySize = 32 - valueFrom.length;

      for (let j = 0; j<valueFrom.length; j++) {
        valueArray[j+emptySize] = valueFrom[j];
      }
      console.log("valueArray: ", valueArray);
      for (let j = 0; j<32; j++) {
        memory[offset+BigInt(j)] = valueArray[j];
      }
      console.log("memory: ", memory);
    }

    // MSTORE8
    if (opcode == 0x53) {
      console.log("MSTORE8");
      const offset = stack.shift();
      console.log("offset: ", offset);
      if (offset > msize) {
        msize = offset;
        if (msize % BigInt(32) != 0) {
          msize += (BigInt(32) - msize % BigInt(32));
        }
      }
      const index = BigInt(31) - offset;
      const value = stack.shift();
      const valueArray = new Uint8Array(bigintConversion.bigintToBuf(value, true));
      console.log("valueArray: ", valueArray);
      memory[offset] = valueArray.reverse()[index];
      console.log("memory: ", memory);
    }

    // SLOAD
    if (opcode == 0x54) {
      console.log("SLOAD");
      const key = stack.shift();
      let value = BigInt(0);
      if (key in store) {
        value = store[key];
      }
      stack.unshift(value);
    }

    // SSTORE
    if (opcode == 0x55) {
      console.log("SSTORE");

      if (staticCall) {
        pc = code.size;
        success = false;
      } else {
        const key = stack.shift();
        const value = stack.shift();
        store[key] = value;
      }
    }

    // JUMP
    if (opcode == 0x56) {
      console.log("JUMP");
      const counter = stack.shift();
      pc = Number(counter);
    }

    // JUMPI
    if (opcode == 0x57) {
      console.log("JUMPI");
      const counter = stack.shift();
      const condition = stack.shift();
      if (condition != BigInt(0)) {
        pc = Number(counter);
      }
    }

    // PC
    if (opcode == 0x58) {
      console.log("PC");
      stack.unshift(BigInt(pc-1));
    }

    // MSIZE
    if (opcode == 0x59) {
      console.log("MSIZE");
      stack.unshift(msize);
    }

    // GAS
    if (opcode == 0x5A) {
      console.log("GAS");
      stack.unshift(MAX_2_256 - BigInt(1));
    }

    // PUSHN (0x60 to 0x7F)
    if (opcode >= 96 && opcode <= 127) {
      const n = opcode - 95;
      const value = code.slice(pc, pc+n);
      pc += n;
      console.log("PROCESING PUSH", n, " with value: ", value);
      const valueBigInt = bigintConversion.bufToBigint(value);
      stack.unshift(valueBigInt);
    }

    // DUPN (0x80 to 0x8F)
    if (opcode >= 128 && opcode <= 143) {
      const n = opcode - 128;
      console.log("DUP", n);
      const value = stack[n];
      stack.unshift(value);
    }

    // SWAPN (0x90 to 0x9F)
    if (opcode >= 144 && opcode <= 159) {
      const n = opcode - 143;
      console.log("SWAP", n);
      const value1 = stack[0];
      const value2 = stack[n];
      stack[0] = value2;
      stack[n] = value1;
    }

    // LOGN (0xA0 to 0xA4)
    if (opcode >= 160 && opcode <= 164) {
      const n = opcode - 160;
      console.log("LOG", n);
      const offset = stack.shift();
      const size = stack.shift();

      const topics = [];
      for (let j=0; j<n; j++) {
        topics.push(stack.shift());
      }

      const addressHex = tx.to;

      console.log("memory: ", memory);

      const dataArray = memory;
      const valueArray = new Uint8Array(Number(size));

      const dataSlice = dataArray.slice(Number(offset), Number(offset) + Number(size));

      for (let j = 0; j<dataSlice.length; j++) {
        valueArray[j] = dataSlice[j];
      }

      console.log("valueArray: ", valueArray);

      logs.push({
        address: addressHex,
        data: bigintConversion.bufToHex(valueArray),
        topics: topics.map(topic => "0x" + bigintConversion.bigintToHex(topic))
      })
    }

    // CREATE
    if (opcode == 0xF0) {
      console.log("CREATE");
      const value = stack.shift();
      const offset = stack.shift();
      const size = stack.shift();

      // address = keccak256(rlp([sender_address,sender_nonce]))[12:]

      const address = tx.to;

      console.log("address: ", address);

      console.log("offset: ", offset);
      console.log("size: ", size);
      console.log("memory: ", memory);

      // TODO: check empty
      const subCode = memory.slice(Number(offset), Number(offset)+Number(size));

      console.log("subCode: ", subCode);

      if (!state) {
        state = {};
      }

      state[address] = {
        balance: "0x" + bigintConversion.bigintToHex(value)
      };

      if (Number(size) > 0) {


        let subTx = {};

        if (tx && tx.to) {
          subTx.from = tx.to;
        }

        const subResult = evm(subCode, subTx, state, block);

        console.log("subResult: ", subResult);
        console.log("memory: ", memory);

        if (subResult.success) {

          state[address].code = {
            bin: subResult.return
          }

          stack.unshift(bigintConversion.hexToBigint(address.split('x')[1]))
        } else {
          stack.unshift(BigInt(0))
        }

      } else {
        stack.unshift(bigintConversion.hexToBigint(address.split('x')[1]))
      }
    }

    // CALL
    if (opcode == 0xF1) {
      console.log("CALL");
      const gas = stack.shift();
      const address = stack.shift();
      const value = stack.shift();
      const argsOffset = stack.shift();
      const argsSize = stack.shift();
      const retOffset = stack.shift();
      const retSize = stack.shift();

      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);

      // TODO: check empty
      const subCode = hexStringToUint8Array(state[addressHex].code.bin);

      console.log("subCode: ", subCode);

      let subTx = {};

      if (tx && tx.to) {
        subTx.from = tx.to;
      }

      subTx.to = addressHex;

      const subResult = evm(subCode, subTx, state, block);

      console.log("subResult: ", subResult);
      console.log("memory: ", memory);

      let subResultSuccess = BigInt(0);
      if (subResult.success) {
        subResultSuccess = BigInt(1);
      }

      stack.unshift(subResultSuccess);

      if (subResult.return.length > 0) {
        subResultReturn = bigintConversion.hexToBuf(subResult.return);
        console.log("subResultReturn: ", subResultReturn);

        for (let j=0; j<subResultReturn.length; j++) {
          memory[retOffset+BigInt(j)] = subResultReturn[j];
        }

        console.log("memory: ", memory);
      }
    }

    // RETURN
    if (opcode == 0xF3) {
      console.log("RETURN");
      const offset = stack.shift();
      const size = stack.shift();

      console.log("memory: ", memory);

      const dataSlice = memory.slice(Number(offset), Number(offset) + Number(size));

      returnData = bigintConversion.bufToHex(dataSlice);
    }

    // DELEGATECALL
    if (opcode == 0xF4) {
      console.log("DELEGATECALL");
      const gas = stack.shift();
      const address = stack.shift();
      const value = stack.shift();
      const argsOffset = stack.shift();
      const argsSize = stack.shift();
      const retOffset = stack.shift();
      const retSize = stack.shift();

      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);

      // TODO: check empty
      const subCode = hexStringToUint8Array(state[addressHex].code.bin);

      console.log("subCode: ", subCode);

      let subTx = {};

      if (tx && tx.to) {
        subTx.to = tx.to;
      }

      const subResult = evm(subCode, subTx, state, block, store);

      console.log("subResult: ", subResult);
      console.log("memory: ", memory);

      let subResultSuccess = BigInt(0);
      if (subResult.success) {
        subResultSuccess = BigInt(1);
      }

      stack.unshift(subResultSuccess);

      if (subResult.return.length > 0) {

        subResultReturn = bigintConversion.hexToBuf(subResult.return);
        console.log("subResultReturn: ", subResultReturn);

        for (let j=0; j<subResultReturn.length; j++) {
          memory[retOffset+BigInt(j)] = subResultReturn[j];
        }

        console.log("memory: ", memory);
      }
    }

    // STATICCALL
    if (opcode == 0xFA) {
      console.log("STATICCALL");
      const gas = stack.shift();
      const address = stack.shift();
      const argsOffset = stack.shift();
      const argsSize = stack.shift();
      const retOffset = stack.shift();
      const retSize = stack.shift();

      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);

      // TODO: check empty
      const subCode = hexStringToUint8Array(state[addressHex].code.bin);

      console.log("subCode: ", subCode);

      let subTx = {};

      if (tx && tx.to) {
        subTx.from = tx.to;
      }

      const subResult = evm(subCode, subTx, state, block, {}, true);

      console.log("subResult: ", subResult);
      console.log("memory: ", memory);

      let subResultSuccess = BigInt(0);
      if (subResult.success) {
        subResultSuccess = BigInt(1);
      }

      stack.unshift(subResultSuccess);

      if (subResult.return.length > 0) {
        subResultReturn = bigintConversion.hexToBuf(subResult.return);
        console.log("subResultReturn: ", subResultReturn);

        for (let j=0; j<subResultReturn.length; j++) {
          memory[retOffset+BigInt(j)] = subResultReturn[j];
        }

        console.log("memory: ", memory);
      }
    }

    // REVERT
    if (opcode == 0xFD) {
      console.log("REVERT");
      const offset = stack.shift();
      const size = stack.shift();

      console.log("memory: ", memory);

      const dataSlice = memory.slice(Number(offset), Number(offset) + Number(size));

      success = false;
      returnData = bigintConversion.bufToHex(dataSlice);
    }

    // INVALID
    if (opcode == 0xFE) {
      console.log("INVALID");

      success = false;
      stack = [];
    }

    // SELFDESTRUCT
    if (opcode == 0xFF) {
      console.log("SELFDESTRUCT");
      const address = stack.shift();
      const addressHex = "0x" + bigintConversion.bigintToHex(address);
      console.log("addressHex: ", addressHex);

      const balance = state[tx.to].balance;
      console.log("balance: ", balance);

      state[tx.to].balance = "0x0";
      state[tx.to].code = {};

      let destBalance = "0x0";

      if (state && state[addressHex] && state[addressHex].balance) {
        destBalance = state[addressHex].balance;
        console.log("destBalance: ", destBalance);
      } else {
        state[addressHex] = {};
      }

      const newBalance = bigintConversion.hexToBigint(balance.split('x')[1]) + bigintConversion.hexToBigint(destBalance.split('x')[1]);
      console.log("newBalance: ", newBalance);

      state[addressHex].balance = bigintConversion.bigintToHex(balance);
    }

  }

  return { stack: stack, logs: logs, success: success, return: returnData };
}
