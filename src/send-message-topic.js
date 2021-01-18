import admin from 'firebase-admin'
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

const optionDefinitions = [
    {
        name: 'topic', alias: 't', type: String, defaultOption: true
    },
    {
        name: 'data', alias: 'd', type: String, defaultOption: false
    },
    {
        name: 'help', alias: 'h', type: Boolean
    }
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Send a a message to topic',
        content: 'This script sends a message to topic'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'topic',
                alias: 't',
                type: String,
                description: 'The topic of the message',
            },
            {
                name: 'data',
                alias: 'd',
                type: String,
                description: 'The message data',
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

if (!options.topic) {
    console.warn('You need to provide a topic')
    console.log(usage)
    process.exit()
}

if (!options.data) {
    console.warn('You need to provide message data')
    console.log(usage)
    process.exit()
}

const init = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });

    const payload = {
        "topic": options.topic,
        "data": JSON.parse(options.data),
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    return admin.messaging().send(payload)
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
