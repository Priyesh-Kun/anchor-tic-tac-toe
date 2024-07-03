import {
    useConnection,
    useAnchorWallet
} from "@solana/wallet-adapter-react";
import * as anchor from "../node_modules/@coral-xyz/anchor"
import {
    useEffect,
    useMemo,
    useState
} from "react";
import idl from "../idl.json"

export interface Invitation {
    index: number
    inviterAuthority: anchor.web3.PublicKey
    inviteeAuthority: anchor.web3.PublicKey
    inviter: anchor.web3.PublicKey
    invitee: anchor.web3.PublicKey
    gameAccount: anchor.web3.PublicKey
    pending: boolean
}

export interface PlayerData {
    authority: anchor.web3.PublicKey
    tiles: Array<number>
    inGame: boolean
    hasChance: boolean
    lastGame: number
    lastInvitation: number
}

export function useHooks() {
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();

    const [program, setProgram] = useState<anchor.Program>();
    const [player, setPlayer] = useState<string>("");
    const [playerInfo, setPlayerInfo] = useState<PlayerData>();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [transactionUrl, setTransactionUrl] = useState<string>("");
    const [invitations, setInvitations] = useState<Array<Invitation>>([]);
    const [invitationsAccount, setInvitationsAccount] = useState<string>();
    const [gameAccount, setGameAccount] = useState<string>("")
    const [opponent, setOpponent] = useState<string>();
    const [opponentAuthority, setOpponentAuthority] = useState<string>("");
    const [opponentInfo, setOpponentInfo] = useState<anchor.AccountClient>();

    const authorFilter = (authorBase58PublicKey) => ({
        memcmp: {
            offset: 8, // Discriminator.
            bytes: authorBase58PublicKey,
        },
    })

    useEffect(() => {
        let provider: anchor.Provider;

        try {
            provider = anchor.getProvider();
        } catch (error) {
            provider = new anchor.AnchorProvider(connection, anchorWallet, {});
            anchor.setProvider(provider);
        }

        const program = new anchor.Program(idl as anchor.Idl);
        setProgram(program);
        const [player, _player] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("USER_STATE"),
                anchorWallet.publicKey.toBytes(),
            ],
            program.programId
        )

        const [invitationsAccount, _invitationsAccount] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("INVITATION_STATE"),
            ],
            program.programId
        )

        const account = async () => {
            let response = await program.account.playerData.fetchNullable(player, 'confirmed');
            let invitationsData = await program.account.invitationsAccount.fetchNullable(invitationsAccount, 'confirmed');


            if (invitationsData == null) {
                initializeInvitationsAccount()
            }

            if (response == null) {
                setInitialized(false);
            }
            else {
                setInitialized(true);
                setPlayerInfo(response);
                setInvitations(invitationsData.invitations);
                setGameAccount(response.gameAccount.toBase58())
                const gameInvitationArray = invitationsData.invitations.filter(invitation => invitation.gameAccount.toBase58() == response.gameAccount.toBase58())
                if (gameInvitationArray.length > 0 && gameInvitationArray[0].invitee.toBase58() == player.toBase58()) {
                    setOpponentAuthority(gameInvitationArray[0].inviterAuthority.toBase58())
                    setOpponent(gameInvitationArray[0].inviter.toBase58())
                }
                else if (gameInvitationArray.length > 0 && gameInvitationArray[0].inviter.toBase58() == player.toBase58()) {
                    setOpponentAuthority(gameInvitationArray[0].inviteeAuthority.toBase58())
                    setOpponent(gameInvitationArray[0].invitee.toBase58())
                }
            }
        }
        setPlayer(player.toBase58());
        setInvitationsAccount(invitationsAccount.toBase58());
        const intervalId = setInterval(() => {
            account();
        }, 500);

        return () => clearInterval(intervalId);

    }, [])



    const initializeInvitationsAccount = async () => {
        const tx = await program.methods
            .initializeInvitationsAccount()
            .accounts({
                authority: anchorWallet.publicKey,
            })
            .rpc()
        setTransactionUrl(`https://explorer.solana.com/tx/${tx}?cluster=devnet`)

    }

    const initializePlayer = async () => {
        const tx = await program.methods
            .initializePlayer()
            .accounts({
                authority: anchorWallet.publicKey,
                player: new anchor.web3.PublicKey(player),
            })
            .rpc()
        setTransactionUrl(`https://explorer.solana.com/tx/${tx}?cluster=devnet`)
    }

    const createInvitation = async (inviteeAuthority: string) => {
        let invitationsAccountKey = new anchor.web3.PublicKey(invitationsAccount)
        let invitationsLength = invitations.length
        let [gameAccount, _gameAccount] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("GAME_STATE"),
                invitationsAccountKey.toBytes(),
                Buffer.from(invitationsLength.toString())
            ],
            program.programId,
        )
        let inviteeAuthorityKey = new anchor.web3.PublicKey(inviteeAuthority);
        let [invitee, _invitee] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("USER_STATE"),
                inviteeAuthorityKey.toBytes()
            ],
            program.programId
        )
        const tx = await program.methods
            .createInvitation()
            .accounts({
                inviterAuthority: anchorWallet.publicKey,
                inviteeAuthority: inviteeAuthorityKey,
                inviter: new anchor.web3.PublicKey(player),
                invitee: invitee,
                invitationsAccount: invitationsAccountKey,
                gameAccount: gameAccount,
            })
            .signers([])
            .rpc()

        setTransactionUrl(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        setGameAccount(gameAccount.toBase58());
    }

    const acceptInvitation = async (invitation: Invitation) => {
        const tx = await program.methods
            .acceptInvitation(invitation)
            .accounts({
                inviterAuthority: invitation.inviterAuthority,
                inviteeAuthority: anchorWallet.publicKey,
                inviter: invitation.inviter,
                invitee: invitation.invitee,
                invitationsAccount: new anchor.web3.PublicKey(invitationsAccount),
                gameAccount: new anchor.web3.PublicKey(invitation.gameAccount)
            })
            .rpc()
        setTransactionUrl(`https://explorer.solana.com/tx/${tx}?cluster=devnet`)
    }

    const makeMove = async (opponentAuthority: string, invitation: Invitation, tile: number) => {
        let opponentAuthorityKey = new anchor.web3.PublicKey(opponentAuthority);
        let [opponent, _opponent] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("USER_STATE"),
                opponentAuthorityKey.toBytes()
            ],
            program.programId
        )
        const tx = await program.methods
            .makeMove(invitation, tile)
            .accounts({
                playerAuthority: anchorWallet.publicKey,
                opponentAuthority: opponentAuthorityKey,
                player: new anchor.web3.PublicKey(player),
                opponent: opponent,
                invitationsAccount: new anchor.web3.PublicKey(invitationsAccount),
                gameAccount: new anchor.web3.PublicKey(gameAccount),
            })
            .rpc()
        setTransactionUrl(`https://explorer.solana.com/tx/${tx}?cluster=devnet`)
    }
    const gameInvitationArray = useMemo(() => invitations.filter((invitation) => invitation.gameAccount.toBase58() == gameAccount), [invitations]);
    const pendingInvitationArray = useMemo(() => invitations.filter((invitation) => invitation.pending), [invitations]);
    return { initialized, initializePlayer, createInvitation, acceptInvitation, makeMove, player, playerInfo, pendingInvitationArray, gameInvitationArray, transactionUrl, opponentInfo, opponentAuthority, opponent, setOpponentInfo }
}