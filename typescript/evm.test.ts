import { expect, test } from "@jest/globals";
import evm from "./evm";
import tests from "../evm.json";

for (const t of tests as any) {
  if (t.pending) {
    test.todo(t.name);
  } else {

    test(t.name, () => {
      // Note: as the test cases get more complex, you'll need to modify this
      // to pass down more arguments to the evm function (e.g. block, state, etc.)
      // and return more data (e.g. state, logs, etc.)
  /*
      if (t.tx) {
        console.log("TX: ", t.tx);
        console.log("TX type: ", typeof t.tx);
      }
  */
      const result = evm(hexStringToUint8Array(t.code.bin), t.tx, t.state, t.block);

      expect(result.stack).toEqual(t.expect.stack ? t.expect.stack.map((item) => BigInt(item)) : []);
      expect(result.logs).toEqual(t.expect.logs || []);
      expect(result.success).toEqual(("success" in t.expect) ? t.expect.success : true);
      expect(result.return).toEqual(t.expect.return || []);
    });
  }
}

function hexStringToUint8Array(hexString: string) {
  return new Uint8Array(
    (hexString?.match(/../g) || []).map((byte) => parseInt(byte, 16))
  );
}
