module.exports.info = {
	name: "setname",
    version: "1.0.0",
    permissions: 1,
    author: {
        name: "hhieu",
        facebook: "https://www.facebook.com/TrungHieu2k9/"
    },
	description: {
        long: "Đổi biệt danh của bản thân hoặc người được tag",
        short: "Đổi biệt danh"
    },
	group: "Tools",
	guide: [
		'[tag/tên]',
	],
	countdown: 5
};

module.exports.run = async function({ api, event, args }) {
	const name = args.join(" "), { threadID, senderID, mentions } = event;
	const mention = mentions;
	if (!mention) return api.changeNickname(`${name}`, threadID, senderID);
    for (var i of Object.keys(mention)) {
        setTimeout(() => {
            api.changeNickname(`${name}`, threadID, i)
        }, 1500);
    }
}