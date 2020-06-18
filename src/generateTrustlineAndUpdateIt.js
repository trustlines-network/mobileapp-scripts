/**
 * This script generates: accounts, trustlines and transactions between the accounts
 */

import {TLNetwork} from "trustlines-clientlib"
import fetch from 'node-fetch'
import fs from "fs"
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import {createAndLoadUsers, generateTlIntances, setTrustlines, wait} from "./utils";
// Do some magic for dependencies that are not available in node
global.fetch = fetch;
global.Headers = fetch.Headers;

const optionDefinitions = [
    {
        name: 'count', alias: 'c', type: Number,
        defaultValue: 5
    },
    {name: 'currencyNetwork', alias: 'n', type: String, defaultOption: true},
    {name: 'help', alias: 'h', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Update a trustline until it fails',
        content: 'This scripts tries to update a trustline until the update fails.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'count',
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


async function expectTrustlinesToEqualTo(networkAddress, TlInstance, contactAddress, given, received) {
    // console.log('contact address', contactAddress)
    const trustline = await TlInstance.trustline.get(networkAddress, contactAddress)

    const tlReceived = Number(trustline.received.value)
    const tlGiven = Number(trustline.given.value)
    console.log('trustline', trustline.id, tlReceived, tlGiven, given, received)

    const valueCorrect = tlGiven === given && tlReceived === received

    if(!valueCorrect) {
        console.log('value for this trustline doesnt match: ', trustline)
    }
    return valueCorrect
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

    console.log('user1 address', users[1].address)

    for (let i = 1; i < options.count; i++) {
        await setTrustlines(currencyNetworkAddress, tlInstances[0], tlInstances[1], i, i)
        await wait(750)

        // console.log(tlInstances[0])
        const expectEqual = await expectTrustlinesToEqualTo(currencyNetworkAddress, tlInstances[0], tlInstances[1].user.address, i, i)

        if(!expectEqual) {
            console.log('something is wrong, check the trustline!')
            break;
        }
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
