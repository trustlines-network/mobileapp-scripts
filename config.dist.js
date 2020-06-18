import {WALLET_TYPE_IDENTITY} from "trustlines-clientlib/lib-esm/wallets/TLWallet";

export const config = {
    relayUrl: "http://localhost:5000/api/v1",
    messagingUrl: "http://localhost:5000/api/v1",
    chainId: 17,
    walletType: WALLET_TYPE_IDENTITY,
    identityFactoryAddress: "0x26C8d09E5C0B423E2827844c770F61c9af2870E7",
    identityImplementationAddress: "0x3DD0864668C36D27B53a98137764c99F9FD5B7B2",
}
