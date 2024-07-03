import { FC, useEffect, useState } from "react";
import styles from "../styles/Home.module.css"

export interface Props {
    createInvitation
}

export const CreateInvitation: FC<Props> = ({ createInvitation }) => {
    const [inviteeAddress, setInviteeAddress] = useState<string>()

    const handleInputChange = (event) => {
        setInviteeAddress(event.target.value);
    }
    
    const onClick = async () => {
        createInvitation(inviteeAddress);
    }

    return (
        <div className={styles.createInvitation}>
            <input type="text" placeholder="Enter Wallet Address" value={inviteeAddress} onChange={handleInputChange}/>
            <button onClick={onClick}>Send Invite</button>
        </div>
    )
}