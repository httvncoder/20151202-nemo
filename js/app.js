/**
 * NEMO APP by Tua Hoang Nguyen
 * @author hoangtua.vn@gmail.com 
 * @skype hoangtua
 * @phone 0939.96.75.96
 * @company Cherry Vietnam
 */

var DOMAIN = "http://nemoapp.3anutrition.com:8088/NEMOApp";
var ERROR_CODE = {
	"001": "Validation passed",
	"990": "Mã người dùng không đúng",
	"991": "Mật khẩu không đúng",
	"992": "Tài khoản đã ngưng kích hoạt",
	"993": "Tài khoản chưa được kích hoạt",
	"994": "Tài khoản đã bị khóa",
	"995": "Mật khẩu đã hết hạn",
	"100": "Không thể kết nối tới máy chủ",
	"101": "Lưu không thành công",
	"102": "Dữ liệu không đúng định dạng, kiểm tra lại form.",
	"002": "Lưu thành công"
}
var ALL_ROLE = ['CAPTRNEWUSER', 'CAPTRINVENTORY', 'CAPTRPGSELLOUT']
var USER = null;
var previousPage = ''
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

$(document).on("deviceready", function() {
	console.log('Ready 1')
  deviceReadyDeferred.resolve();
});

$(document).ready(function () {
	console.log('Ready 2')
  jqmReadyDeferred.resolve();
});

$.when(jqmReadyDeferred).then(init);

function init() {
	FastClick.attach(document.body)	
	gotoPage('login')
	updateStatus()
	if (typeof localStorage.user != 'undefined') {
		USER = JSON.parse(localStorage.user)
		syncDown()
		updateFeature()
		gotoPage('home')
		$('div.username').text(USER.name)
	}
	$('.multiPrev').click(function(){
		if(previousPage=='clientdata'){
			renderPageClientData()
			gotoPage('clientdata')
		} else {
			gotoPage('home')			
		}
	})
	initLocalData()
	$('#btnLogin').click(function(){
		doLogin()
		return false
	})
	$("#btnLogout").click(function(){
		doLogout()		
		console.log('Logout now')
		return false
	})
	$('#uploadData').click(function(){
		checkAuthentication(syncUp)
	})
	$('#downloadData').click(function(){
		syncDown()
	})

	//page home 
	$('#btnAddUser').click(function(){
		gotoPage('customer') 
		renderPageCustomer()
	})
	$('#btnInventory').click(function(){
		gotoPage('inventory')
		renderPageInventory()
	})
	$('#btnSellout').click(function(){
		gotoPage('sellout')
		renderPageSellout()
	})
	$('#btnClientData').click(function(){
		gotoPage('clientdata')
		renderPageClientData()
	})

	//Page add customer
	$('select[name="provinceid"]').change(function(){
  	var selected = PROVINCES.filter(function(item){return item.prov == this}, $(this).val());
  	selected.sortOn('dist')
  	renderOptions('select[name="districtid"]', selected, 'dist', 'dist', '<option value="">Chọn quận huyện</option>');
  });
	$('#resetFormUser').click(function(){
		resetForm('#addUser')
		return false
	})
	$('#submitFormUser').click(function(){
		if (createCustomer()) {
			updateStatus()
			var clientid = formGet('input','clientid')
			if (clientid != '') {
				renderPageClientData()
				gotoPage('clientdata')
			} else {
				resetForm('#addUser', false)
				gotoPage('home')
			}
		}
		return false
	})
	$('#addUser').submit(function(){
		//$('#submitFormUser').click()
		return false
	})
	$('#deleteUser').click(function(){
		if ( !window.confirm('Bạn chắc chắn muốn xóa bản ghi này?') ) {
			return false
		}
		var id = formGet('input', 'clientid')
		var result = CUSTOMERS.removeAt('clientid', id)
		if (result) {
			localStorage.customers = JSON.stringify(CUSTOMERS)
			resetForm('#addUser', false)
			renderPageClientData()
			gotoPage('clientdata')
		} else {
			showError('Không thể xóa dữ liệu này!')
		}
		return false
	})

	//page inventory
	$('#resetFormInventory').click(function(){
		resetForm('#addInventory')
		return false
	})
	$('#submitFormInventory').click(function(){
		if (createReportInventory()) {
			updateStatus()
			resetForm('#addInventory', false)
			gotoPage('home')
		}
		return false
	})
	$('#deleteInventory').click(function(){
		if ( !window.confirm('Bạn chắc chắn muốn xóa bản ghi này?') ) {
			return false
		}
		var id = formGet('input', 'clientid','#addInventory')
		var result = INVENTORY.removeAt('clientid', id)
		if (result) {
			localStorage.inventory = JSON.stringify(INVENTORY)
			resetForm('#addInventory', false)
			renderPageClientData()
			gotoPage('clientdata')
		} else {
			showError('Không thể xóa dữ liệu này!')
		}
		return false
	})
	$('#addInventory select[name="outletid"], select[name="inv_date"]').change(function(){
		var day = getDate('#addInventory','inventory')
		var filter1 = INVENTORY.items('cycledate',day)
		if (null == filter1)
			return
		var filter2 = filter1.item('outletid', $('#addInventory select[name="outletid"]').val())
		if (null == filter2)
			return
		formSet('input', 'clientid', filter2.clientid, '#addInventory')
		fillTableData(filter2.inventory, '#addInventory')
		showError('Thống kê này đã có sẵn. Khi lưu sẽ ghi đè lên dữ liệu cũ.')
		$('#deleteInventory').show()
		$('#resetFormInventory').hide()
	})
	// page sellout
	$('#resetFormSellout').click(function(){
		resetForm('#addInventory')
		return false
	})
	$('#submitFormSellout').click(function(){
		if (createReportSellout()) {
			updateStatus()
			resetForm('#addSellout', false)
			gotoPage('home')
		}
		return false
	})
	$('#deleteSellout').click(function(){
		if ( !window.confirm('Bạn chắc chắn muốn xóa bản ghi này?') ) {
			return false
		}
		var id = formGet('input', 'clientid','#addSellout')
		var result = SELLOUT.removeAt('clientid', id)
		if (result) {
			localStorage.sellout = JSON.stringify(SELLOUT)
			resetForm('#addInventory', false)
			renderPageClientData()
			gotoPage('clientdata')
		} else {
			showError('Không thể xóa dữ liệu này!')
		}
		return false
	})
	$('#addSellout select[name="outletid"], select[name="selloutD"], select[name="selloutM"], select[name="selloutY"]').change(function(){
		var day = getDate('#addSellout','sellout')
		var filter1 = SELLOUT.items('cycledate',day)
		if (null == filter1)
			return
		var filter2 = filter1.item('outletid', $('#addSellout select[name="outletid"]').val())
		if (null == filter2)
			return
		formSet('input', 'clientid', filter2.clientid, '#addSellout')
		fillTableData(filter2.sellout, '#addSellout')
		showError('Thống kê này đã có sẵn. Khi lưu sẽ ghi đè lên dữ liệu cũ.')
		$('#deleteSellout').show()
		$('#resetFormSellout').hide()
	})

	// Page clientdata
	$(".page.clientdata h3").click(function(){
		var icon = $(this).find("i.fa")
		if (icon.hasClass('fa-rotate-180')) {
			icon.removeClass('fa-rotate-180')
		} else {
			icon.addClass('fa-rotate-180')
		}
		$(this).next().toggle()
	})
} // END INIT FUNCTION

