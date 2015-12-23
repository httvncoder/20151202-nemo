/**
 * NEMO APP by Tua Hoang Nguyen
 * @author hoangtua.vn@gmail.com 
 * @skype hoangtua
 * @phone 0939.96.75.96
 * @company Cherry Vietnam
 */

var CUSTOMERS = [];

var INVENTORY = [];

var SELLOUT = [];

var INV_DATE = [];

var OUTLETS = [];

var PROVINCES = [];

var COMPETITOR_PRODUCTS = [];

var ABBOTT_PRODUCTS = [];

var NEMO_PRODUCTS = [];

var DOMAIN = "https://nemoapp.3anutrition.com:8443";

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

function initOnlineData() {
	if( !isLSEmpty('provinces') ) {
		PROVINCES = JSON.parse(localStorage.provinces)
		console.log('Load provinces.')
	}     
	if( !isLSEmpty('outlets') ) {
		OUTLETS = JSON.parse(localStorage.outlets)
		console.log('Load outlets.')
	}     
	if( !isLSEmpty('competitor_products') ) {
		COMPETITOR_PRODUCTS = JSON.parse(localStorage.competitor_products)
		console.log('Load competitor products.')
	}
	if( !isLSEmpty('abbott_products') ) {
		ABBOTT_PRODUCTS = JSON.parse(localStorage.abbott_products)
		console.log('Load abbott products.')
	}
	if( !isLSEmpty('nemo_products') ) {
		NEMO_PRODUCTS = JSON.parse(localStorage.nemo_products)
		console.log('Load nemo products.')
	}
	if( !isLSEmpty('inv_date') ) {
		INV_DATE = JSON.parse(localStorage.inv_date)
		console.log('Load nemo inventory date.')
	}
}
function initLocalData() {
	if( !isLSEmpty('domain') ) {
		DOMAIN = localStorage.domain
		console.log('Load domain: '+DOMAIN)
	}
	if( !isLSEmpty('customers') ) {
		CUSTOMERS = JSON.parse(localStorage.customers)
		console.log('Load customers.')
	}  
	if( !isLSEmpty('inventory') ) {
		INVENTORY = JSON.parse(localStorage.inventory)
		console.log('Load inventory.')
	}  
	if( !isLSEmpty('sellout') ) {
		SELLOUT = JSON.parse(localStorage.sellout)
		console.log('Load sellout.')
	}    
}
function isLSEmpty(key) {
	if(typeof localStorage[key] == 'undefined' || localStorage[key] == '')
		return true
	return false
}
function isDataReady() {
	if ( false 
		|| 0 == INV_DATE.length
		|| 0 == OUTLETS.length  
		|| 0 == PROVINCES.length  
		|| 0 == COMPETITOR_PRODUCTS.length  
		|| 0 == ABBOTT_PRODUCTS.length)
		return false
	return true
}
function uniqBy(a, key) {
	var seen = {};
	return a.filter(function(item) {
		var k = key(item);
		return seen.hasOwnProperty(k) ? false : (seen[k] = true);
	})
}
function range(start, end)
{
	var array = new Array();
	for(var i = start; i <= end; i++)
	{
		array.push(i);
	}
	return array;
}
function makeid(length)
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}
function compareNemo(a,b) {
  if (a.seq < b.seq)
	return -1
  if (a.seq > b.seq)
	return 1
  return 0
}
Array.prototype.sortOn = function(key) {
	this.sort(function(a,b){
		if(a[key] < b[key]){
			return -1
		}else if(a[key] > b[key]){
			return 1
		}
		return 0
	})
}

Array.prototype.item = function(key, value) {
	if (typeof value == 'undefined') {
		value = key
		key = 'id'
	}
	var obj = this.filter(function(item) {
		return item[this.key] == this.value
	}, {
		key: key,
		value: value
	})
	if (obj.length == 0)
		return null
	else if (obj.length == 1) 
		return obj[0]
	else 
		return obj
}
Array.prototype.items = function(key, value) {
	if (typeof value == 'undefined') {
		value = key
		key = 'id'
	}
	return this.filter(function(item) {
		return item[key] == value
	})
}

Array.prototype.removeAt = function(key, value) {
	if (typeof value == 'undefined') {
		value = key
		key = 'id'
	}
	for (var item in this) {
		if (this[item][key] == value) {
			this.splice(item, 1);
			return true;
		}
	}
	return false;
}
Array.prototype.updateAt = function(key, value, keyUp, valueUp) {
	for (var item in this) {
		if (this[item][key] == value) {
			this[item][keyUp] = valueUp
			return true;
		}
	}
	return false;
}
function vnDate(val) {
	return val.substr(0,2) + '/' + val.substr(2,2) + '/' + val.substr(4,4)
}

function deleteRecord(id, data) {
	window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?', function(buttonIndex){
		if (buttonIndex == 2)	//press cancle		
			return
		var result = window[data].removeAt('clientid', id)
		if (result == true) {
			localStorage[data.toLowerCase()] = JSON.stringify(window[data])
			$('div.row[data-id="'+id+'"]').remove()
			$('h3.ROLE_CAPTRNEWUSER span').text(' Danh sách khách hàng ('+CUSTOMERS.items('usersysid', USER.sysid).length+')')
			$('h3.ROLE_CAPTRINVENTORY span').text(' Danh sách tồn kho ('+INVENTORY.items('usersysid', USER.sysid).length+')')
			$('h3.ROLE_CAPTRPGSELLOUT span').text(' Danh sách doanh số ('+SELLOUT.items('usersysid', USER.sysid).length+')')
		}		
	})
}
function checkDate(strDate) {
	var d = date2d(strDate)
	var m = date2m(strDate)
	var y = date2y(strDate)
	var date = new Date(y,m-1,d);
	if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
	  return true
	}
	return false
}
function date2m(strDate){
	return parseInt(strDate.substr(2,2), 10)
}
function date2d(strDate) {
	return parseInt(strDate.substr(0,2), 10)
}
function date2y(strDate) {
	return parseInt(strDate.substr(4,4), 10)
}

function dataSizeRemaining() {
	return 1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length
}