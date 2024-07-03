import { FC, useEffect, useState } from "react";
import { Invitation } from "../hooks/hooks";
import styles from "../styles/Home.module.css"
import { PlayerData } from "../hooks/hooks";
import {
    useConnection,
    useAnchorWallet
} from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor"
import idl from "../idl.json"

export interface Props {
    gameInvitationArray,
    makeMove,
    player,
    playerInfo: PlayerData
    opponent,
    opponentAuthority,
    opponentInfo: PlayerData
    setOpponentInfo
}

export const GameBox: FC<Props> = ({ gameInvitationArray, makeMove, player, playerInfo, opponentAuthority, opponentInfo, opponent, setOpponentInfo }) => {
    const [invitation, setInvitation] = useState<Invitation>()
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const gameBoard = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    useEffect(() => {
        setInvitation(gameInvitationArray[0]);

        let provider: anchor.Provider;

        try {
            provider = anchor.getProvider();
        } catch (error) {
            provider = new anchor.AnchorProvider(connection, anchorWallet, {});
            anchor.setProvider(provider);
        }

        const program = new anchor.Program(idl as anchor.Idl);

        const account = async () => {
            let opponentInfo = await program.account.playerData.fetchNullable(new anchor.web3.PublicKey(opponent));
            setOpponentInfo(opponentInfo)
        }
        account()
        const intervalId = setInterval(() => {
            account();
        }, 500);

        return () => clearInterval(intervalId);

    },[invitation])

    const onTileClick = async (index: number) => {
        makeMove(opponentAuthority, invitation, index)
    }
    const onDumbClick = async (index: number) => {

    }

    return (
        <div className={playerInfo.hasChance ? styles.hasChance : styles.notHasChance}>
                <div className={styles.player}><strong>Player:</strong> <br />{anchorWallet.publicKey.toBase58()}</div>
            <div className={styles.board}>
                {
                    opponentInfo &&
                    gameBoard.map((index) => (
                        <button
                            key={index}
                            className={playerInfo.tiles.includes(index) ? styles.playerTile : (opponentInfo.tiles.includes(index) ? styles.opponentTile : styles.neutralTile)}
                            onClick={() => playerInfo.hasChance ? onTileClick(index) : onDumbClick(index)}>
                        </button>
                    ))
                }

            </div>
            <div className={styles.opponent}><strong>Opponent:</strong> <br />{opponentAuthority}</div>
        </div>
    )
}