function showWait() {
	$('.page.activePage').append('<div class="overlay"><div class="waiting"><i class="fa fa-spinner fa-pulse"></i></div></div>')
}
function hideWait() {
	$('.overlay .waiting').parent('.overlay').remove()
}

function updateStatus() {
	var text = "Số dữ liệu chưa tải lên hệ thống : "	
	$('#statusText').text(text+ countData() )
}

function countData() {
	if (USER) {
		var countC = CUSTOMERS.items('usersysid', USER.sysid).length
		var countI = INVENTORY.items('usersysid', USER.sysid).length 
		var countS = SELLOUT.items('usersysid', USER.sysid).length
		return countC + countI + countS
	}
	return 0
}

function doLogin() {
	console.log('Login now')
	showWait()
	$.ajax({
    url: DOMAIN+'/LoginValidationController',
    data: JSON.stringify({
			userid: $('#username').val(),
			password: $('#password').val()
		}),
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	if (obj.responsecode == '001'){
    		USER = obj
    		USER.userid = $('#username').val()
    		USER.password = $('#password').val()
    		localStorage.setItem('user', JSON.stringify(USER)) 
				syncDown()	
				updateFeature()
				gotoPage('home')	
				$('div.username').text(USER.name)
				$('.page.login .alert').hide()
    	}
			else 
				showError(ERROR_CODE[obj.responsecode])
		},
		error: function(xhr, status, error) {
			console.log(status)
			showError("Không có kết nối Internet")
		},
		complete: function() {
			hideWait()
		}
	});	
	return false;
}
function doLogout() {
	gotoPage('login')
	$('#username').val('')
	$('#password').val('')
}
function gotoPage(page) {
	previousPage = $('.page.activePage').attr("class").split(' ')[1]
	$('.page.activePage').hide();
	$('.page.activePage').removeClass('activePage');
	$('.page.'+page).fadeIn();
	$('.page.'+page).addClass('activePage')
	updateStatus()
}
function showError(text) {
	$('.activePage .alert').html(text)
	$('.activePage .alert').removeClass('hidden')
	$('.activePage .alert').show()
	$('html,body').scrollTop(0)
}

function renderOptions(ele, data, val, text, hint, defaultVal) {
	if (typeof defaultVal == 'undefined')
		defaultVal = ''
	var options = hint;
	for (var i = 0; i < data.length; i++) {
		var selected = defaultVal == data[i][val] ? 'selected' : ''
		options += '<option value="'+data[i][val]+'" '+selected+'>'+data[i][text]+'</option>'
	}
	$(ele).html(options);	
}
function renderSingleOptions(ele, data, hint, defaultVal) {
	if (typeof defaultVal == 'undefined') 
		defaultVal = ''
	var options = hint;
	for (var i = 0; i < data.length; i++) {
		var selected = defaultVal == data[i] ? 'selected' : ''
		options += '<option value="'+data[i]+'" '+selected+'>'+data[i]+'</option>';
	}
	$(ele).html(options);
}

