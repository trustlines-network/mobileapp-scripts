import admin from 'firebase-admin'
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

const optionDefinitions = [
    {
        name: 'token', alias: 't', type: String, defaultOption: true
    },
    {
        name: 'help', alias: 'h', type: Boolean
    }
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Send a test notification to the specified token',
        content: 'This script sends a test notification to the specified firebase token'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'token',
                alias: 't',
                type: Number,
                description: 'The registration token to send the message to',
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

if (options.help) {
    console.log(usage)
    process.exit()
}

if (!options.token) {
    console.warn('You need to provide a token')
    console.log(usage)
    process.exit()
}

const init = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });

    const registrationToken = options.token
    const message = {
            "data": {
                "blockHash": "0x3b6f349e381d165ceaf7813c3059be23e6c41edd7e8224fe5b59d29fa47048a6",
                "transactionHash": "0xbc8c083c87f78590174f52017e5df6e43ed73510e3e89a265a6602e50f5a7ab1",
                "logIndex": "0",
                "blockNumber": "1487062",
                "messageTitle": "notification 22",
                "messageBody": "notification+body+is+here 3"
            },
            "android": {
                "priority": "HIGH"
            },
            "apns": {
                "payload": {
                    "aps": {
                        "content-available": 1
                    }
                },
                "headers": {
                    "apns-push-type": "background",
                    "apns-priority": "5",
                    "apns-collapse-id": "meykey"
                }
            },
            "notification": {
                "title": "don#t disply this1",
                "body": "don#t display this"
            },
        token: registrationToken
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    return admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

}

init().then(() => {
    process.exit();
})
