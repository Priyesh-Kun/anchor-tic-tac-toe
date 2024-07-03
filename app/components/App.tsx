import { FC } from "react";
import { useHooks } from "../hooks/hooks";
import { AppBar } from "./AppBar";
import { PlayerData } from "../hooks/hooks";
import styles from "../styles/Home.module.css"
import { GameBox } from "./GameBox";

export const App: FC = () => {
    let { initialized, initializePlayer, createInvitation, acceptInvitation, makeMove, player, playerInfo, pendingInvitationArray, gameInvitationArray, transactionUrl, opponentInfo, opponentAuthority, opponent, setOpponentInfo } = useHooks();
    // console.log(playerInfo,opponentInfo)
    return (
        <div>
            <AppBar
                initialized={initialized}
                initializePlayer={initializePlayer}
                createInvitation={createInvitation}
                acceptInvitation={acceptInvitation}
                pendingInvitationArray={pendingInvitationArray}
                player={player}
            />
            {initialized && playerInfo.inGame && opponent ? <GameBox gameInvitationArray={gameInvitationArray} makeMove={makeMove} player={player} playerInfo={playerInfo} opponentInfo={opponentInfo} opponent={opponent} opponentAuthority={opponentAuthority} setOpponentInfo={setOpponentInfo} /> :
                <div className={styles.intro}>
                    <h1>Welcome to Tic Tac Toe on Solana!</h1>
                    <p>Welcome to the blockchain-based Tic Tac Toe game powered by Solana and the Anchor framework! This guide will help you get started with initializing your player account and inviting other players to join the fun. Let's dive in!</p>
                    <h2>Step 1: Initialize Your Player Account</h2>
                    <p>To get started, you need to initialize your player account. This account will store your player data, including your game statistics and tile positions. Follow these simple steps:
                    </p>
                    <ol>
                        <li><strong>Connect Your Wallet:</strong> Click on the "Connect Wallet" button at the top right corner of the page. This will prompt you to connect your Solana wallet.</li>
                        <li><strong>Initialize Account:</strong> Once your wallet is connected, click on the "Initialize Account" button. This will create a new player account for you on the Solana blockchain. You will see a confirmation message once your account is successfully created.</li>
                    </ol>
                    <h2>Step 2: Invite Players to a Game</h2>
                    <p>Once your player account is set up, you can invite other players to join a game. To invite a player, you will need their wallet address. Here's how you can send an invitation:
                    </p>
                    <ol>
                        <li><strong>Enter Wallet Address:</strong> In the "Invite Player" section, enter the wallet address of the player you want to invite.</li>
                        <li><strong>Send Invitation:</strong> Click on the "Send Invitation" button. This will send an invitation to the specified wallet address.</li>
                    </ol>
                    <h2>Step 3: Accepting Invitations</h2>
                    <p>If you have received an invitation, you can accept it to start a game. Follow these steps to accept an invitation:
                    </p>
                    <ol>
                        <li><strong>View Invitations:</strong> Go to the "Invitations" section to view all the invitations you have received.</li>
                        <li><strong>Accept Invitation:</strong> Click on the "Accept" button next to the invitation you want to accept. This will initialize the game account and start the game.</li>
                    </ol>
                    <h1>Enjoy the Game!</h1>


                </div>}
        </div>

    )
}