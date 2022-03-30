module.exports = function ({ tecna, api, multiple }) {
    const { writeFileSync, readFileSync } = require("fs-extra");
    var fullTime = tecna.getTime("fullTime");
    const { log } = tecna, { inProcess } = multiple;
    var path = __dirname + "/data/threadsData.json";

    try {
        var threadsData = JSON.parse(readFileSync(path, 'utf8'));
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

	async function createData(threadID, userID, callback) {
		try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} đã tồn tại trong Database`);
            var threadInfo = await api.getThreadInfo(threadID);
            var data = {
                [threadID]: {
                    ID: threadID,
                    name: threadInfo.threadName,
                    emoji: threadInfo.emoji,
                    prefix: "",
                    members: {},
                    color: threadInfo.color,
                    totalMsg: threadInfo.messageCount,
                    adminIDs: threadInfo.adminIDs,
                    avatarGroup: threadInfo.imageSrc,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    },
                    lastUpdate: Date.now()
                }
            }
            Object.assign(threadsData, data);
            log("THREADS - CREATE DATA", "New Threads: " + threadInfo.name + " | ID: " + threadID + " | Giờ Tạo: " + fullTime, "magenta");
            await saveData(threadsData)
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - CREATE DATA", error.stack, "error");
        }
	}

    async function addMember(threadID, userID, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var threadData = await getData(threadID);
            if (threadData.members.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} đã tồn tại trong Database của nhóm này`);
            var threadInfo = await getInfo(threadID);
            var data = {
                [userID]: {
                    ID: userID,
                    totalMsg: 1,
                    bietdanh: threadInfo.nicknames[userID] || ""
                }
            }
            Object.assign(threadData.members, data)
            await setData(threadID, threadData);
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - ADD MEMBERS", error.stack, "error");
        }
    }

    async function delMember(threadID, userID) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            delete threadData.members[userID];
            await setData(threadID, threadData);
        } catch (error) {
            return log("THREADS - DELETE MEMBERS", error.stack, "error");
        }
    }

    async function editMember(threadID, userID, options, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
            var member = threadData.members[userID];
            member = {...member, ...options};
            threadsData[threadID].members[userID] = member;
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, member);
            return member;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - EDIT MEMBERS", error.stack, "error");
        }
    }
    
    async function getUser(threadID, userID) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            if (!userID) throw new Error("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error("ID người dùng không hợp lệ");
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            return threadsData[threadID].members[userID];
        } catch (error) {
            return log("THREADS - GET USERS", error.stack, "error");
        }
    }

    async function getAllUsers(threadID, keys, callback) {
        try {
            if (!keys) {
                if (Object.keys(threadsData.members).length == 0) return [];
                else if (Object.keys(threadsData.members).length > 0) {
                    var db = [];
                    for (var i of Object.keys(threadsData.members)) db.push(threadsData.members[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            var threadData = await getData(threadID), { members } = threadData, data = [];
            for (var ID in members) {
                const database = {
                    ID: ID
                };
                const memberData = members[ID];
                for (var i of keys) database[i] = memberData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET ALL USERS", error.stack, "error");
        }
    }

	async function getAll(keys, callback) {
        try {
            if (!keys) {
                if (Object.keys(threadsData).length == 0) return [];
                else if (Object.keys(threadsData).length > 0) {
                    var db = [];
                    for (var i of Object.keys(threadsData)) db.push(threadsData[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
            const data = [];
            for (var ID in threadsData) {
                const database = {
                    ID: ID
                };
                const threadData = threadsData[ID];
                for (var i of keys) database[i] = threadData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET ALL DATA", error.stack, "error");
        }
    }

	async function getData(threadID, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) await createData(threadID);
            const data = threadsData[threadID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET DATA", error.stack, "error");
        }
    }

	async function setData(threadID, options, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
            threadsData[threadID] = {
                ...threadsData[threadID],
                ...options
            }
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, threadsData[threadID]);
            return threadsData[threadID];
        }
        catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - SET DATA", error.stack, "error");
        }
	}

	async function delData(threadID, callback) {
		try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            delete threadsData[threadID];
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, "REMOVE THREAD "+ threadID + " SUCCES");
            return true;
        } catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - REMOVE DATA", error.stack, "error");
        }
	}

    async function getInfo(threadID) {
		try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            var threadInfo = await api.getThreadInfo(threadID);
            return threadInfo;
		} catch (error) {
			return log('THREADS - GET INFO', error, "error");
		}
	}

    async function refreshData(threadID) {
        try {
            if (!threadID) throw new Error('ThreadID không được để trống');
            if (isNaN(threadID)) throw new Error('ThreadID không hợp lệ');
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            var threadInfo = await getData(threadID);
            var newThreadData = await getInfo(threadID);
            
            threadInfo.name = newThreadData.threadName;
            threadInfo.emoji = newThreadData.emoji;
            threadInfo.prefix = threadInfo.prefix;
            threadInfo.members = threadInfo.members;
            for (var userID of Object.keys(threadInfo.members)) {
                threadInfo.members[userID].bietdanh = newThreadData.nicknames[userID];
            }
            threadInfo.color = newThreadData.color;
            threadInfo.totalMsg = newThreadData.messageCount;
            threadInfo.adminIDs = newThreadData.adminIDs;
            threadInfo.avatarGroup = newThreadData.imageSrc;
            if (threadInfo.hasOwnProperty('msgWelcome')) threadInfo.msgWelcome = threadInfo.msgWelcome;
            if (threadInfo.hasOwnProperty('msgLeave')) threadInfo.msgLeave = threadInfo.msgLeave;
            if (threadInfo.hasOwnProperty('banned')) threadInfo.banned = threadInfo.banned;
            threadInfo.createTime = threadInfo.createTime;
            threadInfo.lastUpdate = Date.now();
            await setData(threadID, threadInfo);
        } catch (error) {
            return log("THREADS - REFRESH DATABASE", error.stack, 'error')
        }
    }

	return {
		createData,
        addMember,
        delMember,
        editMember,
        getUser,
        getAllUsers,
		getAll,
		getData,
		setData,
		delData,
        getInfo,
        refreshData,
        threadsData
	}
};