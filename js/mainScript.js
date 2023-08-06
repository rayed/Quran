var currentPage = 1

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
    str = ''
    for (var i = 0; i < data.length; i++) {
      sura = data[i]
      str += '<tr id="sura_link_' + sura.id + '">'
      str += '<td>' + (i + 1) + '</td>'
      str += '<td> <a class="sura_link" href="" '
      str += 'data-page="' + sura.page + '" >'
      str += sura.name + '</a></td>'
      str += '<td>' + sura.page + '</td>'
      str += '<td>' + sura.ayas + '</td>'
      str += '</tr>'
    }
    $('#suras tbody').html(str)
  })
}

function loadPage(page) {
  if (page < 1) page = 1
  if (page > 604) page = 604
  currentPage = page
  $('.control__page-num').html('صفحة : ' + currentPage)

  $page = $('#page')
  $page.html('')
  $taf = $('#tafseer')
  $taf.html('')

  if (page < 10) {
    page_str = '00' + page
  } else if (page < 100) {
    page_str = '0' + page
  } else {
    page_str = '' + page
  }
  $page.css('background-image', 'url(img/' + page_str + '.jpg)')

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
      $('#sura_link_' + aya.sura_id).addClass('active')

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
  event.preventDefault()
  event.stopPropagation()
  el = event.target
  page = $(el).data('page')
  // console.log('Sura Clicked!' + page);
  loadPage(page)
}

function handleAyaClick(event) {
  event.preventDefault()
  event.stopPropagation()
  el = $(event.target).closest('a')
  sura = el.data('sura')
  aya = el.data('aya')
  $('a.aya_link').removeClass('active')
  el.addClass('active')
  // console.log('Aya Clicked!' + sura + ' ' + aya);
  getAyaTafseer(sura, aya)
}

function changePage(event) {
  event.preventDefault()
  event.stopPropagation()
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
  $(document).on('click', 'a.sura_link', handleSuraClick)
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
