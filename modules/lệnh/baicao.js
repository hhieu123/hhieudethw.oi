module.exports.info = {
	name: "baicao",
	version: "1.0.0",
	permissions: 1,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Chơi Bài Cào với bạn bè trong nhóm.",
        short: "Chơi Bài Cào"
    },
	group: "MiniGame",
	guide: [
		'[create/join/leave/cancel/info]\nSau khi create: chia bài, đổi bài, ready, nonready',
	],
	countdown: 5
};

module.exports.handleEvents = async ({ event, api, Users, Others, tecna }) => {
	const { senderID, threadID, body, messageID } = event;

	if (typeof body == "undefined") return;
	if (!tecna.baicao) tecna.baicao = new Map();
	if (!tecna.baicao.has(threadID)) return;
	var data = tecna.baicao.get(threadID);
	if (data.start != 1) return;

	if (body.indexOf("chia bài") == 0 || body.indexOf("Chia bài") == 0) {
		if (data.chiabai == 1) return;
		for(const key in data.player) {
			const card1 = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
			const card2 = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
			const card3 = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
			var tong = (card1 + card2 + card3);
			if (tong >= 20) tong -= 20;
			if (tong >= 10) tong -= 10;
			data.player[key].card1 = card1;
			data.player[key].card2 = card2;
			data.player[key].card3 = card3;
			data.player[key].tong = tong;
            var nameUser = (await Users.getData(data.player[key].id)).name;
			api.sendMessage(`Bài của bạn: ${card1} | ${card2} | ${card3} \n\nTổng bài của bạn: ${tong}`, data.player[key].id, (error, info) => {
				if (error) api.sendMessage(`Không thể chia bài cho người dùng: ${nameUser}`, threadID)
			});
				
		}
		data.chiabai = 1;
		tecna.baicao.set(threadID, data);
		return api.sendMessage("» Đã chia bài rồi đó «\n\n📌Kiểm tra tin nhắn chờ, spam\n🙏Mỗi người có 2 lần đổi bài\nNếu bài nhỏ, nhập 'đổi bài'\n👉Để lật bài, nhập 'ready'", threadID);
	}

	if (body.indexOf("đổi bài") == 0 || body.indexOf("Đổi bài") == 0) {
		if (data.chiabai != 1) return;
		var player = data.player.find(item => item.id == senderID);
		if (player.doibai == 0) return api.sendMessage("Bạn đã sử dụng toàn bộ lượt đổi bài", threadID, messageID);
		if (player.ready == true) return api.sendMessage("Bạn đã ready, bạn không thể đổi bài!", threadID, messageID);
		const card = ["card1","card2","card3"];
		player[card[(Math.floor(Math.random() * card.length))]] = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
		player.tong = (player.card1 + player.card2 + player.card3);
		if (player.tong >= 20) player.tong -= 20;
		if (player.tong >= 10) player.tong -= 10;
		player.doibai -= 1;
		tecna.baicao.set(data);
		var nameUser = (await Users.getData(player.id)).name;
		return api.sendMessage(`Bài của bạn sau khi được đổi: ${player.card1} | ${player.card2} | ${player.card3} \n\nTổng bài của bạn: ${player.tong}`, player.id, (error, info) => {
			if (error) api.sendMessage(`Không thể đổi bài cho người dùng: ${nameUser}`, threadID)
		});
	}

	if (body.indexOf("ready") == 0 || body.indexOf("Ready") == 0) {
		if (data.chiabai != 1) return;
		var player = data.player.find(item => item.id == senderID);
		if (player.ready == true) return;
		var name = (await Users.getData(player.id)).name;
		data.ready += 1;
		player.ready = true;
		if (data.player.length == data.ready) {
			const player = data.player;
			player.sort(function (a, b) { return b.tong - a.tong });
			var winPlayer = (await Users.getData(player[0].id)).name;

			var ranking = [], num = 1;

			for (const info of player) {
				var name = (await Users.getData(info.id)).name;
				ranking.push(`${num++} • ${name} với ${info.card1} | ${info.card2} | ${info.card3} => ${info.tong} điểm\n`);
			}

			var coin = data.dCoin * player.length;
			var info = await Others.getData(player[0].id);
			info.coin = info.coin + coin;
			await Others.setData(player[0].id, info);
			ranking.push(` ${winPlayer} với ${player[0].tong} nút nhận được ${coin}$\n`);

			tecna.baicao.delete(threadID);
			return api.sendMessage(`Kết quả:\n\n ${ranking.join("\n")}`, threadID);
		}
		else return api.sendMessage(`👤 ${name} Đã sẵn sàng lật bài\n\nCòn lại: ${data.player.length - data.ready} condi chưa dám lật bài`, event.threadID);
	}
	
	if (body.indexOf("nonready") == 0 || body.indexOf("Nonready") == 0) {
		const data = data.player.filter(item => item.ready == false);
		var msg = [];

		for (const info of data) {
			const name = (await Users.getData(info.id)).name;
			msg.push(name);
		}
		if (msg.length != 0) return api.sendMessage("Những người chơi chưa ready bao gồm: " + msg.join(", "), threadID);
		else return;
	}
}