function renderPageCustomer() {
	resetForm('#addUser', false)
	//render cua hang
	renderOptions('#addUser select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>');  
	
	//render tinh thanh pho
	var tmp = uniqBy(PROVINCES, function(item) {return item.prov})	
  renderOptions('select[name="provinceid"]',tmp, 'prov', 'prov', '<option value="">Chọn tỉnh thành</option>' );

  //render quan huyen
  //handle 1 lần sự thay đổi tỉnh thì đổi quận trong document ready

  //render DOB
  renderSingleOptions('select[name="DOB_D"]',range(1,31),'<option value="">Ngày</option>')
  renderSingleOptions('select[name="DOB_M"]',range(1,12),'<option value="">Tháng</option>')
  renderSingleOptions('select[name="DOB_Y"]',range((new Date()).getFullYear() - 85, (new Date()).getFullYear() + 1).reverse(),'<option value="">Năm</option>')

  var comPowderMilk = COMPETITOR_PRODUCTS.filter(function(obj){return obj.type == 'P'})
  var comLiquidMilk = COMPETITOR_PRODUCTS.filter(function(obj){return obj.type == 'L'})
  var abbPowderMilk = ABBOTT_PRODUCTS.filter(function(obj){return obj.type == 'P'})
  var abbLiquidMilk = ABBOTT_PRODUCTS.filter(function(obj){return obj.type == 'L'})
	renderOptions('select[name="compowderproduct"]', [{id:'', name:'Chọn sữa bột'}].concat(comPowderMilk), 'id', 'name');
	renderOptions('select[name="comliquidproduct"]', [{id:'', name:'Chọn sữa nước'}].concat(comLiquidMilk), 'id', 'name');
	renderOptions('select[name="abbpowderproduct"]', [{id:'', name:'Chọn sữa bột'}].concat(abbPowderMilk), 'id', 'name');
	renderOptions('select[name="abbliquidproduct"]', [{id:'', name:'Chọn sữa nước'}].concat(abbLiquidMilk), 'id', 'name');

	$('#resetFormUser').show()
	$('#deleteUser').hide()
  $('.page.customer .nav-header').text('Thêm khách hàng')		
}
function renderPageInventory() {
	renderOptions('#addInventory select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>');	
  renderOptions('select[name="inv_date"]',INV_DATE, 'cycledate','desc','<option value="">Ngày thống kê</option>')  

  //render data table
  if (!$('#addInventory').hasClass('isRendering')) {
  	renderTableData('#addInventory table tbody', NEMO_PRODUCTS.sort(compareNemo), 'id', 'name')  	
  	$('#addInventory').addClass('isRendering')
  }
  resetForm('#addInventory', false)
  $('#resetFormInventory').show()
  $('#deleteInventory').hide()
  $('.page.inventory .nav-header').text('Thống kê tồn kho')
}

function renderPageSellout() {
	renderOptions('#addSellout select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>');
	//render DOB
  renderSingleOptions('select[name="selloutD"]',range(1,31),'<option value="">Ngày</option>')
  renderSingleOptions('select[name="selloutM"]',range(1,12),'<option value="">Tháng</option>')
  renderSingleOptions('select[name="selloutY"]',range((new Date()).getFullYear() - 1, (new Date()).getFullYear() + 1).reverse(),'<option value="">Năm</option>')

  //render data table
  if (!$('#addSellout').hasClass('isRendering')) {
  	renderTableData('#addSellout table tbody', NEMO_PRODUCTS.sort(compareNemo), 'id', 'name')
  	$('#addSellout').addClass('isRendering')
	}

	resetForm('#addSellout', false)
	$('#resetFormSellout').show()
  $('#deleteSellout').hide()
  $('.page.sellout .nav-header').text('Thống kê doanh số')

}
function renderPageClientData() {
	//partial Customer
	var html = ''
	var tmp = '<div class="row %alert%" data-id="%cusid%"><i class="fa fa-close" onclick="deleteRecord(\'%cusid%\', \'CUSTOMERS\')"></i><div class="title" onclick="fillFormCustomer(\'%cusid%\');gotoPage(\'customer\')">%cusname%</div><div class="subtitle">%cusadd% - %cusfone%</div></div>'
	var curData = CUSTOMERS.items('usersysid', USER.sysid) 
	for(var i = 0; i < curData.length; i++) {
		row = tmp.replace(/%cusid%/g, curData[i].clientid)
		row = row.replace(/%cusname%/, curData[i].cusfamilyname + ' ' + curData[i].cusgivenname)
		row = row.replace(/%cusadd%/, curData[i].district)
		row = row.replace(/%cusfone%/, curData[i].phone)
		row = row.replace(/%alert%/, ('syncuperror' in curData[i] || curData[i].syncuperror == true) ? 'alert' : '')
		html += row
	}	
	$('h3.ROLE_CAPTRNEWUSER span').text(' Danh sách khách hàng ('+curData.length+')')
	$('#listCustomer').html(html)

	//partial Inventory
	html = ''
	tmp = '<div class="row %alert%" data-id="%pid%"><i class="fa fa-close" onclick="deleteRecord(\'%pid%\', \'INVENTORY\')"></i><div class="title" onclick="fillInventory(\'%pid%\');gotoPage(\'inventory\')">%name%</div><div class="subtitle">%date%</div></div>'
	var curData = INVENTORY.items('usersysid', USER.sysid)
	for(var i = 0; i < curData.length; i++) {		
		var outlet = OUTLETS.item(curData[i].outletid)
		row = tmp.replace(/%name%/, outlet.name)
		row = row.replace(/%date%/, vnDate(curData[i].cycledate))
		row = row.replace(/%pid%/g, curData[i].clientid)
		row = row.replace(/%alert%/, curData[i].syncuperror == true ? 'alert' : '')
		html += row
	}	
	$('h3.ROLE_CAPTRINVENTORY span').text('Danh sách tồn kho ('+curData.length+')')
	$('#listInventory').html(html)

	//partial Sellout
	html = ''
	tmp = '<div class="row %alert%" data-id="%pid%"><i class="fa fa-close" onclick="deleteRecord(\'%pid%\', \'SELLOUT\')"></i><div class="title" onclick="fillSellout(\'%pid%\');gotoPage(\'sellout\')">%name%</div><div class="subtitle">%date%</div></div>'
	var curData = SELLOUT.items('usersysid', USER.sysid)
	for(var i = 0; i < curData.length; i++) {
		var outlet = OUTLETS.item(curData[i].outletid)
		row = tmp.replace(/%name%/, outlet.name)
		row = row.replace(/%date%/, vnDate(curData[i].cycledate))
		row = row.replace(/%pid%/g, curData[i].clientid)
		row = row.replace(/%alert%/, curData[i].syncuperror == true ? 'alert' : '')
		html += row
	}	
	$('h3.ROLE_CAPTRPGSELLOUT span').text('Danh sách doanh số ('+curData.length+')')	
	$('#listSellout').html(html)
}


