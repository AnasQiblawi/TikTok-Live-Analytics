// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
let backendUrl = location.protocol === 'file:' ? "https://tiktok-chat-reader.zerody.one/" : undefined;
    //backendUrl = 'https://tiktok-chat-reader.zerody.one/';
let connection = new TikTokIOConnection(backendUrl);


// Counter
// let viewerCount = 0;
// let likeCount = 0;
// let diamondsCount = 0;

// Database
var db = new Database()

// ## gifts total ---------
// --- coins:
// Object.values(giftsDB).reduce((a, b) => a + (b.price * b.count), 0)
// --- Coins in SAR currency: 
// Method 1: (Object.values(giftsDB).reduce((a, b) => a + (b.price * b.count), 0) /16).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
// Methos 2: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 }).format(coins /16)
// -----------------------

// Connect Button - listener
$(document).ready(() => {
    $('#connectButton').click(connect);
    $('#uniqueIdInput').on('keyup', function (e) {
        if (e.key === 'Enter') {
            connect();
        }
    });
})



// clean previus session gifts list
// window.onload = () => cleanSession();
function cleanSession() {
    db.reset();
    $('#giftsContainer').find('div').remove();
};

// Connect -----
function connect(reconnect) {
    // clean previus session gifts list
    if (reconnect != true) cleanSession();

    let uniqueId = $('#uniqueIdInput').val();
    if (uniqueId !== '') {

        $('#stateText').text('Connecting...').css('color','#1E88E5');

        connection.connect(uniqueId, {
            enableExtendedGiftInfo: true
        }).then(state => {
            // db
            db.init(state)
            // success msg
            $('#stateText').text(`Connected to roomId ${state.roomId}`).css('color', 'rgba(0,183,74,1)');
            // Display stats
            showStats()
            $('#stats').fadeIn(1500)
            
            // VideoPlayer
            let url = state.roomInfo.stream_url.rtmp_pull_url;
            VideoPlayer(url);

        }).catch(errorMessage => {
            $('#stateText').text(errorMessage).css('color', 'red');;
        })

    } else {
        alert('no username entered');
    }
};

// Prevent Cross site scripting (XSS)
// function sanitize(text) {
//     return text.replace(/</g, '&lt;')
// };



// Stream End - event 
connection.on('streamEnd', () => {
    console.log('Stream Ended.')
    $('#stateText').text('Stream ended.').css('color', 'red');
});


// Disconnected - event 
connection.on('tiktokDisconnected', (reason) => {
    console.log('Disconnected: ', reason);
    $('#stateText').text('Disconnected: ' + reason).css('color', 'red');
});



// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
// Gifts - event
connection.on('gift', (data) => {
    
    if(!isPendingStreak(data)) {
        // db - add/update
        db.addRawGift(data);
        // Update gifts list
        // then update stats by callback updateStats()
        UpdateGiftItem(db.GiftsDB[data.giftId], updateStats());
    };

})


// gifts in pending state ?
function isPendingStreak(data) {
    return data.giftType === 1 && !data.repeatEnd;
}



/**
 * Add or update a gift to the gift container
 */
function UpdateGiftItem(gift) {
    let container = $('#giftsContainer');

    // if (container.find('div').length > 200) {
    //     container.find('div').slice(0, 100).remove();
    // }

    let html = `
        <div class="grid-item flex-column d-flex justify-content-between align-items-center rounded-5" data-giftId=${gift.id}>
            <img src="${gift.img}" loading="auto" alt="" class="card-img-top animate__animated animate__headShake"/>
            <div>
                <h5 class="card-title">${gift.name}</h5>
                <span>x<b class="animate__animated animate__flipInX">${gift.count}</b></span>
                <p>${new Intl.NumberFormat('en-IN').format(gift.price)} coin</p>
        </div>
    `;

    let existingGiftItem = container.find(`[data-giftId='${gift.id}']`);

    if (existingGiftItem.length) {
        // $('#giftsContainer').prepend($('#giftsContainer').find(`[data-giftId='${gift.id}']`))
        // if gift is not visible on screen then move it to the beggining of grid.
        if (!existingGiftItem.isVisible()) container.prepend(existingGiftItem); 
        existingGiftItem.replaceWith(html); // update gift stats
    }
    // else container.append(html); // add from the end
    else container.prepend(html); // add from the beggining
    
};










// --------------------------------------------------------------
// Gifts Sample

