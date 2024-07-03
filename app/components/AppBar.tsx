import { FC, useEffect, useState } from "react";
import { CreateInvitation } from "./CreateInvitation";
import { Invitation } from "../hooks/hooks";
import styles from "../styles/Home.module.css"

export interface Props {
    initialized
    initializePlayer
    createInvitation
    acceptInvitation
    pendingInvitationArray: Invitation[]
    player: string
}

export const AppBar: FC<Props> = ({ initialized, initializePlayer, createInvitation, acceptInvitation, pendingInvitationArray, player }) => {
    const [invitation, setInvitation] = useState<Invitation>()
    const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);

    useEffect(() => {
        let invitation = pendingInvitationArray.find((invitation) => invitation.invitee.toBase58() == player);
        if (invitation) {
            setInvitation(invitation);
        }
    })

    const handleCreateClick = async () => {
        setIsCreateVisible(prevState => !prevState)
    }

    const onClickAcceptInvitation = async () => {
        acceptInvitation(invitation)
    }

    const onclick = async () => {
        initializePlayer()
    }

    return (
        <div className={styles.AppBar}>
            Tic Tac Toe
            <div className={styles.features}>
                
                {initialized ? (
                    <div>
                        <button>Initialized</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={onclick}>Initialize</button>
                    </div>

                )}
                {invitation ? (
                    <div>
                        <button onClick={onClickAcceptInvitation}>Accept Invitation</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={handleCreateClick}>{isCreateVisible ? "Hide" : "Create Invitation"}</button>
                        {isCreateVisible && <CreateInvitation createInvitation={createInvitation} />}
                        
                    </div>
                )}
            </div>
        </div>
    )
}