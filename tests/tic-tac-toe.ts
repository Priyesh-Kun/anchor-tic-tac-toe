import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import * as web3 from '@solana/web3.js';
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config"

describe("tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;

  let authority1 = getKeypairFromEnvironment("USER_1");
  let authority2 = getKeypairFromEnvironment("USER_2");

  let p1LastGame = 0;
  let p2LastGame = 0;

  let [player1, _1] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("USER_STATE"),
      authority1.publicKey.toBytes()
    ],
    program.programId
  )
  let [player2, _2] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("USER_STATE"),
      authority2.publicKey.toBytes()
    ],
    program.programId
  )
  let [invitationsAccount, _inv] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("INVITATION_STATE")
    ],
    program.programId
  )
  let [gameAccount, _game] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("GAME_STATE"),
      invitationsAccount.toBytes(),
      Buffer.from(p1LastGame.toString())
    ],
    program.programId
  )

  interface Invitation {
    index: number
    inviter: web3.PublicKey
    invitee: web3.PublicKey
    gameAccount: web3.PublicKey
    pending: boolean
  }

  let invitation: Invitation = {
    index: p2LastGame,
    invitee: player2,
    inviter: player1,
    gameAccount: gameAccount,
    pending: true,
  }


  // it("Player1 Initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initializePlayer()
  //     .accounts({
  //       authority: authority1.publicKey,
  //       player: player1
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Player2 Initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initializePlayer()
  //     .accounts({
  //       authority: authority2.publicKey,
  //       player: player2
  //     })
  //     .signers([authority2])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Invitations Account Initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initializeInvitationsAccount()
  //     .accounts({
  //       payer: authority1.publicKey,
  //       invitationsAccount: invitationsAccount,
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Created Invitation!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.createInvitation()
  //     .accounts({
  //       inviterAuthority: authority1.publicKey,
  //       inviteeAuthority: authority2.publicKey,
  //       inviter: player1,
  //       invitee: player2,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Accepted Invitation!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.acceptInvitation(invitation)
  //     .accounts({
  //       inviterAuthority: authority1.publicKey,
  //       inviteeAuthority: authority2.publicKey,
  //       inviter: player1,
  //       invitee: player2,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority2])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("First Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 1)
  //     .accounts({
  //       playerAuthority: authority1.publicKey,
  //       opponentAuthority: authority2.publicKey,
  //       player: player1,
  //       opponent: player2,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Second Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 4)
  //     .accounts({
  //       playerAuthority: authority2.publicKey,
  //       opponentAuthority: authority1.publicKey,
  //       player: player2,
  //       opponent: player1,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority2])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Third Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 2)
  //     .accounts({
  //       playerAuthority: authority1.publicKey,
  //       opponentAuthority: authority2.publicKey,
  //       player: player1,
  //       opponent: player2,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Second Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 5)
  //     .accounts({
  //       playerAuthority: authority2.publicKey,
  //       opponentAuthority: authority1.publicKey,
  //       player: player2,
  //       opponent: player1,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority2])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("First Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 3)
  //     .accounts({
  //       playerAuthority: authority1.publicKey,
  //       opponentAuthority: authority2.publicKey,
  //       player: player1,
  //       opponent: player2,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority1])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
  // it("Second Move!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.makeMove(invitation, 6)
  //     .accounts({
  //       playerAuthority: authority2.publicKey,
  //       opponentAuthority: authority1.publicKey,
  //       player: player2,
  //       opponent: player1,
  //       invitationsAccount: invitationsAccount,
  //       gameAccount: gameAccount,
  //     })
  //     .signers([authority2])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
  // });
});