window.onload = () => {
    // Build sample Gifts
    [{"id":37,"name":"Panda","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/77259f70262b6632b9926a4a7ed12391~tplv-obj.png","price":5,"count":49},{"id":5269,"name":"TikTok","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/802a21ae29f9fae5abe3693de9f874bd~tplv-obj.png","price":1,"count":10358},{"id":5282,"name":"Heart","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/98bea1b189fba75bf0ca766b4dc1976e~tplv-obj.png","price":10,"count":162},{"id":5284,"name":"Kiss","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/70529cd75b4d64587658c462c45dc238~tplv-obj.png","price":150,"count":3},{"id":5285,"name":"Dubai","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/f62cfc2f5d549554e0392f47a34019ab~tplv-obj.png","price":7499,"count":3},{"id":5287,"name":"Golden sports car","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4caa9de208d634c1fab77754fe16530c~tplv-obj.png","price":29999,"count":11},{"id":5300,"name":"Sceptre","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/5c017676024a19dc2c78c14a0e669ad2~tplv-obj.png","price":150,"count":29},{"id":5301,"name":"Oud","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/977f88a797a6c75ef8b712b46cf90850~tplv-obj.png","price":300,"count":8},{"id":5336,"name":"Make it rain","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2c757ada80dd0ea072fdbb0c3d81129d~tplv-obj.png","price":500,"count":20},{"id":5338,"name":"Unicorn Fantasy","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/483c644e67e9bb1dd5970f2df00b7576~tplv-obj.png","price":5000,"count":3},{"id":5340,"name":"Castle Fantasy","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8173e9b07875cca37caa5219e4903a40~tplv-obj.png","price":20000,"count":1},{"id":5487,"name":"Finger Heart","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a4c4dc437fd3a6632aba149769491f49.png~tplv-obj.png","price":5,"count":397},{"id":5505,"name":"Love Rain","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/034c891a69d337729e5202672443d15e.png~tplv-obj.png","price":199,"count":1},{"id":5509,"name":"Sunglasses","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/08af67ab13a8053269bf539fd27f3873.png~tplv-obj.png","price":199,"count":17},{"id":5513,"name":"Treasure Chest","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/b4e1bcfd1a5bdd45234d5b51d7fda01d.png~tplv-obj.png","price":100,"count":10},{"id":5556,"name":"Diamond Crown","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/96286bb3883c5340879c5d8ecbbdc948.png~tplv-obj.png","price":1499,"count":5},{"id":5557,"name":"Give me five","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c1011eb4f54296384d28fec643604d9a.png~tplv-obj.png","price":10,"count":58},{"id":5559,"name":"Crystal Heart","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/ae46ac6582a606009643440fe4138eb4.png~tplv-obj.png","price":499,"count":3},{"id":5560,"name":"Gold Microphone","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/620fb86857b3d96511255cc0ac9515b0.png~tplv-obj.png","price":499,"count":1},{"id":5564,"name":"Applause","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/e3caf5a718fd2ef681386e2538672160.png~tplv-obj.png","price":600,"count":4},{"id":5585,"name":"Confetti","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/cb4e11b3834e149f08e1cdcc93870b26~tplv-obj.png","price":100,"count":107},{"id":5586,"name":"Hearts","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/934b5a10dee8376df5870a61d2ea5cb6.png~tplv-obj.png","price":199,"count":8},{"id":5587,"name":"Gold Mine","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/58cbff1bd592ae4365a450c4bf767f3a.png~tplv-obj.png","price":1000,"count":7},{"id":5598,"name":"Diamond Heart necklace","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/9651f80586431e85dbf4d96c067b22f9.png~tplv-obj.png","price":200,"count":10},{"id":5627,"name":"With you","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2ada199e5a0a93a5ba202235c0fac224~tplv-obj.png","price":6000,"count":2},{"id":5650,"name":"Mic","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8d4381b7d2272ffc14227c3705832e24~tplv-obj.png","price":5,"count":72},{"id":5655,"name":"Rose","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/eba3a9bb85c33e017f3648eaf88d7189~tplv-obj.png","price":1,"count":32216},{"id":5657,"name":"Lollipop","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/7d055532898d2060101306de62b89882~tplv-obj.png","price":10,"count":32},{"id":5658,"name":"Perfume","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/20b8f61246c7b6032777bb81bf4ee055~tplv-obj.png","price":20,"count":81},{"id":5659,"name":"Paper Crane","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/0f158a08f7886189cdabf496e8a07c21~tplv-obj.png","price":99,"count":4},{"id":5660,"name":"Hand Hearts","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/6cd022271dc4669d182cad856384870f~tplv-obj.png","price":100,"count":64},{"id":5661,"name":"Air Dancer","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/97c975dcce2483027ececde2b6719761~tplv-obj.png","price":300,"count":43},{"id":5662,"name":"Necklace","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/7ad7ebc43e1c161c0ee566395ab7882b~tplv-obj.png","price":400,"count":1},{"id":5664,"name":"Pearl","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/70fd490f208c37c89ebdecf4c3c1c31b~tplv-obj.png","price":800,"count":1},{"id":5707,"name":"Love you","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/d5142d535747c2c0adc3afb7f469333b~tplv-obj.png","price":49,"count":3},{"id":5729,"name":"Butterfly","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/282973159d9ab5e7fa2c8a3dc8b578dc~tplv-obj.png","price":169,"count":5},{"id":5731,"name":"Coral","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/d4faa402c32bf4f92bee654b2663d9f1~tplv-obj.png","price":499,"count":18},{"id":5734,"name":"Goggles","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/488be317f77358386438d04e38801b5e~tplv-obj.png","price":199,"count":2},{"id":5760,"name":"Weights","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a99fc8541c7b91305de1cdcf47714d03~tplv-obj.png","price":1,"count":158},{"id":5763,"name":"Speedboat","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/59c1d54918e6e715b84a4f5387f2ddb9~tplv-obj.png","price":1888,"count":3},{"id":5765,"name":"Motorcycle","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/7e5d2b6404d04e798d907ddf107a39fa~tplv-obj.png","price":2988,"count":2},{"id":5767,"name":"Private Jet","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/dee3de6d167fc70354c624c0bd647e43~tplv-obj.png","price":4888,"count":4},{"id":5776,"name":"Birthday Cake","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2cadff123e24e328c040380c44c7ea6b~tplv-obj.png","price":300,"count":2},{"id":5827,"name":"Ice Cream Cone","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/968820bc85e274713c795a6aef3f7c67~tplv-obj.png","price":1,"count":546},{"id":5831,"name":"Flower Show","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/b6266323ef3ea0d313cbab6911ff8c46~tplv-obj.png","price":500,"count":7},{"id":5832,"name":"Cool Cat","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/7218c4ffca3e613c278281952ad25964~tplv-obj.png","price":499,"count":1},{"id":5837,"name":"Tabbla","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c15fd749228d5aec9015ea1fde9a6b28~tplv-obj.png","price":10000,"count":3},{"id":5879,"name":"Doughnut","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4e7ad6bdf0a1d860c538f38026d4e812~tplv-obj.png","price":30,"count":34},{"id":5880,"name":"Lock and Key","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2c9cec686b98281f7319b1a02ba2864a~tplv-obj.png","price":199,"count":3},{"id":5882,"name":"Rock Roll","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/57154f268c641793bca116a4b87d2bfa~tplv-obj.png","price":299,"count":2},{"id":5897,"name":"Swan","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/97a26919dbf6afe262c97e22a83f4bf1~tplv-obj.png","price":699,"count":3},{"id":5899,"name":"Swing","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4d547840317d296c4c743d310a27d575~tplv-obj.png","price":399,"count":1},{"id":5919,"name":"Love you","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/150f5e63a9f12705d1843bf1044e8e4a~tplv-obj.png","price":20,"count":92},{"id":5924,"name":"Hand Heart","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/47e9081623cdae9faa55f4d0d67908bf~tplv-obj.png","price":100,"count":64},{"id":5938,"name":"Pool Party","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4147c5bcfad9623c693f83d5d6cba1f7~tplv-obj.png","price":4999,"count":1},{"id":5954,"name":"Planet","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/7d017c1f035b989127b16255398eddc9~tplv-obj.png","price":15000,"count":2},{"id":5955,"name":"Champion","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/58ce827091411e667dd6ba8a93215f86~tplv-obj.png","price":1500,"count":7},{"id":5978,"name":"Train","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4227ed71f2c494b554f9cbe2147d4899~tplv-obj.png","price":899,"count":5},{"id":6007,"name":"Boxing Gloves","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/9f8bd92363c400c284179f6719b6ba9c~tplv-obj.png","price":299,"count":2},{"id":6040,"name":"TikTok Universe","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a8c7112e9a8205268c27446eeb89debc~tplv-obj.png","price":34999,"count":15},{"id":6042,"name":"Mini Speaker","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/728cc7436005cace2791aa7500e4bf95~tplv-obj.png","price":1,"count":650,"users":[{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"vcbwd518","uniqueId":"vcbwd518","name":"ابوعيد","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/bdde7f0ba0df284307bb6046d3f2ae40.jpeg?x-expires=1658746800&x-signature=wUVvTsHVCXH4OSg7352Wa3bOhzw%3D"},{"id":"vcbwd518","uniqueId":"vcbwd518","name":"ابوعيد","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/bdde7f0ba0df284307bb6046d3f2ae40.jpeg?x-expires=1658746800&x-signature=wUVvTsHVCXH4OSg7352Wa3bOhzw%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"},{"id":"ytue8","uniqueId":"ytue8","name":"𝒍𝒐𝒓𝒆𝒆𝒏🏹♥️.","img":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/5bacac7e0feae0b8ee987390c4293dd3.jpeg?x-expires=1658746800&x-signature=8n7n0%2BUs6oUHbCZyJ4fg%2BC%2FdH4A%3D"}]},{"id":6052,"name":"Gamepad","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8ebe28a907bb6237fa3b11a97deffe96~tplv-obj.png","price":10,"count":7},{"id":6059,"name":"Hand Wave","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/63135affee2016240473cab8376dfe74~tplv-obj.png","price":9,"count":19},{"id":6064,"name":"GG","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/3f02fa9594bd1495ff4e8aa5ae265eef~tplv-obj.png","price":1,"count":423},{"id":6070,"name":"Mirror","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/840b3d6e362053e4eb83af0ca7228762~tplv-obj.png","price":30,"count":2},{"id":6073,"name":"Sweet dreams","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/73d750457215bbb20e160406b8e006d3~tplv-obj.png","price":399,"count":2},{"id":6078,"name":"Desert Camp","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/429bbdb7edb7013bbe8bc8bdfacd57e6~tplv-obj.png","price":899,"count":6},{"id":6089,"name":"Sports Car","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/e7ce188da898772f18aaffe49a7bd7db~tplv-obj.png","price":7000,"count":2},{"id":6090,"name":"Fireworks","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/9494c8a0bc5c03521ef65368e59cc2b8~tplv-obj.png","price":1088,"count":73},{"id":6093,"name":"Football","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c043cd9e418f13017793ddf6e0c6ee99~tplv-obj.png","price":1,"count":279},{"id":6097,"name":"Little Crown","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/cf3db11b94a975417043b53401d0afe1~tplv-obj.png","price":99,"count":6},{"id":6103,"name":"Yacht","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/070c086c6fc1e40ae3ca9e683c974e4e~tplv-obj.png","price":9888,"count":2},{"id":6104,"name":"Cap","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/6c2ab2da19249ea570a2ece5e3377f04~tplv-obj.png","price":99,"count":23},{"id":6117,"name":"The Magic Lamp","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4f5481830412aae4849a8b004ab5c2be~tplv-obj.png","price":1000,"count":1},{"id":6129,"name":"Kafu","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/138cec09b979a9242a97b44c6b7be171~tplv-obj.png","price":30,"count":29},{"id":6131,"name":"Desert Camel","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/5b9ad81c6d9945696c5c3092aea31857~tplv-obj.png","price":9999,"count":2},{"id":6148,"name":"Flower Overflow","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/743c4bb44e7e0bf251a7f2f5ada231ee~tplv-obj.png","price":4000,"count":4},{"id":6149,"name":"Interstellar","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8520d47b59c202a4534c1560a355ae06~tplv-obj.png","price":10000,"count":1},{"id":6169,"name":"Tennis","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/09d9b188294ecf9b210c06f4e984a3bd~tplv-obj.png","price":1,"count":151},{"id":6170,"name":"Hot Choco","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/039600395778e801a8bbfea6f9bf3735~tplv-obj.png","price":30,"count":10},{"id":6200,"name":"Mirror Bloom","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a9d0e9406230fa9a901d992a90574e39~tplv-obj.png","price":1000,"count":8},{"id":6202,"name":"Arabian Coffee","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/b4315abd86e61f3401ac51eaadeb1f96~tplv-obj.png","price":1999,"count":5},{"id":6203,"name":"Sunset Speedway","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/df63eee488dc0994f6f5cb2e65f2ae49~tplv-obj.png","price":10000,"count":1},{"id":6205,"name":"Love Chat","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a54af904b8d9981fbfd414614ed3dea5~tplv-obj.png","price":400,"count":1},{"id":6233,"name":"Travel with You","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c3783da198b14071d4e0d744f8105004~tplv-obj.png","price":999,"count":3},{"id":6267,"name":"Corgi","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/148eef0884fdb12058d1c6897d1e02b9~tplv-obj.png","price":299,"count":16},{"id":6271,"name":"Falcon","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/6026505eea9b9bce071dd699253abf6a~tplv-obj.png","price":10999,"count":19},{"id":6288,"name":"Goal!","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a6e90aa6172ee6411188e3e47f943863~tplv-obj.png","price":1999,"count":8},{"id":6340,"name":"Dates","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/01169f1fd3990b867c7f24d21c0e2a7f~tplv-obj.png","price":1,"count":266},{"id":6348,"name":"Rabbit","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/61b42d630091b661e82fc8ed400b1de2~tplv-obj.png","price":1999,"count":1},{"id":6369,"name":"Lion","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4fb89af2082a290b37d704e20f4fe729~tplv-obj.png","price":29999,"count":15},{"id":6402,"name":"EyeLiner Kohl","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/77e5859bffdb7a313fce5c93a9726b4d~tplv-obj.png","price":30,"count":7},{"id":6427,"name":"Hat and Mustache","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2f1e4f3f5c728ffbfa35705b480fdc92~tplv-obj.png","price":99,"count":88},{"id":6432,"name":"Star","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/485175fda92f4d2f862e915cbcf8f5c4~tplv-obj.png","price":99,"count":1},{"id":6436,"name":"Love Focus","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/996895614694e9d8f14976ae2a570936~tplv-obj.png","price":199,"count":1},{"id":6437,"name":"Garland Headpiece","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/bdbdd8aeb2b69c173a3ef666e63310f3~tplv-obj.png","price":199,"count":2},{"id":6440,"name":"Whale diving","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/9d17fb921358aa2e0562b82d884e212e~tplv-obj.png","price":2150,"count":25},{"id":6444,"name":"Shining Stars","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/721175f1972df6acd14997a6b295418e~tplv-obj.png","price":599,"count":10},{"id":6456,"name":"TikTok Air Drop","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4a1332611d451aa9f9cd2aa2932ebbfa~tplv-obj.png","price":999,"count":3},{"id":6466,"name":"Crown of love","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/db64db418a171dbd17d33ca5f297455c~tplv-obj.png","price":1,"count":1},{"id":6554,"name":"Dance Together","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/1c7aaabca77db60f0f415739d2d61e07~tplv-obj.png","price":699,"count":1},{"id":6563,"name":"Meteor Shower","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/71883933511237f7eaa1bf8cd12ed575~tplv-obj.png","price":3000,"count":4},{"id":6587,"name":"Happy Friday","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/12b50e0fd1a777309aec562d1544f423~tplv-obj.png","price":399,"count":2},{"id":6592,"name":"TGIF","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/2734231d880b5cd20149f4cc8c760279~tplv-obj.png","price":1,"count":94},{"id":6598,"name":"Wishing Bottle","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/eb258864c5e81c519a089bbbe372189e~tplv-obj.png","price":1,"count":320},{"id":6602,"name":"July","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/3cb55f62e56bbcdaf360cc2547f12b42~tplv-obj.png","price":88,"count":13},{"id":6603,"name":"Hi July","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/441f177a4df86f3b3cd13989b506d4ff~tplv-obj.png","price":1,"count":327},{"id":6641,"name":"Ice Cube","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c4f64e143d42c83446e32487aff46b28~tplv-obj.png","price":1,"count":547},{"id":6642,"name":"Suitcase","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/ebb5bcf8d8fe3f8975eeb76b37ddbd77~tplv-obj.png","price":199,"count":8},{"id":6646,"name":"Leon the Kitten","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/a7748baba012c9e2d98a30dce7cc5a27~tplv-obj.png","price":4888,"count":5},{"id":6663,"name":"Crown Jewels","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c1e0b1e734281e345a0ceff51b8540c6~tplv-obj.png","price":99,"count":40},{"id":6669,"name":"Magic Stage","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/d2297d8da4f6a4da942d4c55f3fb5a3f~tplv-obj.png","price":2599,"count":4},{"id":6670,"name":"Present","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/38b6d75487e0087c0f2e899335382bb2~tplv-obj.png","price":1,"count":4648},{"id":6734,"name":"Wishing Bottle","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/76014ebfa958b969625aa353ec88e2fc~tplv-obj.png","price":1,"count":47},{"id":6743,"name":"Leo Star Sign","img":"https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/67cd901161cf964276a5b28251807d82~tplv-obj.png","price":9999,"count":1}]
        // .sort((a, b) => a.count - b.count)//.reverse()
        .sort((a, b) => a.price - b.price)//.reverse()
        .forEach(UpdateGiftItem)
        // .forEach(gift => {
        //     let container = $('#giftsContainer');
        //     container.append(`
        //         <div class="grid-item flex-column d-flex justify-content-between flex-column d-flex justify-content-between" data-giftId="samples">
        //             <img src="${gift.img}" class="card-img-top"/>
        //             <div class=" ">
        //                 <h5 class="card-title">${gift.name}</h5>
        //                 <p>x${gift.count}<br>${gift.price} coin</p>
        //         </div>
        //     `);
        // });
    // Hide stats
    $('#stats').fadeOut()
};
// numArray.sort((a, b) => a - b); // For ascending sort
// numArray.sort((a, b) => b - a); // For descending sort


// ----------------------------------------------
// Back up Gifts from other streamers -----------
// - 1st - copy the array of gifts
// document.body.innerText = JSON.stringify(Object.values(giftsDB)) 

// - 1.1st - copy the array of all available gifts from db
// const gifts = db.state.availableGifts.map(e=> {
//     return {
//         id: e.id,
//         name: e.name,
//         price: e.diamond_count,
//         count: 0,
//         img: e.image.url_list[0]
//     }
// })

// - 2nd - add it to giftsDB
// gifts.forEach(e => { 
//     if (!giftsDB[e.id]) {
//         giftsDB[e.id] = e
//     }
//     else if (giftsDB[e.id] && giftsDB[e.id].count < e.count) {
//         giftsDB[e.id] = e
//     }
// })
// ----------------------------------------------



// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
// States
function showStats() {
    // img
    $('#profilePicture').find('img').attr('src', db.owner.img.medium)
    // username
    $('#uniqueId').find('a')
        .attr('href', `https://www.tiktok.com/@${db.owner.uniqueId}`)
        .html(db.owner.uniqueId)
    // Update the rest of stats
    updateStats();
};

function updateStats() {
    // following info
    $('#following').html(formatNumbers(db?.owner?.follow_info?.following))
    $('#followers').html(formatNumbers(db?.owner?.follow_info?.followers))
    // Views
    $('#views')
        .attr('title', new Intl.NumberFormat('en').format(db?.liveInfo?.views?.now))
        .attr('data-mdb-original-title', new Intl.NumberFormat('en').format(db?.liveInfo?.views?.now))
        .find('h5').html(formatNumbers(db?.liveInfo?.views?.now))
    // Likes
    $('#likes')
        .attr('title', new Intl.NumberFormat('en').format(db?.liveInfo?.likes))
        .attr('data-mdb-original-title', new Intl.NumberFormat('en').format(db?.liveInfo?.likes))
        .find('h5').html(formatNumbers(db?.liveInfo?.likes))
    // Coins
    $('#coins')
        .attr('title', new Intl.NumberFormat('en').format(db?.coins()))
        .attr('data-mdb-original-title', new Intl.NumberFormat('en').format(db?.coins()))
        .find('h5').html(formatNumbers(db?.coins()))
    // Money
    $('#money')
        .attr('title', db?.total('name').sar)
        .attr('data-mdb-original-title', db?.total('symbol', 2).sar)
        .find('h5').html(db?.total('symbol', 'compact').sar)
        // .find('h5').html(db?.total('symbol').sar)
};

// viewer stats
connection.on('roomUser', (e) => {
    if (typeof db?.liveInfo?.views?.now != 'number') db.liveInfo.views = { now: 0, top: 0 };
    if (typeof e.viewerCount === 'number') {
        const viewerCount = e.viewerCount;
        if (viewerCount > db.liveInfo.views.top) db.liveInfo.views.top = viewerCount;
        db.liveInfo.views.now = viewerCount;
        // 
        updateStats();
    };
})

// like stats
connection.on('like', (e) => {
    if (typeof db?.liveInfo?.likes != 'number') db.liveInfo.likes = 0;
    if (typeof e.totalLikeCount === 'number') {
        const likeCount = e.totalLikeCount;
        db.liveInfo.likes = likeCount;
        // 
        updateStats();
    };
})