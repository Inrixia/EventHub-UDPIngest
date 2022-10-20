import { createSocket } from "dgram";

import { EventData, EventHubProducerClient } from "@azure/event-hubs";
import { envOrThrow } from "@inrixia/helpers/object";

import { promisify } from "util";
const sleep = promisify(setTimeout);

import { config } from "dotenv";
config();

type LogLevel = "fast" | "slow" | undefined;

(async () => {
	const eventHubProducer = new EventHubProducerClient(envOrThrow("EVENTHUB_CONNECTION_STRING"), envOrThrow("EVENTHUB_NAME"));

	const port = +envOrThrow("UDP_PORT");
	const logging: LogLevel = <LogLevel>process.env["LOGLEVEL"];
	const sendInterval = parseInt(process.env["SEND_INTERVAL"] || "") || 5000;

	let queued: EventData[] = [];
	let received = 0;
	let sent = 0;

	const log = () => process.stdout.write(`\rReceived: ${received}, Sent: ${sent}, Queued: ${queued.length}`);

	const sendData = async () => {
		if (queued.length !== 0) {
			// Copy and clear queuedMessages before sending so we dont clear messages that are added while sending
			const toSend = [...queued];
			queued = [];
			await eventHubProducer.sendBatch(toSend).catch((err) => {
				console.error(err);
				process.exit();
			});
			sent += toSend.length;
			if (logging === "slow") log();
		}
		await sleep(sendInterval);
		sendData();
	};
	sendData();

	const ingestSocket = createSocket("udp4");

	ingestSocket.on("close", () => {
		throw new Error("Servere socket closed!");
	});
	ingestSocket.on("error", (err) => {
		throw err;
	});

	ingestSocket.on("message", async (body) => {
		received++;
		queued.push({
			body,
			properties: {
				receivedTime: Date.now(),
			},
		});
		if (logging === "fast") log();
	});

	ingestSocket.on("listening", function () {
		const { port, family, address } = ingestSocket.address();
		console.log(`Listening on ${family} ${address}:${port}`);
	});

	ingestSocket.bind(port);
})();
