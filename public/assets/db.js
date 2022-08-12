// Database
class Database {
    constructor() {
        this.rawDB = {
            initState: [],
            giftsDB: [],
        }
        this.owner = {};
        this.liveInfo = {};
        this.GiftsDB = {};
        this.usersDB = {};
    }

    reset() {
        this.rawDB = {
            initState: [],
            giftsDB: [],
        }
        this.owner = {};
        this.liveInfo = {};
        this.GiftsDB = {};
        this.usersDB = {};
    }
    
    init(initStateRaw) {
        this.rawDB.initState.push(initStateRaw);
        this.owner = {
            id: initStateRaw.roomInfo.owner.id || initStateRaw.roomInfo.owner_user_id,
            uniqueId: initStateRaw.roomInfo.owner.display_id,
            name: initStateRaw.roomInfo.owner.nickname,
            verified: {
                state: initStateRaw.roomInfo.owner.verified,
                content: initStateRaw.roomInfo.owner.verified_content,
                reason: initStateRaw.roomInfo.owner.verified_reason
            },
            follow_info: {
                following: initStateRaw.roomInfo.owner.follow_info.following_count,
                followers: initStateRaw.roomInfo.owner.follow_info.follower_count
            },
            bio: initStateRaw.roomInfo.owner.bio_description,
            img: {
                large: initStateRaw.roomInfo.owner.avatar_large.url_list[0],
                medium: initStateRaw.roomInfo.owner.avatar_medium.url_list[0],
                thumb: initStateRaw.roomInfo.owner.avatar_thumb.url_list[0]
            }
        };
        this.liveInfo = {
            roomId: initStateRaw.roomId,
            title: initStateRaw.roomInfo.title,
            hashtag: {
                id: initStateRaw?.roomInfo?.hashtag?.id,
                name: initStateRaw?.roomInfo?.hashtag?.title,
                img: initStateRaw?.roomInfo?.hashtag?.image?.url_list[0]
            },
            share_url: initStateRaw.roomInfo.share_url,
            stream: {
                id: Number(initStateRaw.roomInfo.stream_id_str),
                urls: {
                    flv: initStateRaw.roomInfo.stream_url.flv_pull_url, // { FULL_HD1, HD1, SD1, SD2 }
                    m3u8_hls: initStateRaw.roomInfo.stream_url.hls_pull_url,
                    flv_rtmp: initStateRaw.roomInfo.stream_url.rtmp_pull_url,
                }
            },
            newFollowers: [],
            coins: 0,
            likes: 0,
            views: {
                now: initStateRaw.roomInfo.user_count,
                top: initStateRaw.roomInfo.user_count
            },
        };
    }

  
    reformatRawGiftEventData(rawGift) {
        return {
            id: rawGift.giftId,
            name: rawGift.giftName,
            img: rawGift.giftPictureUrl,
            price: rawGift.diamondCount,
            count: rawGift.repeatCount,
            user: {
                [rawGift.userId]: {
                    id: rawGift.userId,
                    uniqueId: rawGift.uniqueId,
                    name: rawGift.nickname,
                    img: rawGift.profilePictureUrl,
                    count: rawGift.repeatCount,
                }
            }
        }
    }

    isPendingStreak(rawGift) {
        return rawGift.giftType === 1 && !rawGift.repeatEnd;
    }

    isGiftAccurate(gift) {
        if (gift?.id && gift?.name && gift?.img && gift?.price && gift?.count && gift?.user?.length) return true // no errors
        else return false // false data
    }

    giftExist(gift) { // giftExist if exit
        if (this.GiftsDB[gift.id]) return true
        else return false
    }

    addNewGift(gift) {
        this.addUser(gift);
        this.GiftsDB[gift.id] = gift;
        this.liveInfo.coins = this.coins();
    }

    updateGift(gift) {
        this.addUser(gift)
        this.GiftsDB[gift.id].count += gift.count
        let _user = Object.values(gift.user)[0]
        if (!this.GiftsDB[gift.id].user[gift.user.id]) this.GiftsDB[gift.id].user[_user.id] = _user
        else this.GiftsDB[gift.id].user[_user.id].count += _user.count;
        this.liveInfo.coins = this.coins();
    }

    addGift(gift) { // use this
        if (!this.giftExist(gift)) this.addNewGift(gift);
        else this.updateGift(gift);
    }

    addRawGift(rawGift) { // use this
        this.rawDB.giftsDB.push(rawGift);
        this.addGift(this.reformatRawGiftEventData(rawGift));
    }


    addUser(gift) {
        let _user = Object.values(gift.user)[0];
        // new user
        if (!this.usersDB[_user.id]) {
            this.usersDB[_user.id] = {
                id: _user.id,
                uniqueId: _user.uniqueId,
                name: _user.name,
                coins: (gift.price * gift.count),
                img: _user.img,
                gifts: {
                    [gift.id]: {
                        id: gift.id,
                        name: gift.name,
                        price: gift.price,
                        count: gift.count,
                        img: gift.img
                    }
                }
            }
        }
        // update user
        else if (this.usersDB[_user.id]) {
            this.usersDB[_user.id].coins += (gift.price * gift.count) // user sent more coins
            if (!this.usersDB[_user.id].gifts[gift.id]) { // user sent a new gift type
                this.usersDB[_user.id].gifts[gift.id] = {
                    id: gift.id,
                    name: gift.name,
                    price: gift.price,
                    count: gift.count,
                    img: gift.img
                }
            }
            else { // increase gift count of a gift type that user previuslly sent
                this.usersDB[_user.id].gifts[gift.id].count += gift.count
            }
        }
    }

    topUsers() { // use this
        return Object.values(this.usersDB).sort((a, b) => b.coins - a.coins)
    }

    coins(formated = false) { // use this
        let _coins = Object.values(this.GiftsDB).reduce((a, b) => a + (b.price * b.count), 0);
        if (formated) return formatNumbers(_coins)
        return _coins
    }

    total(currencyDisplay = 'symbol', maximumFractionDigits, notation = 'standard') { // use this
        let _coints = this.coins()
        let money = (coins, currency, factor, currencyDisplay, notation) => { return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: currency, 
            maximumFractionDigits: typeof maximumFractionDigits === 'number' ? maximumFractionDigits : (coins < 6000 ? 2 : 0), // 6000 coins == 100 $
            currencyDisplay, // symbol, narrowSymbol, code, name
            notation // standard, compact, scientific, engineering
         }).format(coins * factor) }
        return {
            sar: money(_coints, 'SAR', (1 / 16 / 99 * 100), currencyDisplay, notation),
            usd: money(_coints, 'USD', (1 / 16 / 99 * 100 / 3.75), currencyDisplay, notation)
        }
    }

};

