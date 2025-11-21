import * as bril from "./bril-ts/bril.ts";
import { readStdin } from "./bril-ts/util.ts";

async function main() {
    const args: string[] = Array.from(Deno.args);

    const trace = JSON.parse(await Deno.readTextFile(args[0])) as {
        instrs: bril.Instruction[],
        lastTraced: number
    };
    const program = JSON.parse(await readStdin()) as bril.Program;

    const main = program.functions[program.functions.findIndex((fn) => fn.name === "main")];

    main.instrs.splice(trace.lastTraced, 0, {
        label: "donespeculating",
    });
    main.instrs = [
        {
            op: "speculate",
        },
        ...trace.instrs,
        {
            op: "commit",
        },
        {
            op: "jmp",
            labels: ["donespeculating"]
        },
        {
            label: "abortspeculate"
        },
        ...main.instrs
    ];

    console.log(JSON.stringify(program));
}

main();