function renderTableData(selector, data, idLabel, displayLabel) {
	var rows = ''
	for(var i = 0; i<data.length; i++) {
		rows += '<tr>'
		rows += '<td class="col-left">'+data[i][displayLabel]+'</td>'
		rows += '<td class="col-right">'
		rows += '	<input type="number" class="inv-product" data-id="'+data[i][idLabel]+'" value="">'
		rows += '</td>'
		rows += '</tr>'
	}
	$(selector).append(rows)
}
function resetForm(selector, doConfirm) {
	if (typeof doConfirm == 'undefined') {
		doConfirm = true;
	}
	if (doConfirm) {
		var isReset = confirm("Bạn có muốn xóa nội dung đã nhập để làm lại?");
		if (isReset == false) 
			return;		
	}
	$(selector).find('select').val('')
	$(selector).find('input').val('')
	$(selector).find('.alert').hide()
	$('html,body').scrollTop(0)
}

function syncDown() {
	var defProvince 	= $.Deferred()
	var defOutlet		 	= $.Deferred()
	var defCompetitor = $.Deferred()
	var defAbbott 		= $.Deferred()
	var defNemo				= $.Deferred()
	var defDate				= $.Deferred()
	var countToDetectLostInternet = 0
	$("#statusText").text("Đang tải xuống ...")
	showWait()
	$.when(defProvince,defOutlet,defCompetitor,defAbbott, defNemo, defDate).then(function(){
		hideWait()
		initOnlineData()
		if (isDataReady()) {
			$("#statusText").text("Tải xuống thành công!")
		} else {
			$("#statusText").html("Dữ liệu chưa sẵn sàng!")
		}

		// Đếm số lượng defferred, đủ 6 cái ajax đều error thì chắc là mất kết nối rồi
		if (countToDetectLostInternet == 6) {
			countToDetectLostInternet = 0
			$("#statusText").html("Không có kết nối Internet!")	
		}
	})
	$.ajax({
    url: DOMAIN+'/SyncDownProvinceController',
    data: "",
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	PROVINCES = obj.province
    	PROVINCES.sortOn('prov')
    	localStorage.provinces = JSON.stringify(PROVINCES)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		},
		complete: function(){
    	defProvince.resolve()
		}
	});	
	$.ajax({
    url: DOMAIN+'/SyncDownPGOutletController',
    data: '{"userid":"'+USER.userid+'"}',
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	OUTLETS = obj.pgoutlet
    	OUTLETS.sortOn('name')
    	localStorage.outlets = JSON.stringify(OUTLETS)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		},
		complete: function(){
    	defOutlet.resolve()
		}
	});		
	$.ajax({
    url: DOMAIN+'/SyncDownCompetitorProductController',
    data: '',
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	COMPETITOR_PRODUCTS = obj.competitorproduct
    	COMPETITOR_PRODUCTS.sortOn('name')
    	localStorage.competitor_products = JSON.stringify(COMPETITOR_PRODUCTS)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		},
		complete: function(){
    	defCompetitor.resolve()
		}
	});			
	$.ajax({
    url: DOMAIN+'/SyncDownAbbottProductController',
    data: '',
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	ABBOTT_PRODUCTS = obj.abbottproduct
    	ABBOTT_PRODUCTS.sortOn('name')
    	localStorage.abbott_products = JSON.stringify(ABBOTT_PRODUCTS)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		}, 
		complete: function(){
    	defAbbott.resolve()
		}
	});	
	$.ajax({
    url: DOMAIN+'/SyncDownNEMOProductController',
    data: '',
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	NEMO_PRODUCTS = obj.nemoproduct
    	localStorage.nemo_products = JSON.stringify(NEMO_PRODUCTS)
    	
    	//remove để làm mới danh sách trên giao diện
    	$('#addInventory').removeClass('isRendering')    	
    	$('#addSellout').removeClass('isRendering')    	
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		},
		complete: function(){
    	defNemo.resolve()
		}
	});	
	$.ajax({
    url: DOMAIN+'/SyncDownInventoryCycleController',
    data: '',
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	INV_DATE = obj.inventorycycle
    	localStorage.inv_date = JSON.stringify(INV_DATE)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		},
		complete: function(){
    	defDate.resolve()
		}
	});	
	
}

