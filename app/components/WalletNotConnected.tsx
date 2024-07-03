import { FC } from "react"
import styles from "../styles/Home.module.css"
import dynamic from "next/dynamic"


export const WalletButton: FC = () => {
    const WalletMultiButtonDynamic = dynamic(
        async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
        { ssr: false }
    );
  return (
    // <div className={styles.AppHeader}>
    <div className={styles.walletButton}>Button
      <WalletMultiButtonDynamic />
    </div>
  )
}