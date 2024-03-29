import {TLNetwork} from "@trustlines/trustlines-clientlib";
import {config} from "../config";
import fs from "fs";

/**
 * Generate the specified number of TLNetwork instances
 *
 * @param instances
 * @returns {[]}
 */
export function generateTlIntances(instances = 2) {
    const initialized = []
    for (let i = 0; i < instances; i++) {
        // @ts-ignore
        const instance = new TLNetwork(config)
        initialized.push(instance)
    }

    return initialized
}

/**
 * Create users for the passed array of instances and deploy their identities
 *
 * @param tlInstances
 * @returns {Promise<[(number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint)]>}
 */
export async function createAndLoadUsers(tlInstances) {
    return Promise.all(
        tlInstances.map(async tl => {
            const walletData = await tl.user.create()

            await tl.user.loadFrom(walletData)
            try {
                await tl.user.deployIdentity()
            } catch (e) {
                console.log('couldnt deploy identity', e)
            }


            return walletData
        })
    )
}

/**
 * Create a trustline between 2 instances
 *
 * @param networkAddress
 * @param tl1
 * @param tl2
 * @param given
 * @param received
 * @returns {Promise<void>}
 */
export async function setTrustlines(networkAddress, tl1, tl2, given, received) {
    const [tx1, tx2] = await Promise.all([
        tl1.trustline.prepareUpdate(
            networkAddress,
            tl2.user.address,
            given,
            received,
            { transfer: 222, interestRateGiven: 10, interestRateReceived: 10 }
        ),
        tl2.trustline.prepareUpdate(
            networkAddress,
            tl1.user.address,
            received,
            given,
            { transfer: -222, interestRateGiven: 10, interestRateReceived: 10 }
        )
    ])

    return Promise.all([
        tl1.trustline.confirm(tx1.rawTx),
        tl2.trustline.confirm(tx2.rawTx)
    ])
}


/**
 * Wait for the specified amount of time
 *
 * @param ms
 * @returns {Promise<unknown>}
 */
export function wait(ms = 2000) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}


export function storeCredentials(users) {
    const accounts = users.map((user) => {
        return `${user.address} | ${user.meta.signingKey.mnemonic} | ${user.meta.signingKey.privateKey}`
    }).reduce((prev, curr) => {
        return prev + "\n" + curr
    }, "")

    fs.appendFile('accounts.txt', accounts, function (err) {
        if (err) throw err;
        console.log('Accounts credentials saved to accounts.txt!');
    });
}
