module.exports.info = {
	name: "work",
    version: "1.0.0",
    permissions: 1,
    author: {
        name: "hhieu",
        facebook: "https://www.facebook.com/TrungHieu2k9/"
    },
	description: {
        long: "Có làm mới có ăn, không làm mà đòi có ăn thì ăn...",
        short: "GOOD JOBS"
    },
	group: "Jobs",
	guide: [
		'',
	],
	countdown: 5
};

module.exports.run = async ({ event, api, Others }) => {
    const { threadID, messageID, senderID } = event;
    
    const cooldown = 1200000;
    let userData = await Others.getData(senderID);
    if (cooldown - (Date.now() - userData.workTime) > 0) {
        var time = cooldown - (Date.now() - userData.workTime),
            minutes = Math.floor(time / 60000),
            seconds = ((time % 60000) / 1000).toFixed(0);
        
		return api.sendMessage(`Bạn đang trong thời gian chờ\nVui lòng thử lại sau:${minutes < 10 ? (minutes > 0 ? " 0" + minutes + " phút" : "") : (minutes > 0 ? " " + minutes + " phút" : "")}${seconds < 10 ? (seconds > 0 ? " 0" + seconds + " giây" : "") : (seconds > 0 ? " " + seconds + " giây!" : "")}`, event.threadID, event.messageID);
    } else {
        const job = [
            "đi bán vé số",
            "đi sửa xe",
            "làm nhân viên lập trình",
            "đi hack facebook",
            "làm thợ sửa ống nước ( ͡° ͜ʖ ͡°)",
            "làm đầu bếp",
            "làm thợ hồ",
            "làm fake taxi",
            "đi gangbang người khác",
            "làm streamer",
            "đi bán hàng online",
            "làm nội trợ",
            "đi vả mấy thằng sao đỏ, giun vàng",
            "đi bán hoa",
            "tìm jav/hentai code cho Boss",
            "đi chơi rank gánh team",
            "gánh Boss lên HT + 1 sao",
            "cho Boss in4 gái xinh",
            "giới thiệu gái cho Boss",
            "làm culi cho Boss",
            "chơi game cùng Boss",
            "tìm người yêu cho Boss",
            "nạp game cho Boss",
            "dẹp loạn cho Quân Đoàn",
            "đấm kì cựu",
            "đấm mấy đứa phát cơm tró",
            "đấm mấy thằng hay chửi bậy trong box",
            "vả kì cựu",
            "nạp kim cương",
            "tập làm proplayer",
            "đi solo win",
            "gánh team tử chiến rank",
            "tán gái hộ Boss",
            "làm ca sĩ",
            "làm nhà thơ",
            "làm quảng cáo",
            "đi tuyển thành viên cho Quân Đoàn",
            "đi chơi",
            "đi tán mấy bé bò sữa trong game",
            "đi gạ người khác chơi gay thành công"
        ];
        function getLuckyNumber(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        const amount = Math.floor(getLuckyNumber(2, 5) * 1000);
        return api.sendMessage(`Bạn ${job[Math.floor(Math.random() * job.length)]} và đã nhận được số tiền là: ${amount} coins`, threadID, async () => {
            await Others.setData(senderID, {
                coin: userData.coin + amount,
                workTime: Date.now()
            });
        }, messageID);
    }     
}