function getDOB() {
	var d = formGet('select', 'DOB_D')
	var m = formGet('select', 'DOB_M')
	var y = formGet('select', 'DOB_Y')	

	d = (d < 10 && d != '')? "0"+d : d
	m = (m < 10 && m != '')? "0"+m : m

	return d+m+y;
}

function createCustomer() {		
	var data = {
		clientid: makeid(8),
		userid:USER.userid, 
		usersysid:USER.sysid, 
		outletid: formGet('select', 'outletid'), 
		cusfamilyname:$.trim(formGet('input','familyName')), 
		cusgivenname:$.trim(formGet('input','givenName')), 
		unit: $.trim(formGet('input','unit')), 
		street: $.trim(formGet('input', 'street')), 
		ward: $.trim(formGet('input', 'ward')), 
		province:formGet('select', 'provinceid'), 
		district:formGet('select', 'districtid'), 
		phone: $.trim(formGet('input', 'phone')), 
		consumername: $.trim(formGet('input', 'consumerName')), 
		dob:getDOB(), 
		compowderproduct:formGet('select','compowderproduct'), 
		comliquidproduct:formGet('select','comliquidproduct'), 
		abbpowderproduct:formGet('select','abbpowderproduct'), 
		abbliquidproduct:formGet('select','abbliquidproduct')
	};
	var valid = validateCustomer(data)
	if (valid == true) {
		var clientid = formGet('input', 'clientid')
		if (clientid != '') {
			CUSTOMERS.removeAt('clientid', clientid)	
		}
		CUSTOMERS.push(data)
		localStorage.customers = JSON.stringify(CUSTOMERS);
		return true
	} else {
		showError(valid.message)
		return false
	}
}

function formGet(tag, name, formSelector) {
	if (typeof formSelector == 'undefined')
		formSelector = '#addUser'
	var form = $(formSelector)
	return form.find(tag+'[name="'+name+'"]').val();
}
function countProduct(formSelector) {
	var form = $(formSelector+' input.inv-product')
	var products = []
	for(var i = 0; i<form.length; i++) {
		if (form.eq(i).val() != '') {
			products.push({
				productid: form.eq(i).attr('data-id'),
				qty: form.eq(i).val()
			})
		}
	}
	return products
}
function getDate(form_selector, input_name) {
	var form = $(form_selector)
	var d = form.find('select[name="'+input_name+'D"]').val()
	var m = form.find('select[name="'+input_name+'M"]').val()
	var y = form.find('select[name="'+input_name+'Y"]').val()	

	d = (d < 10 && d != '')? "0"+d : d
	m = (m < 10 && m != '')? "0"+m : m

	return d+m+y;
}
function validateCustomer(data) {
	var valid = {message:''}
	var filter = [
		{field:'outletid',label:'Cửa hàng', action:'chọn'}, 
		{field:'cusfamilyname', label:'họ khách hàng', action: 'nhập'}, 
		{field:'cusgivenname', label: 'tên khách hàng', action: 'nhập'}, 
		{field:'street', label:'đường', action:'nhập'},
		{field:'province', label:'Tỉnh/thành phố', action:'chọn'},
		{field:'district', label:'Quận/huyện', action: 'chọn'},
		{field:'phone', label:'Số điện thoại', action: 'nhập'}, 
		{field:'consumername', label:'họ tên người sử dụng', action:'nhập'}
	]
	for (var i = 0; i<filter.length; i++) {
		if (data[filter[i].field] == '') {
			valid.message += "<br/>● Chưa "+filter[i].action+" "+filter[i].label+" "
		}
	}
	
	if( !(data.phone.length == 10 || data.phone.length == 11) ) {
		valid.message += "<br/>● Số điện thoại không đúng"
	}

	var prevPowder 	= formGet('select','compowderproduct')
	var prevLiqid 	= formGet('select','comliquidproduct')

	var powder 	= formGet('select','abbpowderproduct')
	powder  		= ABBOTT_PRODUCTS.item(powder)
	var liqid  	= formGet('select','abbliquidproduct')
	liqid 	 		= ABBOTT_PRODUCTS.item(liqid)

	var dob = data.dob
	if (dob != '' && dob.length < 8) {
		valid.message += "<br/>● Ngày sinh chưa nhập chính xác. "
	}
	if ('' === prevPowder && '' === prevLiqid) {
		valid.message += "<br/>● Chưa chọn loại sữa trước đây."
	}		
	if (null === powder && null === liqid) {
		valid.message += "<br/>● Chưa chọn loại sữa hiện tại. "
	} else {
		if ( (isManProduct(powder) || isManProduct(liqid)) && dob=="" ) {
			valid.message += "<br/>● Ngày sinh bắt buộc nhập. "
		}
		if ( !isFutProduct(powder) && !isFutProduct(liqid) && dob != '') {
			var d = new Date();
			d.setDate(formGet('select', 'DOB_D'))
			d.setMonth(formGet('select', 'DOB_M') - 1)
			d.setYear(formGet('select', 'DOB_Y'))
			var currentDate = new Date()
			if (d > currentDate) 
				valid.message += "<br/>● Ngày sinh không thể trong tương lai. "
		}
	}

	//Another validate
	if (valid.message == '')
		return true
	valid.message = "Thông tin chưa hợp lệ:" + valid.message
	return valid;
}
function isManProduct(p) {
	if (null === p)
		return false
	if (p.isman == "Y")
		return true
	return false
}
function isFutProduct(p) {
	if (null === p)
		return false
	if (p.isfut == "Y")
		return true
	return false
}
function validateInventory(data) {
	var valid = {message:''}
	if (data.inventory.length == 0)
		valid.message += "<br/>● Chưa nhập số lượng. "
	if (data.outletid == '') {
		valid.message += "<br/>● Chưa chọn cửa hàng."
	}
	if (data.cycledate == '' || data.cycledate.length < 8){
		valid.message += "<br/>● Chưa chọn đúng ngày thống kê."
	} 

	var isNumberError = 0
	$('input.inv-product.alert').removeClass('alert')
	for(var i = 0; i < data.inventory.length; i++) {
		if (data.inventory[i].qty != parseInt(data.inventory[i].qty, 10)){
			if (isNumberError == 0)
				valid.message += "<br/>● Số lượng chưa đúng"
			var eleError = $('input.inv-product[data-id="'+data.inventory[i].productid+'"]')
			eleError.addClass('alert')			
			isNumberError = 1
		}
	}
	if (valid.message == '')
		return true
	valid.message = "Thông tin chưa hợp lệ:" + valid.message
	return valid;
}

