module.exports = function ({ tecna, api, multiple }) {
    const { readFileSync, writeFileSync } = require("fs-extra");
    var fullTime = tecna.getTime("fullTime");
    const { log } = tecna, { inProcess } = multiple;
    var path = __dirname + "/data/usersData.json";

    try {
        var usersData = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        writeFileSync(path, "{}", { flag: 'a+' });
    }

    async function saveData(data) {
        try {
            if (!data) throw new Error('Data không được để trống');
            writeFileSync(path, JSON.stringify(data, null, 4))
        } catch (error) {
            return log("SAVE DATA", error.stack, 'error')
        }
    }
    
	async function createData(userID, callback) {
		try {
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var userInfo = await getInfo(userID);
            if (usersData.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} đã tồn tại trong Database`);
            var data = {
                [userID]: {
                    ID: userID,
                    name: userInfo.name,
                    facebookID: userInfo.vanity || userInfo.name,
                    gioitinh: userInfo.gender == 1 ? "Nữ" : "Nam",
                    isBirthday: userInfo.isBirthday,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    },
                    lastUpdate: Date.now()
                }
            }
            Object.assign(usersData, data);
            await saveData(usersData);
            log("USERS - CREATE DATA - UPDATE", "Người Dùng Mới: " + userInfo.name + " | ID: " + userID + " | Giờ Tạo: " + fullTime, "users");
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - CREATE DATA", error, "error");
        }
	}

	async function getAll(keys, callback) {
		try {
            if (!keys) {
                if (Object.keys(usersData).length == 0) return [];
                else if (Object.keys(usersData).length > 0) {
                    var db = [];
                    for (var i of Object.keys(usersData)) db.push(usersData[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
            const data = [];
            for (var userID in usersData) {
                var database = {
                    ID: userID
                };
                var userData = usersData[userID];
                for (var i of keys) database[i] = userData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - GET ALL DATA", error.stack, "error");
        }
	}

	async function getData(userID, callback) {
		try {
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            if (!usersData.hasOwnProperty(userID)) await createData(userID, (error, info) => {
                return info;
            });
            const data = usersData[userID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - GET DATA", error.stack, "error");
        }
	}

	async function setData(userID, options, callback) {
		try {
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            if (!userID) throw new Error("userID không được để trống");
            if (!usersData.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
            usersData[userID] = {...usersData[userID], ...options};
            await saveData(usersData);
            if (callback && typeof callback == "function") callback(null, dataUser[userID]);
            return usersData[userID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - SET DATA", error.stack, "error");
        }
	}

	async function delData(userID, callback) {
		try {
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            if (!usersData.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            delete usersData[userID];
            await saveData(usersData);
            if (callback && typeof callback == "function") callback(null, usersData);
            return usersData;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - REMOVE DATA", error.stack, "error");
        }
	}
    
    async function getInfo(userID) {
		try {
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var userInfo = await api.getUserInfo(userID);
            return userInfo[userID];
		} catch (error) {
			return log('USERS - GET INFO', error.stack, "error");
		}
	}

    async function refreshData(userID) {
        if (!userID) throw new Error('ID người dùng không được để trống');
        if (isNaN(userID)) throw new Error('ID người dùng không hợp lệ');
        if (!usersData.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
        try {
            var userInfo = await getData(userID);
            var newUserData = await getInfo(userID);
            userInfo.name = newUserData.name;
            userInfo.facebookID = newUserData.vanity || newUserData.name;
            userInfo.gioitinh = newUserData.gender == 1 ? "Nữ" : "Nam";
            userInfo.isBirthday = newUserData.isBirthday;
            if (userInfo.hasOwnProperty('happyBirthday') && userInfo.happyBirthday.timestamp != "") {
                if (Date.now() - userInfo.happyBirthday.timestamp > 86400000) {
                    userInfo.happyBirthday = {
                        status: false,
                        timestamp: ""
                    }
                }
            }
            if (userInfo.hasOwnProperty('banned')) userInfo.banned = userInfo.banned;
            if (userInfo.hasOwnProperty('active')) userInfo.active = userInfo.active;
            userInfo.createTime = userInfo.createTime;
            userInfo.lastUpdate = Date.now();
            await setData(userID, userInfo);
        } catch (error) {
            return log("USERS - REFRESH DATABASE", error.stack, 'error')
        }
    }

	return {
		createData,
		getAll,
		getData,
		setData,
		delData,
        getInfo,
        refreshData,
        usersData
	};
};