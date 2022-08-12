
// https://formatjs.io/docs/polyfills/intl-numberformat
function formatNumbers(number, compactDisplay = 'short') {
    return Intl.NumberFormat('en', {
        notation: 'compact',
        compactDisplay // short/long
    }).format(typeof number === 'number' ? number : 0)
};



// Check if element is visible on screen
// https://stackoverflow.com/questions/52220491/jquery-detecting-if-element-is-in-viewport
// https://gokhancelebi.net/jquery-detect-when-element-visible-on-screen-viewport/
$.fn.isVisible = function () {
    let elementHeight = $(this).outerHeight();
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + elementHeight;

    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();

    // reterun true if any part of the element is visible on screen
    // return elementBottom > viewportTop && elementTop < viewportBottom;
    
    // reterun true if full element is visible on screen
    // return elementBottom > viewportTop && (elementTop + elementHeight) < viewportBottom;
    
    // reterun true if half or more of the element is visible on screen
    return elementBottom > viewportTop && (elementTop + elementHeight/2) < viewportBottom;
};



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// Sort '.grid-item' divs inside '#giftsContainer'
// - Method 1 -
// var divList = $('.grid-item');
// divList.sort(function(a, b){ 
// 	$(a).find('img').removeClass( 'animate__animated animate__headShake');
//   let A = $(a).find('b').html();
//   let B = $(b).find('b').html()
//   return A - B;
// });
// $('#giftsContainer').html(divList);


// - Method 2 -
// // $('#giftsContainer').randomize('.grid-item');
// $.fn.randomize = function(selector){
//     (selector ? this.find(selector) : this).parent().each(function(){
//         $(this).children(selector).sort(function(){
//             return Math.random() - 0.5;
//         }).detach().appendTo(this);
//     });
//     return this;
// };


// - Method 3 -
// // $('#giftsContainer').divSort('.grid-item');
// $.fn.divSort = function(selector){
//     (selector ? this.find(selector) : this).parent().each(function(){
//         $(this).children(selector).sort(function(a, b){
//   				let A = $(a).find('b').html();
//   				let B = $(b).find('b').html()
//   				return A - B;
//         }).detach().appendTo(this);
//     });
//     return this;
// };


// Method 4 - Expensive to cheapest
// // $('#giftsContainer').divSort('.grid-item');
// $.fn.divSort = function(selector){
//     (selector ? this.find(selector) : this).parent().each(function(){
//         $(this).children(selector).sort(function(a, b){
//   				let A = $(a).find('p').html().match(/\d*/g).join('')
//   				let B = $(b).find('p').html().match(/\d*/g).join('')
//   				return B - A;
//         }).detach().appendTo(this);
//     });
//     return this;
// };

