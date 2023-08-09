const arEnNumberObject = {
  0: '٠',
  1: '١',
  2: '٢',
  3: '٣',
  4: '٤',
  5: '٥',
  6: '٦',
  7: '٧',
  8: '٨',
  9: '٩'
}
var currentPage = 1

/* common */
function stopEventPropagation(event) {
  event.preventDefault()
  event.stopPropagation()
}

function convertNumberFromEnToAr(enNum) {
  let str = ''
  const enNumbers = enNum.toString().split('')

  enNumbers.forEach(num => (str += arEnNumberObject[num]))

  return str
}
/* common */

/* user interfaces */
function getAyaTafseer(sura, aya) {
  var tafseer_name = Array('مشكل', 'نصي', 'الجلالين', 'الميسر', 'ابن كثير')
  $taf = $('#tafseer')
  $taf.html('')

  p = $.ajax({
    url: 'json/aya_' + sura + '_' + aya + '.json',
    dataType: 'json'
  })

  p.fail(function (data) {
    console.log('Failed to load Tafseer!')
  })

  p.done(function (data) {
    str = ''
    for (var i = 0; i < data.length; i++) {
      taf = data[i]
      str +=
        '<strong>' +
        tafseer_name[taf.type] +
        '</strong><br>' +
        taf.text +
        '<hr>'
    }
    $taf.html(str)
  })
}

function handleFahres() {
  p = $.ajax({
    url: 'json/suras.json',
    dataType: 'json'
  })

  p.done(function (data) {
    data.forEach(function (item) {
      const row = $('<tr>').addClass('fahres-sura')
      $('<td>')
        .addClass('fahres-sura__id')
        .html(convertNumberFromEnToAr(item.id))
        .appendTo(row)
      $('<td>').addClass('fahres-sura__name').appendTo(row)
      $(`<button data-page=${item.page}>`)
        .addClass('fahres-sura__name-button')
        .html(item.name)
        .appendTo($('.fahres-sura__name', row))
      $('<td>')
        .addClass('fahres-sura__page-number')
        .html(convertNumberFromEnToAr(item.page))
        .appendTo(row)
      $('<td>')
        .addClass('fahres-sura__ayas-number')
        .html(convertNumberFromEnToAr(item.ayas))
        .appendTo(row)
      $('.suras__table tbody').append(row)
    })
  })
}

function loadPage(page) {
  if (page < 1) page = 1
  if (page > 604) page = 604
  currentPage = page
  $('.control__page-num').html('صفحة : ' + convertNumberFromEnToAr(currentPage))

  $page = $('#page')
  $page.html('')
  $taf = $('#tafseer')
  $taf.html('')

  if (page < 10) {
    pageStr = '00' + page
  } else if (page < 100) {
    pageStr = '0' + page
  } else {
    pageStr = '' + page
  }
  $page.css('background-image', 'url(img/' + pageStr + '.jpg)')

  // aya segments
  p = $.ajax({
    url: 'json/page_' + page + '.json',
    dataType: 'json'
  })

  p.fail(function (data) {
    console.log('Failed to load page map!')
  })

  p.done(function (data) {
    // Clear selected
    $('#suras tr').removeClass('active')
    for (var i = 0; i < data.length; i++) {
      aya = data[i]
      // console.log('Sura:' + aya.sura_id+' Aya:'+aya.aya_id);
      // Activate Sura
      $('.fahres-sura__name-button' + aya.sura_id).addClass('active')

      $a = $('<a>')
      $a.attr('href', '#' + aya.aya_id)
      $a.data('sura', aya.sura_id)
      $a.data('aya', aya.aya_id)
      $a.addClass('aya_link')
      for (var j = 0; j < aya.segs.length; j++) {
        seg = aya.segs[j]
        if (seg.w != 0 && seg.w < 15) continue
        if (seg.x < 15) {
          seg.w += seg.x
          seg.x = 0
        }
        $d = $('<div>')
          .css('top', seg.y + 'px')
          .css('left', seg.x + 'px')
          .css('width', seg.w + 'px')
          .css('height', seg.h + 'px')
        $a.append($d)
        // console.log('Segment:'+aya.sura_id+' Aya '+aya.aya_id);
      }
      $page.append($a)
    }
  })
}
/* user interface */

/*interactions */
function handleSuraClick(event) {
  stopEventPropagation(event)
  pageNumber = $(event.target).data('page')
  loadPage(pageNumber)
}

function handleAyaClick(event) {
  stopEventPropagation(event)
  el = $(event.target).closest('a')
  sura = el.data('sura')
  aya = el.data('aya')
  $('a.aya_link').removeClass('active')
  el.addClass('active')
  // console.log('Aya Clicked!' + sura + ' ' + aya);
  getAyaTafseer(sura, aya)
}

function changePage(event) {
  stopEventPropagation(event)
  el = $(event.target)
  offset = el.data('offset')
  console.log('Offset:' + offset)
  page = parseInt(currentPage) + offset
  loadPage(page)
}
/*interactions */

/* main */
$(function () {
  console.log('JQuery Started!')
  handleFahres()
  loadPage(1)
  $(document).on('click', 'button.fahres-sura__name-button', handleSuraClick)
  $(document).on('click', 'a.aya_link', handleAyaClick)

  $('.control__button').click(changePage)

  // Hotkeys
  //$(document).bind('keydown', 'right', function() { p = parseInt(currentPage) -1; document.location='#?page='+ p; }  );
  //$(document).bind('keydown', 'left', function() { p = parseInt(currentPage) +1; document.location='#?page='+ p; }  );
  $(document).bind('keydown', 'right', function () {
    p = parseInt(currentPage) - 1
    loadPage(p)
  })
  $(document).bind('keydown', 'left', function () {
    p = parseInt(currentPage) + 1
    loadPage(p)
  })
})
/* main */