module.exports.run = async ({ api, event, Others, args, Users, Threads, tecna }) => {
	var { senderID, threadID, messageID } = event;

	threadID = String(threadID);
	senderID = String(senderID);
    var listThreadBanned = ['2392402354140014', '4115747231847743', '6130616870282577', '3402498063192680', '5930840416989874']
    if (listThreadBanned.includes(threadID)) return api.sendMessage('Bạn không được phép chơi MiniGame ở box chính, vui lòng gửi "#cobac" và chọn box cờ bạc muốn vào.', threadID, messageID);

	if (!tecna.baicao) tecna.baicao = new Map();
	var data = tecna.baicao.get(threadID) || {};
	var prefixThread = (await Threads.getData(threadID)).prefix;
	var tecnaPrefix = tecna.configs.prefix;

	switch (args[0]) {
        case "join":
	    case "-j": {
			var name = (await Users.getData(senderID)).name;
            if ( data.start == 1 ) return api.sendMessage("Hiện tại bàn đã được bắt đầu bởi chủ bàn", threadID, messageID);
			var senderCoin = (await Others.getData(senderID)).coin;
            if ( typeof data.player == "undefined" ) { 
                if ( typeof senderCoin == "undefined" || senderCoin < 1000 ) return api.sendMessage("Bạn quá nghèo để khởi tạo bàn bài cào!", threadID, messageID);
                tecna.baicao.set( event.threadID, { "author": senderID, "maxCoin": senderCoin, "dCoin": 0, "start": 0, "chiabai": 0, "ready": 0, player: [ { "id": senderID, "coin": senderCoin,  "card1": 0, "card2": 0, "card3": 0, "doibai": 2, "ready": false } ]} );
				return api.sendMessage(`Hãy tham gia bàn bài cào nào mọi người.\n\nTham gia, nhập ${prefixThread ? prefixThread : tecnaPrefix}baicao join\nCược số tiền, nhập ${prefixThread ? prefixThread : tecnaPrefix}baicao create <coins>`, threadID, messageID);
            }
            if ( data.player.find(item => item.id == senderID) ) return api.sendMessage("Bạn đã tham gia vào bàn bài cào này!", threadID, messageID);
            if ( typeof senderCoin == "undefined" || senderCoin < 1000 ) return api.sendMessage("Bạn quá nghèo để tham gia vào bàn bài cào này!", threadID, messageID);
            data.player.push({ "id": senderID, "coin": senderCoin,  "card1": 0, "card2": 0, "card3": 0, "doibai": 2, "ready": false });
            if ( senderCoin < data.maxCoin ) data.maxCoin = senderCoin
            tecna.baicao.set(threadID, data);
            return api.sendMessage(`${name} đã tham gia bàn bài cào này!\nSố tiền cao nhất được phép cược hiện tại là ${data.maxCoin}$`, threadID, messageID); 
		}

        case "leave":
		case "-l": {
            if ( data.start == 1 ) return api.sendMessage("Hiện tại bàn đã được bắt đầu bởi chủ bàn", threadID, messageID);
			if ( data.player.length < 1 || !data.player.some(item => item.id == senderID) ) return api.sendMessage("Bạn chưa tham gia vào bàn bài cào trong nhóm này!", threadID, messageID);
			if ( data.author == senderID ) {
				tecna.baicao.delete(threadID);
				api.sendMessage("Chủ bàn đã huỷ cuộc hẹn, đồng nghĩa với việc bàn sẽ bị giải tán!", threadID, messageID);
			}
			else {
				data.player.splice(data.player.findIndex(item => item.id === senderID), 1);
				api.sendMessage("Bạn đã rời khỏi bàn bài cào này!", threadID, messageID);
                tecna.baicao.set(threadID, data);
			}
			return;
		}

		case "create":
		case "-c": {
            if ( senderID != data.author ) return api.sendMessage("Bạn không phải người tạo cuộc hẹn để thực hiện việc đặt cược", threadID, messageID);
            if ( typeof data.player == "undefined" ) return api.sendMessage(`Hiện tại chưa có bàn bài cào nào hay một cuộc hẹn được diễn ra, gõ ${prefixThread ? prefixThread : tecnaPrefix}help baicao để tìm hiểu thêm`, threadID, messageID);
            if ( data.player.length < 2 ) return api.sendMessage("Bạn chưa thể bắt đầu vì số người chơi chưa đạt tối thiểu", threadID, messageID);
            if ( typeof args[1] == "undefined" || parseInt(args[1]) < 1000 ) return api.sendMessage("Số tiền cược không hợp lệ, vui lòng đặt cược lại", threadID, messageID);
            if ( data.maxCoin < parseInt(args[1]) ) return api.sendMessage(`Số tiền cược đã vượt quá số tiền tối thiểu là ${data.maxCoin}$, vui lòng đặt cược lại`, threadID, messageID);
            data.start = 1;
            data.dCoin = parseInt(args[1])
            for (var user of data.player ) {
				var userInfo = await Others.getData(user.id);
				userInfo.coin = userInfo.coin - data.dCoin;
				await Others.setData(user.id, userInfo);
            }
			return api.sendMessage(`\n» Đặt cược ${args[1]}$ thành công! «\n\n👉Để bắt đầu cuộc chơi, nhập \"chia bài\"`, threadID, messageID);
  	    }

        case "cancel":
        case "-x": {
            if ( typeof data.player == "undefined" ) return api.sendMessage(`Hiện tại chưa có bàn bài cào nào hay một cuộc hẹn được diễn ra, gõ ${prefixThread ? prefixThread : tecnaPrefix}help baicao để tìm hiểu thêm`, threadID, messageID);
            tecna.baicao.delete(threadID);
            return api.sendMessage("Đã huỷ bàn bài cào!", threadID, messageID);
        }

		case "info":
		case "-i": {
			if ( typeof data.player == "undefined" ) return api.sendMessage(`Hiện tại chưa có bàn bài cào nào hay một cuộc hẹn được diễn ra, gõ ${prefixThread ? prefixThread : tecnaPrefix}help baicao để tìm hiểu thêm`, threadID, messageID);
			return api.sendMessage(
				"=== Bàn Bài Cào ===" +
				"\n- Author Bàn: " + data.author +
				"\n- Tổng số người chơi: " + data.player.length + " Người" +
                "\n- Số tiền cược tối đa: " + data.maxCoin + "$"
			, threadID, messageID);
		}
    
		default: {
			return tecna.error(this.info.name, threadID, messageID);
		}
	}
}
