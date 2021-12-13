import fetch from 'node-fetch'
import fs from "fs"
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import {stringify} from "csv-stringify"
import {calcValue} from "@trustlines/trustlines-clientlib/lib-esm/utils";

// Do some magic for dependencies that are not available in node
global.fetch = fetch;
global.Headers = fetch.Headers;

import {config} from "../config";


const optionDefinitions = [
    {
        name: 'account', alias: 'a', type: String,
    },
    {name: 'currencyNetwork', alias: 'n', type: String},
    {name: 'help', alias: 'h', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Generate a Report the specified network and account',
        content: 'This script generates .csv files with the transfers of the account in the specified network. It also ' +
            'fetches all connections of that account and gets their balances and sent transfers.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'account',
                alias: 'a',
                type: String,
                description: 'The user account.',
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
 * Get the connections of the account
 *
 * @returns {Promise<string[]>}
 */
const getUniqConnectionsOfAccount = async () => {
    const response = await fetch(`${config.relayUrl}/networks/${options.currencyNetwork}/users/${options.account}/mediation-fees`)
    const transfers = await response.json()

    const addresses = Object.keys(transfers.mediationFees.reduce((prev, curr) => {
        prev[curr.from] = true
        prev[curr.to] = true

        return prev
    }, {}))


    return addresses
}

/**
 * Get the balance of all connections of account
 *
 * @param members
 * @returns {Promise<{given: number, balance: number, received: number, leftGiven: number, url: *, leftReceived: number}[]>}
 */
const getBalanceForConnections = async (members) => {
    const requests = members.map(member => {
        return fetch(`${config.relayUrl}/networks/${options.currencyNetwork}/users/${member}`)
    })

    return Promise.all(requests).then(results => {
        return Promise.all(results.map(async (r) => {
            const result = await r.json()
            return {
                url: r.url,
                ...result,
                received: parseFloat(calcValue(result.received, 5)),
                leftGiven: parseFloat(calcValue(result.leftGiven, 5)),
                given: parseFloat(calcValue(result.given, 5)),
                balance: parseFloat(calcValue(result.balance, 5)),
                leftReceived: parseFloat(calcValue(result.leftReceived, 5)),
            }
        }))
    })
        .then(results => {
            return results
        })
}

const getTransfersForConnections = async (members) => {
    const requests = members.map(member => {
        return fetch(`${config.relayUrl}/networks/${options.currencyNetwork}/users/${member}/events?type=Transfer`)
    })

    return Promise.all(requests).then(results => {
        return Promise.all(results.map(async (r) => {
            const result = await r.json()

            let transfers = []
            try {
                transfers =  result.filter(event => event.direction === "sent").map(transfer => {
                    return {
                        url: r.url,
                        ...transfer,
                        amount: parseFloat(calcValue(transfer.amount, 5))
                    }
                })
            } catch (e) {
                console.log("filter fail", e, result, r)
            }

            return transfers
        }))
    })
        .then(results => {
            return results.flat()
        })

}

/**
 * Do some magic!
 *
 * @returns {Promise<void>}
 */
async function init() {

    const accountConnections = await getUniqConnectionsOfAccount()

    const memberBalances = await getBalanceForConnections(accountConnections)
    const anchorTransfers = await getTransfersForConnections([options.account])
    const memberTransfers = await getTransfersForConnections(accountConnections)

    stringify(anchorTransfers, {
        header: true
    }, function (err, output) {
        fs.writeFile(__dirname + '/anchorTransfers.csv', output, () => {
            console.log('anchor transfers written')
        });
    })

    stringify(memberBalances, {
        header: true
    }, function (err, output) {
        fs.writeFile(__dirname + '/memberBalances.csv', output, () => {
            console.log('member balances written')
        });
    })

    stringify(memberTransfers, {
        header: true
    }, function (err, output) {
        fs.writeFile(__dirname + '/memberTransfers.csv', output, () => {
            console.log('transfers written')
        });
    })

}

if (options.help) {
    console.log(usage)
} else {

    if (!options.account) {
        console.warn("You need to provide an account! Call script with -h for more info")
    } else if (!options.currencyNetwork) {
        console.warn("You need to provide a currency network! Call script with -h for more info")
    } else {
        init();
    }

}
