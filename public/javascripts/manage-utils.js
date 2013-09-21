$(document).ready(function() {
  $('.close').click(function(evt) {
    $('#error').addClass('hidden');

    var $el = $(evt.target).parent().parent();
    var saveid = $el.find('.saveid').text();

    if (isNaN(Number(saveid))) return $('#error').removeClass('hidden')
      .html('<b>Error</b>: Removed save ID is not a number');

    $.post('/manage/rm/post', {saveid: saveid}, function(data) {
      $('#success').removeClass('hidden').html('<b>Success</b>: Removed element')
        .delay(2000).hide();
    });

    $el.hide('fast').remove();
  });


  $('#submit').click(function(evt) {
    $('#error').addClass('hidden');
    evt.preventDefault();
    var scripts = $('#scripts').val(),
        saveid = $('#saveid').val();

    /* First level of error safety */
    if (isNaN(Number(saveid)))
      return $('#error').removeClass('hidden').html('<b>Error</b>: Save ID is not a number');

    if (!/([\d]+,\s*)+/.test(scripts))
      return $('#error').removeClass('hidden').html('<b>Error</b>: Scripts is an invalid list');

    $.post('/manage/add/post', {assoc: scripts, saveid: saveid}, function (data) {
      $('#success').removeClass('hidden').html('<b>Success</b>: Association has been added!');
      location.reload(false);
    });
  });


});