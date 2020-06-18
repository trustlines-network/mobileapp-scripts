/**
 * This script generates: accounts, trustlines and transactions between the accounts
 */

import fetch from 'node-fetch'
import fs from "fs"
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

// Do some magic for dependencies that are not available in node
global.fetch = fetch;
global.Headers = fetch.Headers;

import {createAndLoadUsers, generateTlIntances, setTrustlines} from "./utils";


const optionDefinitions = [
    {
        name: 'paymentsCount', alias: 'c', type: Number,
        defaultValue: 5
    },
    {name: 'currencyNetwork', alias: 'n', type: String, defaultOption: true},
    {name: 'help', alias: 'h', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Generate random data',
        content: 'This scripts generates 2 random accounts, trustline between the accounts and a specified amount of payments between the 2 accounts.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'paymentsCount',
                alias: 'c',
                type: Number,
                description: 'The number of payments to generate between the 2 accounts.',
            },
            {
                name: 'currencyNetwork',
                alias: 'n',
                type: String,
                description: 'The currency network for which to generate a trustline and payments'
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Print this usage guide.'
            }
        ]
    }
]
const usage = commandLineUsage(sections)


/**
 * Generate random transfers between 2 addresses
 *
 * @param networkAddress
 * @param tl1
 * @param tl2
 * @returns {Promise<void>}
 */
async function generateRandomPaymentsBetweenAddresses(networkAddress, tl1, tl2) {
    // get a random number between -1 and +1
    const direction = Math.random()

    if (direction > 0.5) {
        await pay(networkAddress, tl1, tl2.user.address, 1)
    } else {
        await pay(networkAddress, tl2, tl1.user.address, 1)
    }
}

/**
 * Execute a payment from the instance to the specified address
 *
 * @param networkAddress
 * @param instance
 * @param address
 * @param amount
 * @returns {Promise<void>}
 */
async function pay(networkAddress, instance, address, amount) {
    try {
        const payment = await instance.payment.prepare(networkAddress, address, amount)
        await instance.payment.confirm(payment.rawTx)
    } catch (e) {
        console.log("couldn't make a payment:" + e.message)
    }

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

/**
 * Do some magic!
 *
 * @returns {Promise<void>}
 */
async function init() {
    const currencyNetworkAddress = options.currencyNetwork
    const tlInstances = generateTlIntances(2)

    const users = await createAndLoadUsers(tlInstances)

    await setTrustlines(currencyNetworkAddress, tlInstances[0], tlInstances[1], 1000, 1000)
    await wait(5000)
    // generate 200 random paymens between the 2 accounts
    for (let i = 0; i < options.paymentsCount; i++) {
        console.log('payment number', i+1)
        await generateRandomPaymentsBetweenAddresses(currencyNetworkAddress, tlInstances[0], tlInstances[1], 2, 1)
    }

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

if (options.help) {
    console.log(usage)
} else {

    if(options.currencyNetwork) {
        init();
    } else {
        console.warn("You need to provide a currencyNetwork! Call script with -h for more info")
    }

}
