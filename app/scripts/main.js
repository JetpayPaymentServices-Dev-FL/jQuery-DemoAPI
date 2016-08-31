//csi live post (staging). default values//
//modification of identifiers section may be needed if adding multiple line items//
var clientName = 'csi-live',
    clientID = '8E3F20CE5619431D9BE737FD80E3E990',
    paymentTypeAPIName = 'Utility',
    csiUserID = 1;
    $('.apiSub').val(clientName);
    $('.clientIDSub').val(clientID);
    $('.paymentIDSub').val(paymentTypeAPIName);
    $('i').tooltip();
//client guid generation, please do not use for production (demo only). Server should be used to produce true guid//
var uiid = guid();
$( '.transactionSub' ).text(uiid);
function guid() {
  return s4() + s4() + s4() + s4() +
    s4() + s4() +  s4();
}
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function generateAmount(){
  var dollars = Math.floor(Math.random() * 90 + 10),
  //cents = Math.floor(Math.random() * 90 + 10),
  totalAmount = dollars.toString()+'.00';
  return totalAmount;
}
$( '.btnGenerate' ).click(function( event ) {
    $.ajax({
      url: 'http://api.randomuser.me/?nat=us',
      dataType: 'json',
      success: function(data){
        populateRandomData(data.results[0]);
      }
});
 event.preventDefault();
});
function populateRandomData(obj){
     $('.amountSub').val(generateAmount());
     $('.nameSub').val(obj.name.first + ' '+ obj.name.last);
     $('.addressSub').val(obj.location.street);
     $('.citySub').val(obj.location.city);
    $('[name=state] option').filter(function() { 
        if($(this).text().toLowerCase() == obj.location.state){
             $('.stateSub').val(this.value);
        }
      });
     $('.ctySub').val(obj.location.city)
     $('.zipSub').val(obj.location.postcode);
     $('[name=country] option').filter(function() { 
        if($(this).value == obj.nat){
             $('.countrySub').val(this.value);
        }
      });
     $('.emailSub').val(obj.email);
     $('.phoneSub').val(obj.phone);
     $('.idOneSub').val(Math.floor(100000000 + Math.random() * 900000000).toString());
     $('.idTwoSub').val(Math.floor(100000000 + Math.random() * 900000000).toString());
     $('.notesSub').val('Test Transaction');
};
function validateAreaCodePhone(phoneNumber){
      var formattedPhone = phoneNumber.replace(/[^\d]/g,'');
      var phoneMinusArea = formattedPhone.slice(3, formattedPhone.length);
      return '850'+phoneMinusArea;
}
///////VT POST///////////////

$( 'form' ).submit(function( event ) {
   $('.loader').fadeIn();
   //if defaults are overridden//
   if($('.apiSub').val().length > 0 && $('.clientIDSub').val().length > 0 && $('.paymentIDSub').val().length > 0){
       clientName = $('.apiSub').val();
       clientID = $('.clientIDSub').val();
       paymentTypeAPIName = $('.paymentIDSub').val();
   }
  //transactionIdentifier, this is generated automatically//
  //collectionMode would almost always be web (1) so left hard coded//
  //'identifiers' max length of 17 paymentID primary, secondary, etc
  //payment type API name must match variable up top or error will occur//
  var vtPostTransaction = {
  'clientKey': clientID,
  'transactionIdentifier': $( '.transactionSub' ).text(),
  'collectionMode': 1,
  'amount': Number($('.amountSub').val().replace('$','')),
  'billing': {
    'name': $('.nameSub').val(),
    'address': $('.addressSub').val(),
    'addressLine2': 'ste 590',
    'city': $('.citySub').val(),
    'county': $('.ctySub').val(),
    'state': $('.stateSub').val(),
    'zip': $('.zipSub').val(),
    'country': $('.countrySub').val(),
    'email': $('.emailSub').val(),
    'phone': validateAreaCodePhone($('.phoneSub').val())
  },
  'csiUserID': csiUserID,
  'notes': $('.notesSub').val(),
  'lineItems': [
    {
      'identifiers': [
        $('.idOneSub').val(),
        $('.idTwoSub').val()
      ],
      'amount': Number($('.amountSub').val().replace('$','')),
      'paymentType': paymentTypeAPIName
    }
  ],
  'urlSilentPost': '',
  'urlReturnPost': 'http://www.collectorsolutions.com'
}
//test values to see what we are passing up//
console.log(JSON.stringify(vtPostTransaction));
$.ajax({
    type: 'POST',
    url: 'https://stage.collectorsolutions.com/magic-api/api/virtualtransaction/post',
    data: JSON.stringify(vtPostTransaction),
    contentType: 'application/json; charset=utf-8',
    crossDomain: true,
    dataType:"jsonp",
    success: function(data, status, jqXHR) { 
	      $('.loader').fadeOut('slow');
       console.log('https://stage.collectorsolutions.com/magic-ui/virtualterminal/\'+clientName+\'/\'+data.transactionIdentifier', 'anything');
       window.location.replace('https://stage.collectorsolutions.com/magic-ui/virtualterminal/'+clientName+'/'+data.transactionIdentifier);
    },
    error: function (jqXHR, status) {            
        $('.loader').fadeOut('slow');
        console.log(status)
        $('.notesSub').val(status)
   }
 });
  event.preventDefault();
});
 $('.btnGet').click(function (event){ 
   $('.loader').fadeIn();
  var vtGetTransaction = {
  'clientKey': clientID,
  'transactionIdentifier': $('.transSub').val()
}
console.log(JSON.stringify(vtGetTransaction));
$.ajax({
    type: 'POST',
    url: 'https://stage.collectorsolutions.com/magic-api/api/virtualtransaction/get',
    data: JSON.stringify(vtGetTransaction),
    contentType: 'application/json; charset=utf-8',
    crossDomain: true,
    dataType: 'json',
    success: function(data, status, jqXHR) { 
	      $('.loader').fadeOut('slow');
        var items = [];
        $.each( data, function( key, val ) {
          items.push( '<li id=\'' + key + '\'>' + key + ' : ' + val + '</li>' );
        });
        $( '<ul/>', {
          'class': 'my-new-list',
          html: items.join( '' )
        }).appendTo( '.getResults' );
    },
    error: function (jqXHR, status) {            
        $('.loader').fadeOut('slow');
        console.log(status)
        $('.getResults').text(status);
   }
 });
  event.preventDefault();
});