function validateSellout(data) {
	var valid = {message:''}
	if (data.sellout.length == 0)
		valid.message += "<br/>● Chưa nhập số lượng. "
	if (data.outletid == '') {
		valid.message += "<br/>● Chưa chọn ngày thống kê."
	}
	if (data.cycledate == '' || data.cycledate.length < 8){
		valid.message += "<br/>● Chưa chọn ngày thống kê."
	} else {
		if (!checkDate(data.cycledate)) {
			valid.message += "<br/>● Chọn sai ngày thống kê."
		}
		var d = new Date();
		d.setDate(date2d(data.cycledate))
		d.setMonth(date2m(data.cycledate) - 1)
		d.setYear(date2y(data.cycledate))
		var currentDate = new Date()
		if (d > currentDate) {
			valid.message += "<br/>● Không thể chọn ngày trong tương lai"
		}
	}

	var isNumberError = 0
	$('input.inv-product.alert').removeClass('alert')
	for(var i = 0; i < data.sellout.length; i++) {
		if (data.sellout[i].qty != parseInt(data.sellout[i].qty, 10)){
			if (isNumberError == 0)
				valid.message += "<br/>● Số lượng chưa đúng"
			var eleError = $('input.inv-product[data-id="'+data.sellout[i].productid+'"]')
			eleError.addClass('alert')			
			isNumberError = 1
		}
	}
	if (valid.message == '')
		return true
	valid.message = "Thông tin chưa hợp lệ:" + valid.message
	return valid;
}

