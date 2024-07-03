import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import * as web3 from '@solana/web3.js';
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config"
describe("tic-tac-toe", () => {
    const program = anchor.workspace.TicTacToe as Program<TicTacToe>;
    const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed")
    const [address, _address] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("INVITATION_STATE")], program.programId)
    const accountInfo = async () => {
        const info = await program.account.invitationsAccount.fetchNullable(address)
        console.log(info.invitations[0].pending)
    }
    accountInfo()
});