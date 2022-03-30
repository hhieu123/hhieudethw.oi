module.exports.info = {
	name: "slot",
	version: "1.0.1",
	permissions: 1,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Đừng có bán nhà vì nó nhé :3",
        short: "Cờ bạc"
    },
	group: "MiniGame",
	guide: [
		'[Số tiền cược]',
	],
	countdown: 5
};

module.exports.run = async function({ api, event, args, Others }) {
    var { messageID, threadID, senderID } = event;
    var listThreadBanned = ['2392402354140014', '4115747231847743', '6130616870282577', '3402498063192680', '5930840416989874']
    if (listThreadBanned.includes(threadID)) return api.sendMessage('Bạn không được phép chơi MiniGame ở box chính, vui lòng gửi "join" và chọn box cờ bạc muốn vào.', threadID, messageID);
    const slotItems = ["🍇", "🍉", "🍊", "🍏", "7⃣", "🍓", "🍒", "🍌", "🥝", "🥑", "🌽"];
    const userData = await Others.getData(senderID);
    var moneyBet = parseInt(args[0]);
    var Bet = moneyBet;
    if (isNaN(moneyBet) || moneyBet <= 0) return api.sendMessage("[ SLOT ] Số coin đặt cược không được để trống hoặc là số coin âm", threadID, messageID);
	if (moneyBet > userData.money) return api.sendMessage("[ SLOT ] Số coin bạn đặt lớn hơn số dư của bạn!", threadID, messageID);
	if (moneyBet < 500) return api.sendMessage("[ SLOT ] Số coin đặt không được dưới 500 coin!", threadID, messageID);
    var number = [], win = false;
    for (i = 0; i < 3; i++) number[i] = Math.floor(Math.random() * slotItems.length);
    if (number[0] == number[1] && number[1] == number[2]) {
        moneyBet *= 9;
        win = true;
    }
    else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) {
        moneyBet *= 2;
        win = true;
    }
    switch (win) {
        case true: {
            api.sendMessage(`🎰 ${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]} 🎰\nBạn đã thắng với ${moneyBet} coin`, threadID, messageID);
            userData.coin = userData.money + moneyBet - Bet;
            await Others.setData(senderID, userData);
            break;
        }
        case false: {
            api.sendMessage(`🎰 » ${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]} « 🎰\nBạn đã thua và mất ${moneyBet} coin`, threadID, messageID);
            userData.coin = userData.money - moneyBet;
            await Others.setData(senderID, userData);
            break;
        }
    }
}