function createReportInventory() {
	var data = {
		clientid: makeid(8),
		userid: USER.userid,
		usersysid: USER.sysid,
		outletid: $('#addInventory select[name="outletid"]').val(),
		cycledate: formGet('select', 'inv_date', '#addInventory'),
		inventory: countProduct('#addInventory')
	}
	
	var valid = validateInventory(data)
	if (valid == true) {
		var clientid = formGet('input', 'clientid', '#addInventory')
		if (clientid != '') {
			INVENTORY.removeAt('clientid', clientid)	
		}
		INVENTORY.push(data)
		localStorage.inventory = JSON.stringify(INVENTORY);
		return true
	} else {
		showError(valid.message)
		return false
	}
}
function createReportSellout() {
	var data = {
		clientid: makeid(8),
		userid: USER.userid,
		usersysid: USER.sysid,
		outletid: $('#addSellout select[name="outletid"]').val(),
		cycledate: getDate('#addSellout','sellout'),
		sellout: countProduct('#addSellout')
	}

	var valid = validateSellout(data)
	if (valid == true) {
		var clientid = formGet('input', 'clientid', '#addSellout')
		if (clientid != '') {
			SELLOUT.removeAt('clientid', clientid)	
		}
		SELLOUT.push(data)
		localStorage.sellout = JSON.stringify(SELLOUT);
		return true
	} else {
		showError(valid.message)
		return false
	}
}
function formSet(tag, name, val, formSelector) {
	if (typeof formSelector == 'undefined')
		formSelector = '#addUser'
	$(formSelector).find(tag+'[name="'+name+'"]').val(val)	
}
function fillFormCustomer(id) {
	obj = CUSTOMERS.item('clientid', id)
	//render cua hang
	renderOptions('#addUser select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>', obj.outletid); 
	
	formSet('input', 'familyName', obj.cusfamilyname)
	formSet('input', 'givenName', obj.cusgivenname)
	formSet('input', 'unit', obj.unit)
	formSet('input', 'street', obj.street)
	formSet('input', 'ward', obj.ward)

	//render tinh thanh pho
	var tmp = uniqBy(PROVINCES, function(item) {return item.prov})	
  renderOptions('select[name="provinceid"]',tmp, 'prov', 'prov', '<option value="">Chọn tỉnh thành</option>', obj.province);

  //render quan huyen
	var province = PROVINCES.filter(function(item){return item.prov == this}, obj.province);
	renderOptions('select[name="districtid"]', province, 'dist', 'dist', '<option value="">Chọn quận huyện</option>', obj.district);

	formSet('input', 'phone', obj.phone)
	formSet('input', 'consumerName', obj.consumername)

  //render DOB
  renderSingleOptions('select[name="DOB_D"]',range(1,31),'<option value="">Ngày</option>',obj.dob.substr(0,2)*1)
  renderSingleOptions('select[name="DOB_M"]',range(1,12),'<option value="">Tháng</option>', obj.dob.substr(2,2)*1)
  renderSingleOptions('select[name="DOB_Y"]',range(1930, (new Date()).getFullYear() + 1).reverse(),'<option value="">Năm sinh</option>', obj.dob.substr(4,4))

  var comPowderMilk = COMPETITOR_PRODUCTS.filter(function(obj){return obj.type == 'P'})
  var comLiquidMilk = COMPETITOR_PRODUCTS.filter(function(obj){return obj.type == 'L'})
  var abbPowderMilk = ABBOTT_PRODUCTS.filter(function(obj){return obj.type == 'P'})
  var abbLiquidMilk = ABBOTT_PRODUCTS.filter(function(obj){return obj.type == 'L'})
	renderOptions('select[name="compowderproduct"]', [{id:'', name:'Chọn sữa bột'}].concat(comPowderMilk), 'id', 'name', '<option>Chọn sữa bột</option>',obj.compowderproduct);
	renderOptions('select[name="comliquidproduct"]', [{id:'', name:'Chọn sữa nước'}].concat(comLiquidMilk), 'id', 'name', '<option>Chọn sữa nước</option>',obj.comliquidproduct);
	renderOptions('select[name="abbpowderproduct"]', [{id:'', name:'Chọn sữa bột'}].concat(abbPowderMilk), 'id', 'name', '<option>Chọn sữa bột</option>',obj.abbpowderproduct);
	renderOptions('select[name="abbliquidproduct"]', [{id:'', name:'Chọn sữa nước'}].concat(abbLiquidMilk), 'id', 'name', '<option>Chọn sữa nước</option>',obj.abbliquidproduct);

	formSet('input', 'clientid', obj.clientid)

	$('#resetFormUser').hide()
	$('#deleteUser').show()
  $('.page.customer .nav-header').text('Cập nhật khách hàng')	
}

