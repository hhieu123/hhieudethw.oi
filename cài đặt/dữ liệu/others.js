module.exports = function ({ tecna, multiple }) {
    const fullTime = tecna.getTime("fullTime");
    const { readFileSync, writeFileSync } = require("fs-extra");
    const { log } = tecna, { inProcess } = multiple;
    var path = __dirname + '/data/othersData.json';

    try {
        var othersData = JSON.parse(readFileSync(path, 'utf8'));
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
            if (othersData.hasOwnProperty(userID)) throw new Error(`Người dùng mang ID: ${userID} đã tồn tại trong Database`);
            multiple.inProcess = true;
            var data = {
                [userID]: {
                    ID: userID,
                    workTime: 0,
                    dailyTime: 0,
                    coin: 0,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    }
                }
            }
            Object.assign(othersData, data);
            await saveData(othersData)
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - CREATE DATA", error.stack, "error");
        }
    }

    async function getAll(keys, callback) {
        try {
            if (!keys) return othersData;
            if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
            const data = [];
            for (var ID of othersData) {
                var temp = {
                    ID: i.ID
                }
                var userData = othersData[ID];
                for (var k of keys) temp[k] = userData[k]
                data.push(temp)
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - GET ALL DATA", error.stack, "error");
        }
    }

    async function getData(userID, callback) {
        try {
            if (!userID) throw new Error ("ID người dùng không được để trống");
            if (isNaN(userID)) throw new Error ("ID người dùng không hợp lệ");
            if (!othersData.hasOwnProperty(userID)) await createData(userID);
            const data = othersData[userID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - GET DATA", error.stack, "error");
        }
    }

    async function setData(userID, options, callback) {
        try {
            if (!userID) throw new Error("userID không được để trống");
            if (isNaN(userID)) throw new Error("userID không hợp lệ");
            if (!othersData.hasOwnProperty(userID)) throw new Error (`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
            othersData[userID] = {
                ...othersData[userID],
                ...options
            }
           await saveData(othersData)
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - SET DATA", error.stack, "error");
        }
    }

    async function delData(userID, callback) {
        try {
            if (!userID) throw new Error("userID không được để trống");
            if (isNaN(userID)) throw new Error("userID không hợp lệ");
            if (!othersData.hasOwnProperty(userID)) throw new Error (`Người dùng mang ID: ${userID} không tồn tại trong Database`);
            delete othersData[userID];
            await saveData(othersData);
            if (callback && typeof callback == "function") callback(null, data);
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("DELDATA OTHERS", error.stack, "error");
        }
    }

    return {
        createData,
        getAll,
        getData,
        setData,
        delData,
        othersData
    }
}