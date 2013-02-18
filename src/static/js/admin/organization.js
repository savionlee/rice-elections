// Generated by CoffeeScript 1.4.0
var errorHandler, removeStyleClassesFromButton, restoreDefaultButtonState, successHandler, toggleListForEditing, updateOrganizationInformation;

jQuery(function() {
  $('.edit-voter-list').click(function(event) {
    return toggleListForEditing(event, $(this));
  });
  $('#updateProfile').click(function(event) {
    return updateOrganizationInformation(event);
  });
  return $('.profile-input').focus(function(event) {
    return restoreDefaultButtonState(false);
  });
});

toggleListForEditing = function(event, link) {
  var editing, listID;
  listID = link.attr('href');
  editing = link.attr('data-editing');
  link.attr('data-editing', 1 - editing);
  console.log(listID);
  event.preventDefault();
  if (editing === '0') {
    $(listID + '-paragraph').hide();
    $(listID + '-textarea').show();
    $(listID + '-buttons').show();
  } else {
    $(listID + '-paragraph').show();
    $(listID + '-textarea').hide();
    $(listID + '-buttons').hide();
  }
  return false;
};

updateOrganizationInformation = function(event) {
  var data, postData;
  event.preventDefault();
  if ($('#updateProfile').hasClass('disabled')) {
    return false;
  }
  data = {
    'id': $('#organization-id').val(),
    'name': $('#organization-name').val(),
    'description': $('#organization-description').val(),
    'website': $('#organization-website').val()
  };
  postData = {
    'method': 'update_profile',
    'data': data
  };
  console.log(postData);
  $.ajax({
    url: '/admin/organization-panel',
    type: 'POST',
    data: {
      'data': JSON.stringify(postData)
    },
    success: function(data) {
      return successHandler(data);
    },
    error: function(data) {
      return errorHandler(data);
    }
  });
  return false;
};

successHandler = function(data) {
  var s;
  s = $('#updateProfile');
  s.html('Your profile has been updated!');
  s.addClass('disabled');
  removeStyleClassesFromButton();
  return s.addClass('btn-success');
};

errorHandler = function(data) {
  var s;
  s = $('#updateProfile');
  s.html('Something went wrong :(');
  s.addClass('disabled');
  removeStyleClassesFromButton();
  return s.addClass('btn-error');
};

restoreDefaultButtonState = function(disabled) {
  var s;
  s = $('#updateProfile');
  if (disabled) {
    s.addClass('disabled');
  } else {
    s.removeClass('disabled');
  }
  s.html(s.attr('data-default-text'));
  removeStyleClassesFromButton();
  return s.addClass('btn-primary');
};

removeStyleClassesFromButton = function() {
  var s;
  s = $('#updateProfile');
  s.removeClass('btn-success');
  s.removeClass('btn-error');
  return s.removeClass('btn-primary');
};