function fillTableData(data, formSelector) {
	var form = $(formSelector)
	for(var i = 0; i < data.length; i++) {
		form.find('input[data-id="'+data[i].productid+'"]').val(data[i].qty)
	}
}
function fillInventory(id) {
	obj = INVENTORY.item('clientid', id)

	renderOptions('#addInventory select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>', obj.outletid);
	renderOptions('select[name="inv_date"]',INV_DATE, 'cycledate','desc','<option value="">Ngày thống kê</option>', obj.cycledate)  

  //render data table
  if (!$('#addInventory').hasClass('isRendering')) {
  	renderTableData('#addInventory table tbody', NEMO_PRODUCTS.sort(compareNemo), 'id', 'name')  	
  	$('#addInventory').addClass('isRendering')
  }

  fillTableData(obj.inventory, '#addInventory')
  formSet('input', 'clientid', obj.clientid, '#addInventory')

  $('#resetFormInventory').hide()
  $('#deleteInventory').show()
  $('.page.inventory .nav-header').text('Cập nhật tồn kho')
}
function fillSellout(id) {

	var obj = SELLOUT.item('clientid', id)
	renderOptions('#addSellout select[name="outletid"]', OUTLETS, 'id', 'name', '<option value="">Chọn cửa hàng</option>', obj.outletid);

	//render DOB
  renderSingleOptions('select[name="selloutD"]',range(1,31),'<option value="">Ngày thống kê</option>', obj.cycledate.substr(0,2)*1)
  renderSingleOptions('select[name="selloutM"]',range(1,12),'<option value="">Tháng</option>', obj.cycledate.substr(2,2)*1)
  renderSingleOptions('select[name="selloutY"]',range((new Date()).getFullYear() - 1, (new Date()).getFullYear() + 1).reverse(),'<option value="">Năm</option>', obj.cycledate.substr(4,4))

  //render data table
  if (!$('#addSellout').hasClass('isRendering')) {
  	renderTableData('#addSellout table tbody', NEMO_PRODUCTS.sort(compareNemo), 'id', 'name')
  	$('#addSellout').addClass('isRendering')
	}
	fillTableData(obj.sellout, '#addSellout')	
	formSet('input', 'clientid', obj.clientid, '#addSellout')

	$('#resetFormSellout').hide()
  $('#deleteSellout').show()
  $('.page.sellout .nav-header').text('Cập nhật doanh số')
}
function syncUp() {
	var defCus 	= $.Deferred()
	var defInv	= $.Deferred()
	var defSel  = $.Deferred()
	var countToDetectLostInternet = 0
	var countBeforeSync = countData()
	var errorMsg = ''
	$("#statusText").text("Đang tải lên ...")
	showWait()
	$.when(defCus, defInv, defSel).then(function(){
		hideWait()
		if (errorMsg !== "") {
			errorMsg += "Số dữ liệu đã tải lên: "+ countData() +"/"+countBeforeSync
		} else {
			errorMsg  = "Số dữ liệu đã tải lên: "+ countBeforeSync+"/"+countBeforeSync
		}
		$("#statusText").text(errorMsg)
		if (countToDetectLostInternet == 3) {			
			$("#statusText").text("Không có kết nối Internet!")
		}
	})
	$.ajax({
    url: DOMAIN+'/SyncUpNewUserController',
    data: JSON.stringify({newuserrequest:CUSTOMERS.items('usersysid', USER.sysid)}),
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	RESPONSE = obj.newuserresponse
    	var flagErr = 0
    	for(var i = 0; i < RESPONSE.length; i++) {
    		if (RESPONSE[i].responsecode == "101" || RESPONSE[i].responsecode == "102") {
    			CUSTOMERS.updateAt('clientid', RESPONSE[i].clientid, 'syncuperror', true)
    			flagErr = 1
    		} else {
    			CUSTOMERS.removeAt('clientid', RESPONSE[i].clientid)
    		}
    	}
    	if (flagErr == 1) {
    		errorMsg = 'Có lỗi. '
    	} 
    	localStorage.customers = JSON.stringify(CUSTOMERS)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		}, 
		complete: function() {
    	defCus.resolve()			
		}
	});
	$.ajax({
    url: DOMAIN+'/SyncUpInventoryController',
    data: JSON.stringify({inventoryrequest:INVENTORY.items('usersysid', USER.sysid)}),
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	RESPONSE = obj.inventoryresponse
    	var flagErr = 0
    	for(var i = 0; i < RESPONSE.length; i++) {
    		if (RESPONSE[i].responsecode == "101" || RESPONSE[i].responsecode == "102") {
    			INVENTORY.updateAt('clientid', RESPONSE[i].clientid, 'syncuperror', true)
    			flagErr = 1
    		} else {
    			INVENTORY.removeAt('clientid', RESPONSE[i].clientid)
    		}
    	}
    	if (flagErr == 1) {
    		errorMsg = 'Có lỗi. '
    	}
    	localStorage.inventory = JSON.stringify(INVENTORY)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet
			console.log(status)
		}, 
		complete: function() {
    	defInv.resolve()
		}
	});	
	$.ajax({
    url: DOMAIN+'/SyncUpSelloutController',
    data: JSON.stringify({selloutrequest:SELLOUT.items('usersysid', USER.sysid)}),
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	RESPONSE = obj.selloutresponse
    	var flagErr = 0
    	for(var i = 0; i < RESPONSE.length; i++) {
    		if (RESPONSE[i].responsecode == "101" || RESPONSE[i].responsecode == "102") {
    			SELLOUT.updateAt('clientid', RESPONSE[i].clientid, 'syncuperror', true)
    			flagErr = 1
    		} else {
    			SELLOUT.removeAt('clientid', RESPONSE[i].clientid)
    		}
    	}
    	if (flagErr == 1) {
    		errorMsg = 'Có lỗi. '
    	}
    	localStorage.SELLOUT = JSON.stringify(SELLOUT)
		},
		error: function(xhr, status, error) {
			++countToDetectLostInternet			
			console.log(status)
		}, 
		complete: function() {
    	defSel.resolve()
		}
	});	
}
function checkAuthentication(callback) {
	$.ajax({
    url: DOMAIN+'/LoginValidationForSyncController',
    data: JSON.stringify({
			userid: USER.userid,
			password: USER.password
		}),
    method: 'POST',
    processData: false,
    contentType: 'application/json',
    crossDomain:true,
    success: function(data, status, xhr) {
    	var obj = JSON.parse(data)
    	if (obj.responsecode == '001') {
    		callback()
    	} else {
				$('#statusText').text('Thông tin đăng nhập đã thay đổi trên hệ thống. Vui lòng đăng xuất ứng dụng và đăng nhập lại.')
    	}
		},
		error: function(xhr, status, error) {
			$('#statusText').text('Không có kết nối Internet')
			console.log(status)
		}
	});	
}
function updateFeature() {
	$(ALL_ROLE.map(function(i){
		return '.ROLE_'+i
	}).join(',')).hide()
	if (null !== USER) {
		$(USER.funcs.map(function(i){
			return '.ROLE_'+i
		}).join(',')).show()
	}
}